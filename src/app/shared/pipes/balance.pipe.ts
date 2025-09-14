import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'balance',
    standalone: true,
})
export class BalancePipe implements PipeTransform {
    transform(amount: number): string {
        return amount >= 0 ? 'success' : 'danger';
    }
}
