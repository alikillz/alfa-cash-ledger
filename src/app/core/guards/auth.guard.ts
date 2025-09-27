import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { AuthService } from '../services/Supabase/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.authState$.pipe(
      // wait until auth service has finished initializing
      filter((state) => !state.isLoading),
      take(1),
      map((state) => {
        if (state.isAuthenticated) {
          return true;
        }
        // redirect if not authenticated
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
