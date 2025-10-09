import { Category } from "./category.model";
import { StockBalance } from "./stock.model";

export interface Product {
  id: string;
  name: string;
  price: number;
  minStockQuantity: number;
  stockBalances: StockBalance[];
  categoryId?: string;
  category: Category | null;
}
