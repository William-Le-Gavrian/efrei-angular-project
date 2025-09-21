import { Component, inject, signal } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
        return { passwordMismatch: true };
    }
    return null;
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
        <div class="container">
            <div class="min-vh-100 d-flex flex-column align-items-center justify-content-center">
                <div class="border rounded-5 shadow py-5 px-5">
                    <h2 class="fs-1 mb-5">Register to EasyBudget Manager!</h2>
                    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                        <div class="mb-5">
                            <div class="mb-3">
                                <label for="name" class="form-label fs-5">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    class="form-control fs-5"
                                    formControlName="name"
                                />
                                @if (isFieldInvalid('name')) {
                                    <p class="text-danger">
                                        {{ getFieldError('name') }}
                                    </p>
                                }
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label fs-5">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    class="form-control fs-5"
                                    formControlName="email"
                                />
                                @if (isFieldInvalid('email')) {
                                    <p class="text-danger">
                                        {{ getFieldError('email') }}
                                    </p>
                                }
                            </div>
                            <div class="mb-3">
                                <label for="password" class="form-label fs-5">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    class="form-control fs-5"
                                    formControlName="password"
                                />
                                @if (isFieldInvalid('password')) {
                                    <p class="text-danger">
                                        {{ getFieldError('password') }}
                                    </p>
                                }
                            </div>
                            <div>
                                <label for="confirmPassword" class="form-label fs-5"
                                    >Confirm password</label
                                >
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    class="form-control fs-5"
                                    formControlName="confirmPassword"
                                />
                            </div>
                        </div>

                        <div
                            class="d-lg-flex align-items-center justify-content-center justify-content-lg-start gap-3"
                        >
                            <button
                                type="submit"
                                [disabled]="registerForm.invalid || loading()"
                                class="btn btn-primary"
                            >
                                @if (loading()) {
                                    <span class=""></span>
                                    Connection...
                                } @else {
                                    Register
                                }
                            </button>

                            @if (error()) {
                                <div id="generalErrors">
                                    <p class="m-0 text-danger">{{ error() }}</p>
                                </div>
                            }

                            @if (
                                registerForm.errors?.['passwordMismatch'] &&
                                (registerForm.get('confirmPassword')?.touched ||
                                    registerForm.get('password')?.touched)
                            ) {
                                <div id="passwordMismatchError">
                                    <p class="m-0 text-danger">Passwords do not match</p>
                                </div>
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
})
export class RegisterComponent {
    private formBuilder = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    registerForm: FormGroup;
    loading = signal(false);
    error = signal<string>('');

    constructor() {
        this.registerForm = this.formBuilder.group(
            {
                name: ['', [Validators.required, Validators.minLength(2)]],
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(6)]],
                confirmPassword: ['', [Validators.required]],
            },
            { validators: passwordMatchValidator },
        );
    }

    async onSubmit() {
        if (!this.registerForm.valid) return;

        this.loading.set(true);
        this.error.set('');

        const { confirmPassword, ...userData } = this.registerForm.value;

        try {
            const result = await this.authService.register({ ...userData, confirmPassword });

            this.loading.set(false);

            if (result.success && result.user) {
                this.router.navigate(['/transactions']);
            } else {
                this.error.set(result.error || 'Error while creating the account');
            }
        } catch (err: unknown) {
            this.loading.set(false);

            if (err instanceof Error) {
                this.error.set(err.message);
            } else {
                this.error.set('Unexpected error');
            }
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.registerForm.get(fieldName);
        const group = this.registerForm;

        if (!field) return false;

        const fieldError = field && field.invalid && (field.dirty || field.touched);
        const passwordMismatchError =
            fieldName === 'confirmPassword' && group.errors?.['passwordMismatch'];

        return !!(fieldError || passwordMismatchError);
    }

    getFieldError(fieldName: string): string {
        const field = this.registerForm.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return 'This field is required';
            if (field.errors['email']) return 'Invalid format';
            if (field.errors['minlength'])
                return `${field.errors['minlength'].requiredLength} characters minimum`;
            if (field.errors['passwordMismatch']) return 'Passwords do not match';
        }
        return '';
    }
}
