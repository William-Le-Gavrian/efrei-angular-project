import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const adminGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.currentUser() && authService.currentUser()?.role === 'admin') {
        return true;
    } else {
        router.navigate(['/transactions']);
        return false;
    }
};
