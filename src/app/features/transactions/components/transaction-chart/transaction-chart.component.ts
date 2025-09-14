import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';

@Component({
    selector: 'app-transaction-chart',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
    template: `
        <div class="w-100 h-100">
            <canvas baseChart [data]="chartData" [options]="chartOptions" [type]="'line'"> </canvas>
        </div>
    `,
})
export class TransactionChartComponent {
    transactions = signal<Transaction[]>([]);

    private transactionService = inject(TransactionService);

    constructor() {
        effect(() => {
            this.updateChartData();
        });
    }

    chartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
            },
        },
    };

    chartData: ChartData<'line'> = {
        labels: [],
        datasets: [
            {
                data: [],
                label: 'Balance (€)',
                fill: false,
                borderColor: '#0d6efd',
            },
        ],
    };

    async updateChartData() {
        const allTransactions = await this.transactionService.getAllTransactions();
        this.transactions.set(allTransactions);

        const sorted = [...allTransactions].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );

        const labels = sorted.map((t) => new Date(t.date).toLocaleDateString('fr-FR'));

        let balance = 0;
        const balanceData = sorted.map((t) => {
            balance += t.type === 'income' ? t.amount : -t.amount;
            return balance;
        });

        this.chartData = {
            labels,
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
}
