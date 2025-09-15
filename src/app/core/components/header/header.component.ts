import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="app-header">
      <div class="header-container">
        <!-- Logo -->
        <div class="logo" routerLink="/dashboard">🏠 ALFA Ledger</div>

        <!-- Navigation -->
        <nav class="main-nav">
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            Dashboard
          </a>
          <a routerLink="/employees" routerLinkActive="active" *ngIf="canAccessEmployees()">
            Employees
          </a>
          <a routerLink="/reports" routerLinkActive="active"> Reports </a>
          <a routerLink="/transactions" routerLinkActive="active"> Transactions </a>
        </nav>

        <!-- User Info -->
        <div class="user-section">
          <span class="user-info"> {{ currentUser?.name }} ({{ currentUser?.role }}) </span>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .app-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
        max-width: 1400px;
        margin: 0 auto;
        height: 60px;
      }

      .logo {
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 6px;
        transition: background-color 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      .main-nav {
        display: flex;
        gap: 1.5rem;
        align-items: center;
      }

      .main-nav a {
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        transition: background-color 0.2s;
        font-weight: 500;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        &.active {
          background: rgba(255, 255, 255, 0.2);
          font-weight: 600;
        }
      }

      .user-section {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .user-info {
        font-size: 0.9rem;
        opacity: 0.9;
      }

      .logout-btn {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }

      @media (max-width: 768px) {
        .header-container {
          flex-direction: column;
          height: auto;
          padding: 1rem;
          gap: 1rem;
        }

        .main-nav {
          gap: 0.5rem;
        }

        .main-nav a {
          padding: 0.5rem;
          font-size: 0.9rem;
        }

        .user-section {
          flex-direction: column;
          gap: 0.5rem;
        }
      }
    `,
  ],
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  canAccessEmployees(): boolean {
    return this.authService.hasRole('owner');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
