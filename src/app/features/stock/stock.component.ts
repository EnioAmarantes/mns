import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StockBalance, StockEntry } from '../../core/models/stock.model';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.model';
import { MatCardHeader, MatCardModule } from "@angular/material/card";
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CdkTableModule } from "@angular/cdk/table";
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from "@angular/material/table";
import { SuppliersService } from '../../core/services/suppliers.service';
import { Supplier } from '../../core/models/supplier.model';
import { WarehousesService } from '../../core/services/warehouses.service';
import { Warehouse } from '../../core/models/warehouse.model';
import { StockService } from '../../core/services/stock.service';
import { StockFilter } from '../../core/models/stock-filter.model';
import { MatDivider } from '@angular/material/divider';
import { MONTHS } from '../../core/models/months';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [FormsModule, DatePipe, MatCardHeader, MatCardModule, MatInputModule, MatButtonModule, CdkTableModule, MatListModule, MatSelectModule, MatTableModule, MatDivider, TitleCasePipe, MatIconModule, CommonModule],
  templateUrl: 'stock.component.html',
  styleUrls: ['stock.component.scss'],
})
export class StockComponent implements OnInit {
  cdr = inject(ChangeDetectorRef);
  stockService = inject(StockService);
  warehousesService = inject(WarehousesService);
  productsService = inject(ProductsService);
  suppliersService = inject(SuppliersService);

  warehouseName = '';
  filter: StockFilter = { type: '', year: new Date().getFullYear(), month: new Date().getMonth() + 1 };

  products: Product[] = [];
  suppliers: Supplier[] = [];
  warehouses: Warehouse[] = [];
  stocks: StockEntry[] = [];
  balances: StockBalance[] = [];

  stocksFiltered: StockEntry[] = [];
  isLoading = false;
  pendingRequests = 0;
  availableYears: number[] = [];
  availableMonths = MONTHS;

  movement: StockEntry = { id: 0, productId: '', warehouseId: '', quantity: 0, date: new Date(), type: 'entrada' };
  displayedColumns = ['date', 'product', 'warehouse', 'quantity', 'type', 'supplier'];

  ngOnInit() {
    console.log('StockComponent initialized');
    this.loadProducts();
    this.loadSuppliers();
    this.loadWarehouses();
    this.loadStocks();
    this.loadBalances();
    this.filterMoviments();
  }

  loadProducts() {
    this.setLoading();
    this.productsService.getAll().subscribe({
      next: data => {
        this.products = data;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading products', err);
      },
      complete: () => this.setUnloading()
    });
  }

  loadSuppliers() {
    this.setLoading();
    this.suppliersService.getAll().subscribe({
      next: data => {
        this.suppliers = data;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading suppliers', err);
      },
      complete: () => this.setUnloading()
    });
  }

  loadWarehouses() {
    this.setLoading();
    this.warehousesService.getAll().subscribe({
      next: data => {
        this.warehouses = data;
        this.movement.warehouseId = this.warehouses[0]?.id || '';
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading warehouses', err);
      },
      complete: () => this.setUnloading()
    });
  }

  loadStocks() {
    this.setLoading();
    this.stockService.getAll().subscribe({
      next: data => {
        this.stocks = data;
        this.stocksFiltered = data;
        this.availableYears = Array.from(
          new Set(this.stocks.filter(s => s.date).map(s => new Date(s.date).getFullYear()))
        );
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading stock entries', err);
      },
      complete: () => this.setUnloading()
    });
  }

  loadBalances() {
    this.setLoading();
    this.stockService.balances().subscribe({
      next: data => {
        this.balances = data;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading stock balances', err);
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

  addWarehouse() {
    this.warehousesService.create({ name: this.warehouseName }).subscribe(() => {
      this.warehousesService.getAll()
        .subscribe(warehouses => this.warehouses = warehouses);
        this.cdr.detectChanges();
    });
    this.warehouseName = '';
  }

  addMovement() {
    this.stockService.create(this.movement).subscribe(() => {
      this.stockService.getAll()
        .subscribe(stocks => this.stocks = stocks);
        this.cdr.detectChanges();
    });
    this.movement = { id: 0, productId: '', warehouseId: '', quantity: 0, date: new Date(), type: 'entrada' };
  }

  filterMoviments() {
    this.stocksFiltered = this.stocks
      .filter(s => this.filter.type === '' || s.type === this.filter.type)
      .filter(s => new Date(s.date).getFullYear() === this.filter.year)
      .filter(s => this.filter.month == 0 || new Date(s.date).getMonth() + 1 === this.filter.month);
    this.cdr.detectChanges();
  }

  onTypeChange() {
    if (this.movement.type === 'saida') {
      this.movement.supplierId = undefined;
    }
  }

  warehouseNameFn(id: string) {
    return this.warehouses.find(w => w.id === id)?.name ?? 'N/A';
  }

  productName(id: string) {
    return this.products.find(p => p.id === id)?.name ?? 'N/A';
  }

  supplierName(id?: string) {
    return this.suppliers.find(s => s.id === id)?.name ?? '';
  }

  getRowClass(stock: StockEntry): string {
    if (stock.type === 'saida') return 'row-green';
    if (stock.type === 'entrada') return 'row-blue';
    return '';
  }
}
