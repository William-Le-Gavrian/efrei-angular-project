import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { CreateTransactionRequest, Transaction } from '../../models/transaction.model';
// import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    // RouterLink
  ],
  template: `
    <div class="container">
      <div class="add-transaction-form border p-4 rounded-4 shadow">
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
              <input type="date" class="form-control" id="date" formControlName="date" />
            </div>
          </div>

          <div class="row my-3">
            <div class="col-12 col-lg-4">
              <label for="title" class="form-label fw-medium fs-5">Title</label>
              <input type="text" class="form-control" id="title" formControlName="title" />
            </div>

            <div class="col-12 col-lg-8">
              <label for="note" class="form-label fw-medium fs-5"
                >Note <span class="fs-6 text-muted">(optionnal)</span></label
              >
              <input type="text" class="form-control" id="note" formControlName="note" />
            </div>
          </div>

          <button class="btn btn-primary" type="submit">Add transaction</button>
        </form>
      </div>

      <ul class="transactions-list">
        @for (transaction of transactionService.computedTransactions(); track transaction.id) {
          <li>{{ transaction.title }}</li>
        } @empty {
          <li>There are no transaction</li>
        }
      </ul>
    </div>
  `,
})
export class TransactionComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  public transactionService = inject(TransactionService);
  private router = inject(Router);

  transactionForm: FormGroup;
  transactions = signal<Transaction[]>([]);
  addingTransaction = signal(false);
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
        await this.transactionService.createTransaction(
          this.transactionForm.value as CreateTransactionRequest,
        );
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

  // async loadTransactionGraph() {
  //
  // }

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
