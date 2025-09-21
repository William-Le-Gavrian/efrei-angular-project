import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [RegisterComponent],
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display the registration form', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('form')).toBeTruthy();
        expect(compiled.querySelector('#name')).toBeTruthy();
        expect(compiled.querySelector('#email')).toBeTruthy();
        expect(compiled.querySelector('#password')).toBeTruthy();
        expect(compiled.querySelector('#confirmPassword')).toBeTruthy();
    });

    it('should disable submit button if form is invalid', () => {
        component.registerForm.setValue({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        });
        fixture.detectChanges();

        const button: HTMLButtonElement =
            fixture.nativeElement.querySelector('button[type=submit]');
        expect(button.disabled).toBeTrue();
    });

    it('should show error if name is too short', () => {
        const nameControl = component.registerForm.get('name');
        nameControl?.setValue('a');
        nameControl?.markAsTouched();
        fixture.detectChanges();

        const error = fixture.nativeElement.querySelector('#name ~ p');
        expect(error?.textContent).toContain('2 characters minimum');
    });

    it('should show error if email is invalid', () => {
        const emailControl = component.registerForm.get('email');
        emailControl?.setValue('notanemail');
        emailControl?.markAsTouched();
        fixture.detectChanges();

        const error = fixture.nativeElement.querySelector('#email ~ p');
        expect(error?.textContent).toContain('Invalid format');
    });

    it('should show error if password is too short', () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.setValue('123');
        passwordControl?.markAsTouched();
        fixture.detectChanges();

        const error = fixture.nativeElement.querySelector('#password ~ p');
        expect(error?.textContent).toContain('6 characters minimum');
    });

    it('should show error if passwords do not match', () => {
        component.registerForm.get('password')?.setValue('azerty');
        component.registerForm.get('confirmPassword')?.setValue('qsdfgh');
        component.registerForm.get('confirmPassword')?.markAsTouched();
        fixture.detectChanges();

        const error = fixture.nativeElement.querySelector('#passwordMismatchError > p');
        expect(error?.textContent).toContain('Passwords do not match');
    });

    it('should set error if register fails', async () => {
        authServiceSpy.register.and.returnValue(
            Promise.resolve({ success: false, error: 'Account already exists' }),
        );

        component.registerForm.setValue({
            name: 'John',
            email: 'john@example.com',
            password: '123456',
            confirmPassword: '123456',
        });

        await component.onSubmit();

        expect(component.error()).toBe('Account already exists');
    });

    it('should set error if register throws', async () => {
        authServiceSpy.register.and.returnValue(Promise.reject(new Error('Network error')));

        component.registerForm.setValue({
            name: 'John',
            email: 'john@example.com',
            password: '123456',
            confirmPassword: '123456',
        });

        await component.onSubmit();

        expect(component.error()).toBe('Network error');
    });
});
