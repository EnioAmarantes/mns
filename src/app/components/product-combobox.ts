import { CommonModule, AsyncPipe, CurrencyPipe } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { Product } from "../core/models/product.model";
import { map, Observable, startWith } from "rxjs";
import { ProductsService } from "../core/services/products.service";

@Component({
    selector: 'app-product-combobox',
    templateUrl: './product-combobox.html',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatOptionModule, MatProgressSpinnerModule, AsyncPipe],
    providers: [CurrencyPipe]
})

export class ProductCombobox implements OnInit {
    productControl = new FormControl('');
    products : Product[] = [];
    filteredProducts: Observable<Product[]> = new Observable<Product[]>();
    productService = inject(ProductsService);
    @Input() selectedProduct: Product | null = null;
    @Output() selectedProductChange = new EventEmitter<Product | null>();

    ngOnInit(): void {
        this.loadProducts();
        this.loadFilteredProducts();
    }

    loadProducts() {
        this.productService.getAll().subscribe({
            next: data => {
                this.products = data;
                this.productControl.setValue(this.productControl.value || '');
            },
            error: err => {
                console.error('Error loading products', err);
            }
        });
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

    onProductChange(idProduct: string) {
        const selectedProduct = this.products.find(p => p.id === idProduct);
        this.selectedProduct = selectedProduct ? selectedProduct : null;
        this.selectedProductChange.emit(this.selectedProduct ? this.selectedProduct : null);
    }

    clear(): void {
        this.selectedProduct = null;
        this.productControl.setValue('');
    }
}