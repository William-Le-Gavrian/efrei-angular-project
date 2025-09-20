import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionChartComponent } from './transaction-chart.component';

describe('TransactionChart', () => {
    let component: TransactionChartComponent;
    let fixture: ComponentFixture<TransactionChartComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TransactionChartComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TransactionChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
