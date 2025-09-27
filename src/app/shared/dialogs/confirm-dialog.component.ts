import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmDialogComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: { message: string },
        private dialogRef: MatDialogRef<ConfirmDialogComponent>
    ) {}

    onYes() {
        this.dialogRef.close(true);
    }

    onNo() {
        this.dialogRef.close(false);
    }
}