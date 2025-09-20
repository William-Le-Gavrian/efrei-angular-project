import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StockValue } from '../model/stock.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StockService {
    private http = inject(HttpClient);

    async getStock(symbol: string, interval = '1day'): Promise<StockValue[]> {
        const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}`;
        return await firstValueFrom(this.http.get<StockValue[]>(url));
    }
}
