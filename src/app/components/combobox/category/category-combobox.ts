import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { map, Observable, startWith } from "rxjs";
import { Category } from "../../../core/models/category.model";
import { CategoriesService } from "../../../core/services/categories.service";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from "@angular/material/input";
import { AsyncPipe } from "@angular/common";

@Component({
    selector: 'app-category-combobox',
    templateUrl: './category-combobox.html',
    standalone: true,
    imports: [FormsModule, MatAutocompleteModule, ReactiveFormsModule, MatInputModule, AsyncPipe],
})

export class CategoryCombobox {
    categoryControl = new FormControl('');
    categories : Category[] = [];
    filteredCategories: Observable<Category[]> = new Observable<Category[]>();
    categoryService = inject(CategoriesService);
    @Input() selectedCategory: Category | null = null;
    @Output() selectedCategoryChange = new EventEmitter<Category | null>();

    ngOnInit(): void {
        this.loadCategories();
        this.loadFilteredCategories();
    }

    loadCategories() {
        this.categoryService.getAll().subscribe(categories => {
            this.categories = categories;
            this.loadFilteredCategories();
        });
    }

    loadFilteredCategories() {
        this.filteredCategories = this.categoryControl.valueChanges.pipe(
            startWith(''),
            map(value => this._filterCategories(value || ''))
        );
    }

    private _filterCategories(value: string): Category[] {
        const filterValue = value.toLowerCase();
        return this.categories.filter(category => category.name.toLowerCase().includes(filterValue));
    }

    onCategoryChange(idCategory: string) {
        const selectedCategory = this.categories.find(c => c.id === idCategory);
        this.selectedCategory = selectedCategory ? selectedCategory : null;
        this.selectedCategoryChange.emit(this.selectedCategory ? this.selectedCategory : null);
    }

    clear(): void {
        this.selectedCategory = null;
        this.categoryControl.setValue('');
    }

    setCategoryById(id: string) {
        const category = this.categories.find(c => c.id === id);
        if (category) {
            this.categoryControl.setValue(category.name);
            this.selectedCategory = category;
            this.selectedCategoryChange.emit(category);
        } else {
            this.categoryControl.setValue('');
            this.selectedCategory = null;
            this.selectedCategoryChange.emit(null);
        }
    }
}