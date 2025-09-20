import { Injectable } from '@angular/core';
import { HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { TwelveDataStockResponse } from '../../features/stocks/model/tweve-data-response';

@Injectable()
export class StockInterceptor implements HttpInterceptor {
    private API_KEY = 'NOT_THE_REAL_KEY';

    intercept(req: HttpRequest<TwelveDataStockResponse>, next: HttpHandler) {
        const url = new URL(req.url);
        url.searchParams.set('apikey', this.API_KEY);

        const modifiedReq = req.clone({ url: url.toString() });

        return next.handle(modifiedReq).pipe(
            map((event) => {
                if (event instanceof HttpResponse) {
                    const transformedBody = event.body.values ?? event.body;
                    return event.clone({ body: transformedBody });
                }
                return event;
            }),
        );
    }
}
