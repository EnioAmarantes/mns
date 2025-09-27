import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceEntry } from '../../core/models/finance.model';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FinanceService } from '../../core/services/finance.service';
import { MatTableModule } from '@angular/material/table';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FinanceFilter } from '../../core/models/finance-filter.model';

@Component({
  selector: 'app-financial',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe, MatCardModule, MatInputModule, MatSelectModule, MatButtonModule, MatTableModule, MatDatepickerModule, MatProgressSpinnerModule, MatDividerModule, CommonModule],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  templateUrl: 'finance.component.html',
  styleUrls: ['finance.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FinancialComponent implements OnInit {
  financesService = inject(FinanceService);
  dialog = inject(MatDialog);
  cdr = inject(ChangeDetectorRef);
  finances: FinanceEntry[] = [];
  filteredFinances: FinanceEntry[] = [];
  isLoading = false;
  pendingRequests = 0;

  filter: FinanceFilter = { type: '', status: '' };

  current: FinanceEntry = { id: '', type: 'pagar', description: '', amount: 0, dueDate: new Date(), status: 'pendente' };
  displayedColumns: string[] = ['type', 'description', 'amount', 'dueDate', 'status', 'actions'];

  ngOnInit() {
    console.log('FinancialComponent initialized');
    this.loadFinances();
  }

  setLoading(){
    this.pendingRequests++;
    this.isLoading = true;
  }

  setUnloading(){
    this.pendingRequests--;
    if (this.pendingRequests <= 0) {
      this.isLoading = false;
      console.log('Loading is completed');
      this.pendingRequests = 0;
      this.cdr.markForCheck();
    }
  }

  loadFinances() {
    this.setLoading();
    this.financesService.getAll().subscribe({
      next: (data) => {
        this.finances = data;
        this.filteredFinances = data;
        this.cdr.detectChanges();
        console.debug('Finances loaded:', this.finances);
      },
      error: (err) => {
        console.error('Error loading finances:', err);
      },
      complete: () => {
        this.setUnloading();
      }
   });
  }

  save() {
    console.log('Saving finance entry:', this.current);
    if (this.current.description.trim() === '' || this.current.amount <= 0 || !this.current.dueDate) {
      alert('Por favor, preencha a descrição, o valor e a data de vencimento.');
      return;
    }
    if (this.current.id) {
      this.financesService.update(this.current.id, { ...this.current }).subscribe({
        next: (f) => {
          console.debug('Finance entry updated:', f);
          const index = this.finances.findIndex(fin => fin.id === f.id);
          console.debug('Updating local entry at index:', index);
          if (index >= 0) {
            this.finances[index] = { ...f };
          }
          this.current = { id: '', type: 'pagar', description: '', amount: 0, dueDate: new Date(), status: 'pendente' };
          this.cdr.markForCheck();
        }
      });
    } else {
      this.financesService.create({ ...this.current }).subscribe({
        next: (f) => {
          console.debug('Finance entry created:', f);
          this.finances = [...this.finances, f];
          this.current = { id: '', type: 'pagar', description: '', amount: 0, dueDate: new Date(), status: 'pendente' };
          this.cdr.markForCheck();
        }
      });
    }
  }

  edit(f: FinanceEntry) {
    this.current = { ...f };
  }

  delete(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Tem certeza que deseja excluir este lançamento financeiro?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.financesService.delete(id).subscribe({
          next: () => {
            console.debug('Finance entry deleted:', id);
          }
        });
      }
    });
    this.loadFinances();
  }

  totalAPagar() {
    return this.filteredFinances.filter(f => f.type === 'pagar').reduce((acc, f) => acc + f.amount, 0);
  }

  totalPago() {
    return this.filteredFinances.filter(f => f.type === 'pagar' && f.status === 'pago').reduce((acc, f) => acc + f.amount, 0);
  }

  totalAReceber() {
    return this.filteredFinances.filter(f => f.type === 'receber').reduce((acc, f) => acc + f.amount, 0);
  }

  totalRecebido() {
    return this.filteredFinances.filter(f => f.type === 'receber' && f.status === 'pago').reduce((acc, f) => acc + f.amount, 0);
  }

  filterFinances() {
    this.filteredFinances = this.finances
      .filter(f => this.filter.type === '' || f.type === this.filter.type)
      .filter(f => this.filter.status === '' || f.status === this.filter.status);
    this.cdr.markForCheck();
  }

  getRowClass(finance: FinanceEntry): string {
    if (finance.status === 'pendente'){
      const due = new Date(finance.dueDate).setHours(0,0,0,0);
      const today = new Date().setHours(0,0,0,0);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).setHours(0,0,0,0);

      if (due < today) return 'row-red';
      if (due >= today && due <= nextWeek) return 'row-yellow';
    }

    if (finance.status === 'pago') return 'row-green';
    return '';
  }
}
