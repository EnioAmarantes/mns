import { NullCategory } from "./category.null";

export class NullProduct {
    id = '';
    name = '';
    price = 0;
    minStockQuantity = 0;
    stockBalances = [];
    categoryId = undefined;
    category = new NullCategory();
}