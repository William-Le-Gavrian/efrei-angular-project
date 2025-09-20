import { StockValue } from './stock.model';

export interface TwelveDataStockResponse {
    meta: {
        symbol: string;
        interval: string;
        currency?: string;
        currency_base?: string;
        currency_quote?: string;
        exchange?: string;
        exchange_timezone?: string;
        type: string;
    };
    values: StockValue[];
    status: string;
}
