import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CreateTransactionRequest, Transaction } from '../../models/transaction.model';
import { TransactionTypePipe } from '../../../../shared/pipes/transactionType.pipe';
import { DatePipe } from '@angular/common';
import { TransactionChartComponent } from '../transaction-chart/transaction-chart.component';
import { BalancePipe } from '../../../../shared/pipes/balance.pipe';

@Component({
    selector: 'app-transaction',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        TransactionTypePipe,
        DatePipe,
        TransactionChartComponent,
        BalancePipe,
        // RouterLink
    ],
    template: `
        <div class="container">
            <div class="row">
                <app-transaction-chart class="col-12"></app-transaction-chart>
            </div>

            <div class="fs-3 text-center text-{{ transactionService.computedBalance() | balance }}">
                Total balance:
                <span class="fw-medium">{{ transactionService.computedBalance() }}</span> €
            </div>

            <div class="add-transaction-form my-5 border p-4 rounded-4 shadow">
                <h3 class="fs-4 fw-bold">Add a transaction</h3>
                <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
                    <div class="row my-4">
                        <!--Transaction Type-->
                        <div class="col-12 col-lg-4">
                            <label for="type-wrapper" class="form-label fw-medium fs-5">Type</label>
                            <div class="d-flex gap-3" id="type-wrapper">
                                <div class="d-flex gap-2">
                                    <input
                                        type="radio"
                                        class="form-check-input"
                                        id="income"
                                        value="income"
                                        formControlName="type"
                                    />
                                    <label for="income" class="form-check-label">Income</label>
                                </div>
                                <div class="d-flex gap-2">
                                    <input
                                        type="radio"
                                        class="form-check-input"
                                        id="expense"
                                        value="expense"
                                        formControlName="type"
                                    />
                                    <label for="expense" class="form-check-label">Expense</label>
                                </div>
                            </div>
                        </div>
                        <!--Transaction Amount-->
                        <div class="col-12 col-lg-4">
                            <label for="amount" class="form-label fw-medium fs-5"
                                >Amount <span class="fs-6 text-muted">(€)</span></label
                            >
                            <input
                                type="number"
                                class="form-control"
                                id="amount"
                                step="0.01"
                                formControlName="amount"
                            />
                        </div>
                        <!--Transaction Date-->
                        <div class="col-12 col-lg-4">
                            <label for="date" class="form-label fw-medium fs-5">Date</label>
                            <input
                                type="date"
                                class="form-control"
                                id="date"
                                formControlName="date"
                            />
                        </div>
                    </div>

                    <div class="row my-3">
                        <div class="col-12 col-lg-4">
                            <label for="title" class="form-label fw-medium fs-5">Title</label>
                            <input
                                type="text"
                                class="form-control"
                                id="title"
                                formControlName="title"
                            />
                        </div>

                        <div class="col-12 col-lg-8">
                            <label for="note" class="form-label fw-medium fs-5"
                                >Note <span class="fs-6 text-muted">(optionnal)</span></label
                            >
                            <input
                                type="text"
                                class="form-control"
                                id="note"
                                formControlName="note"
                            />
                        </div>
                    </div>

                    <div class="d-flex gap-3">
                        @if (-1 !== editingTransaction()) {
                            <button
                                class="btn btn-danger"
                                type="button"
                                (click)="cancelEditTransaction()"
                            >
                                Cancel
                            </button>
                            <button class="btn btn-primary" type="submit">
                                Update Transaction
                            </button>
                        } @else {
                            <button class="btn btn-primary" type="submit">Add transaction</button>
                        }
                    </div>
                </form>
            </div>

            <ul
                class="transactions-list my-5 overflow-y-auto list-unstyled"
                style="max-height: 400px"
            >
                <li class="row position-sticky top-0 bg-white">
                    <div class="col-3 fs-5 fw-medium">Title</div>
                    <div class="col-2 fs-5 fw-medium">Amount</div>
                    <div class="col-4 fs-5 fw-medium">Note</div>
                    <div class="col-2 fs-5 fw-medium">Date</div>
                    <div class="col-1 fs-5 fw-medium">Actions</div>
                </li>
                @for (
                    transaction of transactionService.computedTransactions();
                    track transaction.id
                ) {
                    <li
                        class="row align-items-center"
                        [class.bg-primary-subtle]="$even"
                        style="height: 3rem"
                    >
                        <div class="col-3 fw-medium fs-5">{{ transaction.title }}</div>
                        <div
                            class="col-2 fw-medium text-{{
                                (transaction.type | transactionType).color
                            }}"
                        >
                            {{ transaction.amount }}
                            €
                        </div>
                        <div class="col-4">{{ transaction.note }}</div>
                        <div class="col-2">{{ transaction.date | date: 'dd/MM/yyyy' }}</div>
                        <div class="col-1 d-flex gap-1">
                            <button
                                type="button"
                                class="btn btn-warning"
                                (click)="startEditTransaction(transaction.id)"
                            >
                                E
                            </button>
                            <button
                                type="button"
                                class="btn btn-danger"
                                (click)="deleteTransaction(transaction.id)"
                            >
                                D
                            </button>
                        </div>
                    </li>
                } @empty {
                    <li class="text-center fs-4 fw-medium">There are no transaction</li>
                }
            </ul>
        </div>
    `,
})
export class TransactionComponent implements OnInit {
    private formBuilder = inject(FormBuilder);
    public transactionService = inject(TransactionService);

    transactionForm: FormGroup;
    transactions = signal<Transaction[]>([]);
    addingTransaction = signal(false);
    editingTransaction = signal<number>(-1);
    loading = signal(false);
    error = signal<string>('');

    async ngOnInit() {
        await this.loadTransactions();
    }

    constructor() {
        this.transactionForm = this.formBuilder.group({
            type: ['income', [Validators.required]],
            amount: ['', [Validators.required, Validators.min(0.01)]],
            date: ['', [Validators.required]],
            title: ['', [Validators.required, Validators.minLength(3)]],
            note: [''],
        });
    }

    async onSubmit() {
        if (this.transactionForm.valid) {
            this.loading.set(true);
            this.error.set('');

            try {
                this.addingTransaction.set(true);

                if (-1 !== this.editingTransaction()) {
                    await this.transactionService.updateTransaction(
                        this.editingTransaction(),
                        this.transactionForm.value,
                    );
                } else {
                    await this.transactionService.createTransaction(
                        this.transactionForm.value as CreateTransactionRequest,
                    );
                }

                await this.loadTransactions();
                await this.cleanTransactionForm();
            } catch (error) {
                throw new Error('Error while adding the transaction: ' + error);
            } finally {
                this.addingTransaction.set(false);
            }
        }
    }

    async loadTransactions() {
        try {
            this.loading.set(true);
            const allTransactions = await this.transactionService.getAllTransactions();
            this.transactions.set(allTransactions);
        } catch (error: unknown) {
            throw new Error('Error while loading the transactions: ' + error);
        } finally {
            this.loading.set(false);
        }
    }

    async startEditTransaction(id: number) {
        const transactionToUpdate = this.transactionService.getTransactionById(id);
        if (!transactionToUpdate) return;

        this.editingTransaction.set(id);

        const { date, ...rest } = transactionToUpdate;
        this.transactionForm.patchValue({
            ...rest,
            date: this.formatDateForInput(date),
        });
        await this.loadTransactions();
    }

    async cancelEditTransaction() {
        this.editingTransaction.set(-1);
        await this.cleanTransactionForm();
    }

    // Format the date to correctly fill the form with the date of the transaction
    private formatDateForInput(date: Date): string {
        const d = new Date(date);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
    }

    async deleteTransaction(id: number) {
        await this.transactionService.deleteTransaction(id);
        await this.loadTransactions();
    }

    async cleanTransactionForm() {
        this.transactionForm.reset({
            type: 'income',
            amount: '',
            date: '',
            title: '',
            note: '',
        });

        this.transactionForm.markAsPristine();
        this.transactionForm.markAsUntouched();
    }
}
