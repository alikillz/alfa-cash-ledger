import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'] as 'owner' | 'manager';

    if (!requiredRole) {
      return true; // No role requirement specified
    }

    if (!this.authService.hasRole(requiredRole)) {
      // Redirect to unauthorized or dashboard based on authentication
      return false;
    }

    return true;
  }
}
