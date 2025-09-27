import { Injectable } from "@angular/core";
import { LocalStorageService } from "./local-storage.service";
import { Sale } from "../../models/sale.model";
import { FinanceLocalStorageService } from "./finance.local.service";
import { StockLocalStorageService } from "./stock.local.service";

@Injectable({ providedIn: 'root' })
export class SalesLocalStorageService extends LocalStorageService<Sale> {
    constructor(
        private stock: StockLocalStorageService,
        private finance: FinanceLocalStorageService
    ) {
        super('sales');
    }

    registrarVenda(sale: Sale) {
        this.add(sale);

        sale.items.forEach(item => {
            this.stock.add({
                id: Date.now(),
                productId: item.productId,
                warehouseId: '1',
                quantity: item.quantity,
                date: new Date(),
                type: 'saida'
            });
        });

        this.finance.add({
            id: '',
            type: 'receber',
            description: `Venda #${sale.id}`,
            amount: sale.total,
            dueDate: sale.date,
            status: sale.status
        })
    }
}