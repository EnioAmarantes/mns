import { inject, Injectable, signal } from "@angular/core";
import { LocalStorageService } from "./local-storage.service";
import { StockBalance, StockEntry } from "../../models/stock.model";
import { WarehouseLocalStorageService } from "./warehouses.local.service";

@Injectable({providedIn: 'root'})
export class StockLocalStorageService extends LocalStorageService<StockEntry> {
    balances = signal<StockBalance[]>([]);
    wharehouses = inject(WarehouseLocalStorageService)
    
    constructor() {
        super('stocks');
        this.recalculateBalances();
    }

    override add(item: StockEntry) {
        super.add(item);
        this.recalculateBalances();
    }

    override update(id: number, newItem: StockEntry) {
        super.update(id, newItem);
        this.recalculateBalances();
    }

    override delete(id: number) {
        super.delete(id);
        this.recalculateBalances();
    }

    private recalculateBalances() {
        const balances: StockBalance[] = [];
        for (const m of this.getAll()) {
        const idx = balances.findIndex(b => b.productId == m.productId && b.warehouseId == String(m.warehouseId));
        if (idx > -1) {
            balances[idx].quantity += m.type === 'entrada' ? m.quantity : -m.quantity;
        } else {
            balances.push({
            productId: m.productId,
            warehouseId: String(m.warehouseId),
            warehouseName: this.wharehouses.getAll().find(w => w.id === String(m.warehouseId))?.name || 'N/D',
            quantity: m.type === 'entrada' ? m.quantity : -m.quantity
            });
        }
        }
        this.balances.set(balances);
    }
}