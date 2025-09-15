import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'] as 'owner' | 'manager';
    const user = this.authService.currentUser;

    console.log('RoleGuard checking:', {
      requiredRole,
      userRole: user?.role,
      hasRole: this.authService.hasRole(requiredRole),
    });

    if (!this.authService.hasRole(requiredRole)) {
      console.log('Access denied - redirecting to dashboard');
      this.router.navigate(['/dashboard']);
      return false; // ← Access DENIED
    }

    console.log('Access granted'); // ← This should be here!
    return true; // ← Access GRANTED
  }
}
