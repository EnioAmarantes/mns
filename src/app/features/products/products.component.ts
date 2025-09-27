import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { ProductsService } from '../../core/services/products.service';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatCardModule, MatListModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: 'products.component.html',
  styleUrls: ['products.component.scss'],
})
export class ProductsComponent implements OnInit {
  productsService = inject(ProductsService);
  dialog = inject(MatDialog);
  cdr = inject(ChangeDetectorRef);
  products: Product[] = [];
  isLoading = false;

  current: Product = { id: '', name: '', price: 0, minStockQuantity: 0, stockBalances: [] };
  displayedColumns: string[] = ['name', 'price', 'minStockQuantity', 'totalStock', 'actions'];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    console.debug('Loading products...');
    this.productsService.getAll().subscribe(data => {
      this.products = data;
      this.isLoading = false;
      this.cdr.detectChanges();
      console.log('Products loaded:', this.products);
    });
  }

  saveProduct() {
    console.log('Saving product:', this.current);
    if (this.current.name.trim() === '' || this.current.price <= 0) {
      alert('Por favor, preencha o nome e o preço do produto.');
      return;
    }
    if (this.current.id !== '') {
      this.productsService.update(this.current.id, { ...this.current }).subscribe(p => {
        console.debug('Product updated:', p);
        this.loadProducts();
      });
    } else {
      this.productsService.create({ ...this.current }).subscribe(p => {
        console.debug('Product created:', p);
        this.loadProducts();
      });
    }
    this.current = { id: '', name: '', price: 0, minStockQuantity: 0, stockBalances: [] };
  }

  editProduct(p: Product) {
    this.current = { ...p };
  }

  deleteProduct(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Tem certeza que deseja deletar este Produto?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productsService.delete(id).subscribe(() => {
          console.debug('Produto deletado');
          this.loadProducts();
        });
      }
    });
  }

  getRowClass(product: Product): string {
    const total = product.stockBalances.reduce((sum, sb) => sum + sb.quantity, 0);
    if (total === 0) return 'row-red';
    if (total <= product.minStockQuantity) return 'row-yellow';
    return '';
  }

  getBalanceTotal(product: Product): string {
    return product.stockBalances.reduce((sum, sb) => sum + sb.quantity, 0) + ' (' + product.stockBalances.map(sb => sb.warehouseName + ': ' + sb.quantity).join(', ') + ')';
  }
}
