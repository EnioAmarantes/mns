import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { Sale, SaleItem } from '../../core/models/sale.model';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Product } from '../../core/models/product.model';
import { ProductsService } from '../../core/services/products.service';
import { SalesService } from '../../core/services/sales.service';
import { MatCardModule } from "@angular/material/card";
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, ReactiveFormsModule, DatePipe, CurrencyPipe, MatCardModule, MatCardModule, MatFormField, MatInputModule, MatSelectModule, MatButtonModule, MatTableModule, MatListModule, MatProgressSpinnerModule, MatAutocompleteModule, AsyncPipe],
  templateUrl: 'pdv.component.html'
})
export class PdvComponent implements OnInit{
  productsService = inject(ProductsService);
  salesService = inject(SalesService);
  cdr = inject(ChangeDetectorRef)
  isLoading = false;

  selectedProductId: string | null = null;
  quantity: number = 1;

  products: Product[] = [];
  productControl = new FormControl('');
  filteredProducts: Observable<Product[]> = new Observable<Product[]>();
  sales: Sale[] = [];

  pendingRequests = 0;

  ngOnInit() {
    console.log('PDV Component initialized');
    this.loadProducts();
    this.loadSales();
    this.loadFilteredProducts();
  }

  loadFilteredProducts() {
    this.filteredProducts = this.productControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterProducts(value || ''))
    );
  }

  private _filterProducts(value: string): Product[] {
    const filterValue = value.toLowerCase();
    return this.products.filter(product => product.name.toLowerCase().includes(filterValue));
  }

  loadProducts() {
    this.setLoading();
    this.productsService.getAll().subscribe({
      next: data => {
        this.products = data;
        this.productControl.setValue(this.productControl.value || '');
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading products', err);
      },
      complete: () => this.setUnloading()
    });
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
    let product = this.products.find(p => p.id === this.selectedProductId);
    if (!product){
      alert('Produto inválido');
      return;
    }

    const item: SaleItem = {
      id: '',
      productId: product.id,
      quantity: this.quantity,
      price: product.price
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

    this.selectedProductId = null;
    this.productControl.setValue('');
    this.loadFilteredProducts()
    this.quantity = 1;
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
    return this.products.find(p => p.id === id)?.name ?? 'N/A';
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
