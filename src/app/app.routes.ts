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
    path: '',
    redirectTo: '/dashboard', // ← Change this to dashboard instead of login
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard', // ← Change this to dashboard instead of login
  },
];
