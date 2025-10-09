import { ChangeDetectorRef, Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { Category } from "../../core/models/category.model";
import { MatDivider } from "@angular/material/divider";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MatInputModule } from "@angular/material/input";
import { CategoriesService } from "../../core/services/categories.service";
import { ConfirmDialogComponent } from "../../shared/dialogs/confirm-dialog.component";

@Component({
    selector: 'app-category',
    standalone: true,
    templateUrl: './category.component.html',
    imports: [CommonModule, FormsModule, MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule, MatDivider, MatInputModule],
})

export class CategoryComponent {
    categoryService = inject(CategoriesService)
    cdr = inject(ChangeDetectorRef);
    dialog = inject(MatDialog);
    isLoading = false;
    categories: Category[] = [];
    current: Category = { id: '', name: '' };
    displayedColumns: string[] = ['name', 'actions'];

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.isLoading = true;
        this.categoryService.getAll().subscribe(data => {
            this.categories = data;
            this.isLoading = false;
            this.cdr.detectChanges();
            console.log('Categories loaded:', this.categories);
        });
    }

    saveCategory() {
        console.log('Saving category:', this.current);
        if (this.current.name.trim() === '') {
            alert('Por favor, preencha o nome da categoria.');
            return;
        }

        if (this.current.id !== '') {
            this.categoryService.update(this.current.id, this.current).subscribe({
                next: () => {
                    console.log('Category updated:', this.current);
                    this.loadCategories();
                    this.current = { id: '', name: '' };
                },
                error: err => {
                    console.error('Error updating category', err);
                }
            });
        } else {
            this.categoryService.create(this.current).subscribe({
                next: () => {
                    console.log('Category created:', this.current);
                    this.loadCategories();
                    this.current = { id: '', name: '' };
                },
                error: err => {
                    console.error('Error creating category', err);
                }
            });
        }
    }

    editCategory(category: Category) {
        this.current = { ...category };
    }

    deleteCategory(category: Category) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirmar exclusão',
                message: `Tem certeza que deseja excluir a categoria "${category.name}"?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === true) {
                this.categoryService.delete(category.id).subscribe({
                    next: () => {
                        console.log('Category deleted:', category);
                        this.loadCategories();
                    },
                    error: err => {
                        console.error('Error deleting category', err);
                    }
                });
            }
        });
    }
}