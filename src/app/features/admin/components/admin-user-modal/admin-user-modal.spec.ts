import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUserModal } from './admin-user-modal';

describe('AdminUserModal', () => {
    let component: AdminUserModal;
    let fixture: ComponentFixture<AdminUserModal>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminUserModal],
        }).compileComponents();

        fixture = TestBed.createComponent(AdminUserModal);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
