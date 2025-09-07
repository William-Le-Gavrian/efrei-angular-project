import { computed, Injectable, Signal, signal } from '@angular/core';
import { CreateTransactionRequest, Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactions = signal<Transaction[]>([
    {
      id: 1,
      title: 'Store',
      amount: 10.99,
      note: 'Bought a t-shirt',
      type: 'expense',
      date: new Date(),
    },
    {
      id: 2,
      title: 'Groceries',
      amount: 55.84,
      note: '',
      type: 'expense',
      date: new Date(),
    },
    {
      id: 3,
      title: 'Salary',
      amount: 1500.64,
      note: 'Job salary',
      type: 'income',
      date: new Date(),
    },
  ]);

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactions();
  }

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: Date.now(),
      title: transactionData.title,
      amount: transactionData.amount,
      note: transactionData.note,
      type: transactionData.type,
      date: transactionData.date,
    };

    this.transactions.update((transactions) => [...transactions, newTransaction]);
    return newTransaction;
  }

  public computedTransactions: Signal<Transaction[]> = computed(() => this.transactions());
}
