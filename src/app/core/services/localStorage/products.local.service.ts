import { Injectable } from "@angular/core";
import { LocalStorageService } from "./local-storage.service";
import { Product } from "../../models/product.model";

@Injectable({providedIn: 'root'})
export class ProductsLocalService extends LocalStorageService<Product> {
    constructor() {
        super('products');
    }
}