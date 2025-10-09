import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Sale, SaleItem } from '../../core/models/sale.model';
import { DatePipe } from '@angular/common';
import { Product } from '../../core/models/product.model';
import { SalesService } from '../../core/services/sales.service';
import { MatCardModule } from "@angular/material/card";
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ProductCombobox } from "../../components/combobox/product/product-combobox";
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, ReactiveFormsModule, DatePipe, MatCardModule, MatCardModule, MatFormField, MatInputModule, MatSelectModule, MatButtonModule, MatTableModule, MatListModule, MatProgressSpinnerModule, MatAutocompleteModule, ProductCombobox],
  templateUrl: 'pdv.component.html'
})
export class PdvComponent implements OnInit{
  salesService = inject(SalesService);
  cdr = inject(ChangeDetectorRef)
  isLoading = false;

  selectedProduct: Product | null = null;
  quantity: number = 1;

  sales: Sale[] = [];

  pendingRequests = 0;
  @ViewChild('productCombobox') productCombobox: ProductCombobox = new ProductCombobox();

  ngOnInit() {
    console.log('PDV Component initialized');
    this.loadSales();
  }

  loadSales() {
    this.setLoading();
    this.salesService.getAll().subscribe({
      next: data => {
        this.sales = data;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading sales', err);
      },
      complete: () => this.setUnloading()
    });
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

  current: Sale = {
    id: '',
    date: new Date(),
    items: [],
    total: 0,
    status: 'pago'
  };

  addItem() {
    if (!this.selectedProduct) {
      alert('Produto inválido');
      return;
    }

    const item: SaleItem = {
      id: '',
      productId: this.selectedProduct.id,
      productName: this.selectedProduct.name,
      quantity: this.quantity,
      price: this.selectedProduct.price
    };

    if (this.current.items.some(i => i.productId === item.productId)) {
      const existingItem = this.current.items.find(i => i.productId === item.productId);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      }
    } else {
      this.current.items.push(item);
    }

    this.recalculateTotal();

    this.selectedProduct = null;
    this.quantity = 1;
    this.productCombobox.clear();
  }

  removeItem(id: string) {
    const index = this.current.items.findIndex(i => i.productId === id);
    this.current.items.splice(index, 1);
    this.recalculateTotal();
  }

  recalculateTotal() {
    this.current.total = this.current.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  }

  productName(id: string) {
    return this.current.items.find(i => i.productId == id)?.productName ?? 'N/A';
  }

  finalizarVenda() {
    this.setLoading();
    this.salesService.create(this.current).subscribe({
      next: (newSale) => {
        console.log('Venda registrada:', newSale);
        this.sales.push(newSale);
        this.current = { id: '', date: new Date(), items: [], total: 0, status: 'pago' };
      },
      error: (err) => {
        console.error('Error finalizing sale', err);
      },
      complete: () => this.setUnloading()
    });
  }
}
