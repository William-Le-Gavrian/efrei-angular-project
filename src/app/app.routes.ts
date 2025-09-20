import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guards';
import { adminGuard } from './core/guards/admin.guards';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/transactions',
        pathMatch: 'full',
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
    },
    {
        path: 'transactions',
        canActivate: [authGuard],
        loadChildren: () =>
            import('./features/transactions/transactions.routes').then((m) => m.TRANSACTION_ROUTES),
    },
    {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    },
];
