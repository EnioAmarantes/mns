export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Sale {
  id: string;
  date: Date;
  items: SaleItem[];
  total: number;
  status: 'pago' | 'pendente';
}
