import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginRequest } from '../../models/user.model';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
        <div class="container">
            <div
                class="min-vh-100 w-auto d-flex flex-column align-items-center justify-content-center"
            >
                <div class="border rounded-5 shadow py-5 px-5">
                    <h2 class="fs-1 mb-5">Log in to your account</h2>
                    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                        <div class="mb-5">
                            <div class="mb-3 ">
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
                            <div>
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
                        </div>

                        <div
                            class="d-lg-flex align-items-center justify-content-center justify-content-lg-start gap-3"
                        >
                            <button
                                type="submit"
                                [disabled]="loginForm.invalid || loading()"
                                class="btn btn-primary mb-2 mb-lg-0"
                            >
                                @if (loading()) {
                                    <span class=""></span>
                                    Connection...
                                } @else {
                                    Log in
                                }
                            </button>

                            @if (error()) {
                                <div>
                                    <p class="m-0 text-danger">{{ error() }}</p>
                                </div>
                            }
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
})
export class LoginComponent {
    private formBuilder = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup;
    loading = signal(false);
    error = signal<string>('');

    constructor() {
        this.loginForm = this.formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    async onSubmit() {
        if (this.loginForm.valid) {
            this.loading.set(true);
            this.error.set('');

            try {
                const result = await this.authService.login(this.loginForm.value as LoginRequest);

                this.loading.set(false);

                if (result.success && result.user) {
                    this.router.navigate(['/transactions']);
                } else {
                    this.error.set(result.error || 'Connection error');
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    this.loading.set(false);
                    this.error.set(err.message || 'Unexpected error');
                }
            }
        }
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.loginForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.loginForm.get(fieldName);
        if (field?.errors) {
            if (field.errors['required']) return 'This field is required';
            if (field.errors['email']) return 'Invalid format';
        }
        return '';
    }
}
