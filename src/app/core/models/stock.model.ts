export interface StockEntry {
  id: number;
  productId: string;
  warehouseId: string;
  supplierId?: string;   // só preenchido em entradas
  quantity: number;
  date: Date;
  type: 'entrada' | 'saida';
}

export interface StockBalance {
  productId: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
}
