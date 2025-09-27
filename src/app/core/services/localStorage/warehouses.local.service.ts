import { Injectable } from "@angular/core";
import { Warehouse } from "../../models/warehouse.model";
import { LocalStorageService } from "./local-storage.service";

@Injectable({providedIn: 'root'})
export class WarehouseLocalStorageService extends LocalStorageService<Warehouse> {
    constructor() {
        super('warehouses');
    }
}