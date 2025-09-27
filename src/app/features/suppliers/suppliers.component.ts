import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Supplier } from '../../core/models/supplier.model';
import { MatCardModule } from "@angular/material/card";
import { MatTableModule } from "@angular/material/table";
import { MatDivider } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SuppliersService } from '../../core/services/suppliers.service';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatTableModule, MatDivider, MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: 'suppliers.component.html'
})
export class SuppliersComponent {
  suppliersService = inject(SuppliersService);
  dialog = inject(MatDialog);
  cdr = inject(ChangeDetectorRef);
  suppliers: Supplier[] = [];
  isLoading = false;
  pendingRequests = 0;
  phoneMask = ['(00) 00000-0000', '(00) 0000-0000'];

  current: Supplier = this.emptySupplier();
  displayedColumns: string[] = ['name', 'cnpj', 'phone', 'actions'];

  ngOnInit() {
    console.log('SuppliersComponent initialized');
    this.loadSuppliers();
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

  loadSuppliers() {
    this.setLoading();
    console.debug('Loading suppliers...');
    this.suppliersService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.cdr.detectChanges();
        console.debug('Suppliers loaded:', this.suppliers);
      },
      error: (err) => {
        console.error('Error loading suppliers:', err);
      },
      complete: () => this.setUnloading()
    });
  }

  emptySupplier(): Supplier {
    return { id: '', name: '', cnpj: '', phone: '', email: '', address: '' };
  }

  saveSupplier() {
    console.log('Saving supplier:', this.current);
    if (this.current.name.trim() === '' || this.current.cnpj.trim() === '') {
      alert('Por favor, preencha o nome e o CNPJ do fornecedor.');
      return;
    }
    if (this.current.id !== '') {
      this.suppliersService.update(this.current.id, { ...this.current }).subscribe({
        next: (s) => {
          console.debug('Supplier updated:', s);
        }
      });
    } else {
      this.suppliersService.create({ ...this.current }).subscribe({
        next: (s) => {
          console.debug('Supplier created:', s);
        }
      });
    }
    this.current = this.emptySupplier();
    this.loadSuppliers();
  }

  editSupplier(s: Supplier) {
    this.current = { ...s };
    console.log('Editing supplier:', this.current);
  }

  deleteSupplier(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Tem certeza que deseja deletar este Fornecedor?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.debug('Fornecedor deletado');
        this.suppliersService.delete(id).subscribe({
          next: () => {
            this.loadSuppliers();
          }
        });
      }
    });
  }
}
