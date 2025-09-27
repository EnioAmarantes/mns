import { Injectable } from "@angular/core";
import { LocalStorageService } from "./local-storage.service";
import { Supplier } from "../../models/supplier.model";

@Injectable({providedIn: 'root'})
export class SupplierLocalsService extends LocalStorageService<Supplier> {
    constructor() {
        super('suppliers');
    }
}