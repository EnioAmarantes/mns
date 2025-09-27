export interface FinanceEntry {
  id: string;
  type: 'pagar' | 'receber';
  description: string;
  amount: number;
  dueDate: Date;
  status: 'pendente' | 'pago';
}
