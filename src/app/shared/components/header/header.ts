import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header>
      <nav class="navbar navbar-expand-md navbar-light bg-primary">
        <div class="container">
          <a href="#" class="navbar-brand text-white">EasyBudget</a>
          <div>
            <button
              class="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarMobile"
              aria-controls="navbarMobile"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarMobile">
              <ul class="navbar-nav">
                @if (currentUser()) {
                  <li class="nav-item">
                    <a routerLink="/transactions" class="nav-link text-white">Transactions</a>
                  </li>

                  @if (currentUser()?.role === 'admin') {
                    <li class="nav-item">
                      <a routerLink="/admin" class="nav-link text-white">Admin dashboard</a>
                    </li>
                  }
                  <li class="nav-item">
                    <button (click)="logout()" class="nav-link text-white">Logout</button>
                  </li>
                } @else {
                  <li class="nav-item">
                    <a routerLink="/auth/login" class="nav-link text-white">Login</a>
                  </li>
                  <li class="nav-item">
                    <a routerLink="/auth/register" class="nav-link text-white">Register</a>
                  </li>
                }
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
