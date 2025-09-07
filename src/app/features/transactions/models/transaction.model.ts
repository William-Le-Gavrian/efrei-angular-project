export interface Transaction {
  id: number;
  title: string;
  amount: number;
  note?: string;
  type: 'income' | 'expense';
  date: Date;
}

export interface CreateTransactionRequest {
  title: string;
  amount: number;
  note?: string;
  type: 'income' | 'expense';
  date: Date;
}
