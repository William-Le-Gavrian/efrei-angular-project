import { computed, Injectable, signal } from '@angular/core';
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
            date: new Date('2025-02-01'),
        },
        {
            id: 2,
            title: 'Groceries',
            amount: 55.84,
            note: '',
            type: 'expense',
            date: new Date('2025-03-01'),
        },
        {
            id: 3,
            title: 'Salary',
            amount: 1500.64,
            note: 'Job salary',
            type: 'income',
            date: new Date('2025-01-01'),
        },
        // {
        //     id: 4,
        //     title: 'Store',
        //     amount: 10.99,
        //     note: 'Bought a t-shirt',
        //     type: 'expense',
        //     date: new Date('2025-02-01'),
        // },
        // {
        //     id: 5,
        //     title: 'Groceries',
        //     amount: 55.84,
        //     note: '',
        //     type: 'expense',
        //     date: new Date('2025-03-01'),
        // },
        // {
        //     id: 6,
        //     title: 'Salary',
        //     amount: 1500.64,
        //     note: 'Job salary',
        //     type: 'income',
        //     date: new Date('2025-01-01'),
        // },
        // {
        //     id: 7,
        //     title: 'Store',
        //     amount: 10.99,
        //     note: 'Bought a t-shirt',
        //     type: 'expense',
        //     date: new Date('2025-02-01'),
        // },
        // {
        //     id: 8,
        //     title: 'Groceries',
        //     amount: 55.84,
        //     note: '',
        //     type: 'expense',
        //     date: new Date('2025-03-01'),
        // },
        // {
        //     id: 9,
        //     title: 'Salary',
        //     amount: 1500.64,
        //     note: 'Job salary',
        //     type: 'income',
        //     date: new Date('2025-01-01'),
        // },
    ]);

    async getAllTransactions(): Promise<Transaction[]> {
        return this.transactions();
    }

    public getTransactionById(id: number): Transaction | undefined {
        return this.transactions().find((transaction) => transaction.id === id);
    }

    async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
        const newTransaction: Transaction = {
            id: Date.now(),
            title: transactionData.title,
            amount: transactionData.amount,
            note: transactionData.note,
            type: transactionData.type,
            date: new Date(transactionData.date),
        };

        this.transactions.update((transactions) => [...transactions, newTransaction]);
        return newTransaction;
    }

    async updateTransaction(
        id: number,
        transactionData: CreateTransactionRequest,
    ): Promise<Transaction> {
        let updatedTransaction: Transaction | null = null;

        this.transactions.update((transactions) => {
            return transactions.map((transaction) => {
                if (transaction.id === id) {
                    updatedTransaction = {
                        ...transaction,
                        ...transactionData,
                        date: new Date(transactionData.date),
                    };
                    return updatedTransaction;
                }
                return transaction;
            });
        });

        if (!updatedTransaction) {
            throw new Error('Transaction not found');
        }

        return updatedTransaction;
    }

    async deleteTransaction(id: number) {
        this.transactions.update((transactions) => {
            return transactions.filter((transaction) => transaction.id !== id);
        });
    }

    // Return all the transactions sorted by date from nearest to farthest
    public computedTransactions = computed(() => {
        return [...this.transactions()].sort((a, b) => b.date.getTime() - a.date.getTime());
    });
}
