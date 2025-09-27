import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

import { ProductsComponent } from '../products/products.component';
import { SuppliersComponent } from '../suppliers/suppliers.component';
import { StockComponent } from '../stock/stock.component';
import { FinancialComponent } from '../finances/finance.component';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models/product.model';
import { Supplier } from '../../core/models/supplier.model';
import { SuppliersService } from '../../core/services/suppliers.service';
import { FinanceService } from '../../core/services/finance.service';
import { FinanceEntry } from '../../core/models/finance.model';
import { StockService } from '../../core/services/stock.service';
import { StockBalance, StockEntry } from '../../core/models/stock.model';
import { Sale } from '../../core/models/sale.model';
import { SalesService } from '../../core/services/sales.service';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [ProductsComponent, SuppliersComponent, StockComponent, FinancialComponent]
})
export class DashboardComponent implements OnInit {
  productsService = inject(ProductsService);
  suppliersService = inject(SuppliersService);
  stockService = inject(StockService);
  financeService = inject(FinanceService);
  salesService = inject(SalesService);
  cdr = inject(ChangeDetectorRef);
  isLoading = false;

  products: Product[] = [];
  suppliers: Supplier[] = [];
  finances: FinanceEntry[] = [];
  stocks: StockEntry[] = [];
  balances: StockBalance[] = [];
  sales: Sale[] = [];

  pendingRequests = 0;

  ngOnInit() {
    console.debug('DashboardComponent initialized');
    this.loadProducts();
    this.loadSuppliers();
    this.loadFinances();
    this.loadStocks();
    this.loadBalances();
    this.loadSales();
  }

  loadProducts() {
    this.setLoading();
    this.productsService.getAll().subscribe({
      next: data => {
        this.products = data;
        this.cdr.detectChanges();
        console.debug('Products loaded', data);
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
        console.debug('Suppliers loaded', data);
      },
      error: err => {
        console.error('Error loading suppliers', err);
      },
      complete: () => this.setUnloading()
    });
  }

  loadFinances() {
    this.setLoading();
    this.financeService.getAll().subscribe({
      next: data => {
        this.finances = data;
        this.cdr.detectChanges();
        console.debug('Finances loaded', data);
      },
      error: err => {
        console.error('Error loading finances', err);
      },
      complete: () => this.setUnloading()
    });
  }

  loadStocks() {
    this.setLoading();
    this.stockService.getAll().subscribe({
      next: data => {
        this.stocks = data;
        this.cdr.detectChanges();
        console.debug('Stocks loaded', data);
      },
      error: err => {
        console.error('Error loading stocks', err);
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
        console.debug('Balances loaded', data);
      },
      error: err => {
        console.error('Error loading balances', err);
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
        console.debug('Sales loaded', data);
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

  get totalProdutos() {
    return this.products.length;
  }

  get totalFornecedores() {
    return this.suppliers.length;
  }

  get totalMovimentos() {
    return this.stocks.length;
  }

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } }
  };

  // Estoque atual (bar chart)
  get estoqueData(): ChartConfiguration<'bar'>['data'] {
    const labels = this.products.map(p => p.name);
    const values = labels.map(name => {
      const prod = this.products.find(p => p.name === name);
      const saldo = this.balances.filter(b => b.productId == prod?.id).reduce((acc, b) => acc + b.quantity, 0);
      return saldo;
    });

    return {
      labels,
      datasets: [
        { data: values, label: 'Qtd em Estoque', backgroundColor: '#1976d2' }
      ]
    };
  }

  // Movimentos por mês (line chart)
  get movimentoData(): ChartConfiguration<'line'>['data'] {
    const movimentos = this.stocks;
    const entradasMap = new Map<string, number>();
    const saidasMap = new Map<string, number>();

    movimentos.forEach(m => {
      const mesAno = `${m.date ? new Date(m.date).getMonth() + 1 : 0}/${new Date(m.date).getFullYear()}`;
      if (m.type == 'entrada') {
        entradasMap.set(mesAno, (entradasMap.get(mesAno) ?? 0) + m.quantity);
      } else {
        saidasMap.set(mesAno, (saidasMap.get(mesAno) ?? 0) + m.quantity);
      }
    });

    const labels = Array.from(new Set([...entradasMap.keys(), ...saidasMap.keys()])).sort();

    return {
      labels,
      datasets: [
        { data: labels.map(l => entradasMap.get(l) ?? 0), label: 'Entradas', borderColor: '#43a047', fill: false },
        { data: labels.map(l => saidasMap.get(l) ?? 0), label: 'Saídas', borderColor: '#e53935', fill: false }
      ]
    };
  }

  get totalPagar() {
    return this.finances.filter(f => f.type === 'pagar').reduce((acc, f) => acc + f.amount, 0);
  }

  get totalReceber() {
    return this.finances.filter(f => f.type === 'receber').reduce((acc, f) => acc + f.amount, 0);
  }

  get fluxoCaixaData(): ChartConfiguration<'bar'>['data'] {
    return {
      labels: ['Fluxo de Caixa'],
      datasets: [
        { data: [this.totalReceber], label: 'A Receber', backgroundColor: '#43a047' },
        { data: [this.totalPagar], label: 'A Pagar', backgroundColor: '#e53935' }
      ]
    };
  }
  get totalVendas() {
    return this.sales.length;
  }

  get vendasReceita() {
    return this.sales.reduce((acc, v) => acc + v.total, 0);
  }
}
