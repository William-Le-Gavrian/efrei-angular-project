import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { StockService } from '../../../stocks/service/stock.service';
import { StockValue } from '../../../stocks/model/stock.model';

@Component({
    selector: 'app-transaction-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    template: `
        <div>
            <div class="w-100 h-100">
                <canvas
                    baseChart
                    [data]="stockChartData"
                    [options]="getChartOptions(false)"
                    [type]="'line'"
                ></canvas>
            </div>

            <div class="w-100 h-100">
                <canvas
                    baseChart
                    [data]="balanceChartData"
                    [options]="getChartOptions(true)"
                    [type]="'line'"
                ></canvas>
            </div>
        </div>
    `,
})
export class TransactionChartComponent {
    transactions = signal<Transaction[]>([]);
    stockValues = signal<StockValue[]>([]);

    private transactionService = inject(TransactionService);
    private stockService = inject(StockService);

    constructor() {
        effect(() => {
            this.updateBalanceChartData();
            this.updateStocksChartData();
        });

        this.loadData();
    }

    balanceChartData: ChartData<'line'> = {
        labels: [],
        datasets: [],
    };

    stockChartData: ChartData<'line'> = {
        labels: [],
        datasets: [],
    };

    getChartOptions(isBalance: boolean): ChartOptions {
        return {
            responsive: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Dates',
                        font: { size: 16, weight: 'bold' },
                        color: '#333',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: isBalance ? 'Amount (€)' : 'Amount ($)',
                        font: { size: 16, weight: 'bold' },
                        color: '#333',
                    },
                },
            },
        };
    }

    async loadData() {
        const allTransactions = await this.transactionService.getAllTransactions();
        this.transactions.set(allTransactions);
        await this.updateBalanceChartData();

        const stock = await this.stockService.getStock('AAPL');
        this.stockValues.set(stock);
        await this.updateStocksChartData();
    }

    async updateBalanceChartData() {
        const allTransactions = this.transactions();

        const sortedTransactions = [...allTransactions].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        const transactionsLabels = sortedTransactions.map((t) =>
            new Date(t.date).toLocaleDateString('fr-FR'),
        );

        let balance = 0;
        const balanceData = sortedTransactions.map((transaction) => {
            balance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
            return balance;
        });

        this.balanceChartData = {
            labels: transactionsLabels,
            datasets: [
                {
                    data: balanceData,
                    label: 'Balance (€)',
                    fill: false,
                    borderColor: '#0d6efd',
                    tension: 0.3,
                },
            ],
        };
    }

    async updateStocksChartData() {
        const stocks = this.stockValues();

        const sortedStocks = [...stocks].sort(
            (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
        );

        const stockLabels = sortedStocks.map((s) =>
            new Date(s.datetime).toLocaleDateString('fr-FR'),
        );
        const stockData = sortedStocks.map((stock) => parseFloat(stock.close));

        this.stockChartData = {
            labels: stockLabels,
            datasets: [
                {
                    data: stockData,
                    label: 'AAPL Stocks ($)',
                    fill: false,
                    borderColor: '#dc3545',
                    tension: 0.3,
                },
            ],
        };
    }
}
