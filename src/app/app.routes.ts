import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [AuthGuard],
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./features/employees/components/employee-list/employee-list.component').then(
        (m) => m.EmployeeListComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'owner' },
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/reports/components/report-dashboard/report-dashboard.component').then(
        (m) => m.ReportDashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [AuthGuard],
  },

  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings-home/settings-home').then((m) => m.SettingsHome),
    children: [
      {
        path: 'business-profile',
        loadComponent: () =>
          import('./features/settings/components/business-profile/business-profile').then(
            (m) => m.BusinessProfile
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/settings/components/categories/categories').then((m) => m.Categories),
      },
      {
        path: 'vendors',
        loadComponent: () =>
          import('./features/settings/components/vendors/vendors').then((m) => m.Vendors),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/settings/components/products/products').then((m) => m.Products),
      },
      { path: '', redirectTo: 'business-profile', pathMatch: 'full' },
    ],
  },

  {
    path: '',
    redirectTo: '/dashboard', // ← Change this to dashboard instead of login
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard', // ← Change this to dashboard instead of login
  },
];
