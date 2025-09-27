import { Injectable } from "@angular/core";
import { FinanceEntry } from "../../models/finance.model";
import { LocalStorageService } from "./local-storage.service";

@Injectable({providedIn: 'root'})
export class FinanceLocalStorageService extends LocalStorageService<FinanceEntry> {
    constructor() {
        super('finance');
    }
    
    getPendencies() {
        return this.getAll().filter(f => f.status === 'pendente');
    }

    getPagos() {
        return this.getAll().filter(f => f.status === 'pago');
    }
}