import { Routes } from '@angular/router';

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
    // canActivate: [authGuard],
    loadChildren: () =>
      import('./features/transactions/transactions.routes').then((m) => m.TRANSACTION_ROUTES),
  },
];
