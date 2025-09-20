import { computed, inject, Injectable, signal } from '@angular/core';
import { CreateTransactionRequest, Transaction } from '../models/transaction.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class TransactionService {
    private authService = inject(AuthService);

    private transactionsByUser = signal<Record<number, Transaction[]>>({
        1: [
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
                amount: 2000,
                note: 'Job salary',
                type: 'income',
                date: new Date('2025-01-01'),
            },
        ],
        2: [
            {
                id: 4,
                title: 'Garage',
                amount: 300,
                note: 'Repair the car',
                type: 'expense',
                date: new Date('2025-02-01'),
            },
            {
                id: 5,
                title: 'Flea market',
                amount: 156.84,
                note: 'Sells during flea market',
                type: 'income',
                date: new Date('2025-03-01'),
            },
            {
                id: 6,
                title: 'Salary',
                amount: 1426.3,
                note: 'Job salary',
                type: 'income',
                date: new Date('2025-01-01'),
            },
        ],

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
    });

    private getCurrentUserId(): number {
        const currentUserId = this.authService.getCurrentUser();
        if (!currentUserId) throw new Error('This user does not exist');
        return currentUserId.id;
    }

    async getAllTransactions(): Promise<Transaction[]> {
        return this.transactionsByUser()[this.getCurrentUserId()] || [];
    }

    public getTransactionById(id: number): Transaction | undefined {
        const currentUserId = this.getCurrentUserId();
        const userTransactions = this.transactionsByUser()[currentUserId] || [];
        return userTransactions.find((transaction) => transaction.id === id);
    }

    async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
        const currentUserId = this.getCurrentUserId();
        const newTransaction: Transaction = {
            id: Date.now(),
            title: transactionData.title,
            amount: transactionData.amount,
            note: transactionData.note,
            type: transactionData.type,
            date: new Date(transactionData.date),
        };

        this.transactionsByUser.update((state) => {
            const userTransactions = state[currentUserId] || [];
            return {
                ...state,
                [currentUserId]: [...userTransactions, newTransaction],
            };
        });

        return newTransaction;
    }

    async updateTransaction(
        id: number,
        transactionData: CreateTransactionRequest,
    ): Promise<Transaction> {
        let updatedTransaction: Transaction | null = null;
        const currentUserId = this.getCurrentUserId();

        this.transactionsByUser.update((transactions) => {
            const userTransactions = transactions[currentUserId] || [];
            const updatedTransactionsList = userTransactions.map((transaction) => {
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
            return { ...transactions, [currentUserId]: updatedTransactionsList };
        });

        if (!updatedTransaction) {
            throw new Error('Transaction not found');
        }

        return updatedTransaction;
    }

    async deleteTransaction(id: number) {
        const currentUserId = this.getCurrentUserId();
        this.transactionsByUser.update((transactions) => {
            const userTransactions = transactions[currentUserId] || [];
            return {
                ...transactions,
                [currentUserId]: userTransactions.filter((transaction) => transaction.id !== id),
            };
        });
    }

    // Return all the transactions sorted by date from nearest to farthest
    public computedTransactions = computed(() => {
        const currentUserId = this.getCurrentUserId();
        const userTransactions = this.transactionsByUser()[currentUserId] || [];
        return [...userTransactions].sort((a, b) => b.date.getTime() - a.date.getTime());
    });

    // Determine the total balance of an account
    public computedBalance = computed(() => {
        const currentUserId = this.getCurrentUserId();
        const userTransactions = this.transactionsByUser()[currentUserId] || [];
        const total = userTransactions.reduce(
            (cpt: number, transaction) =>
                cpt + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
            0,
        );

        return Math.round(total * 100) / 100;
    });
}
