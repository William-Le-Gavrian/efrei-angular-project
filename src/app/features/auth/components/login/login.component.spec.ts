import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';

describe('Login', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display the form', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('form')).toBeTruthy();
        expect(compiled.querySelector('#email')).toBeTruthy();
        expect(compiled.querySelector('#password')).toBeTruthy();
        expect(compiled.querySelector('button[type=submit]')).toBeTruthy();
    });

    it('should deactivate the submission button if the form is invalid', () => {
        component.loginForm.setValue({ email: '', password: '' });
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button[type=submit]');
        expect(button.disabled).toBeTrue();
    });

    it('should display an error if the email is invalid', () => {
        const emailControl = component.loginForm.get('email');
        emailControl?.setValue('bademail');
        emailControl?.markAsTouched();
        fixture.detectChanges();

        const error = fixture.nativeElement.querySelector('#email + p');
        expect(error?.textContent).toContain('Invalid format');
    });
});
