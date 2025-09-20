import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'transactionType',
    standalone: true,
})
export class TransactionTypePipe implements PipeTransform {
    transform(type: 'income' | 'expense'): { color: string; text: string } {
        const isIncome = type === 'income';

        return {
            color: isIncome ? 'success' : 'danger',
            text: isIncome ? 'Income' : 'Expense',
        };
    }
}
