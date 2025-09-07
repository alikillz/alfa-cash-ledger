import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthResponse, AuthState, LoginCredentials, User } from '../models/auth.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private configService = inject(AppConfigService);

  private authState = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  public authState$ = this.authState.asObservable();

  constructor() {
    this.initializeAuthState();
  }

  // Initialize auth state from storage
  private initializeAuthState(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.authState.next({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        this.clearAuthState();
      }
    }
  }

  // Login method
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.setLoading(true);

    return this.http
      .post<AuthResponse>(`${this.configService.getValue('apiBaseUrl')}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.handleLoginSuccess(response);
          this.setLoading(false);
        }),
        catchError((error) => {
          this.handleLoginError(error);
          return throwError(() => error);
        })
      );
  }

  // Logout method
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  // Check if user has specific role
  hasRole(role: 'owner' | 'manager'): boolean {
    const currentUser = this.authState.value.user;
    return currentUser?.role === role;
  }

  // Check if user can access a specific business
  canAccessBusiness(businessId: string): boolean {
    const currentUser = this.authState.value.user;

    if (currentUser?.role === 'owner') {
      return true; // Owners can access all businesses
    }

    // For managers, we'd check their business access (to be implemented later)
    return currentUser?.currentBusinessId === businessId;
  }

  // Private helper methods
  private handleLoginSuccess(response: AuthResponse): void {
    const { user, token } = response;

    // Store in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    // Update state
    this.authState.next({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  }

  private handleLoginError(error: any): void {
    const errorMessage = error.error?.message || 'Login failed';

    this.authState.next({
      ...this.authState.value,
      isLoading: false,
      error: errorMessage,
    });

    this.clearAuthState();
  }

  private setLoading(isLoading: boolean): void {
    this.authState.next({
      ...this.authState.value,
      isLoading,
      error: null,
    });
  }

  private clearAuthState(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    this.authState.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }

  // Getters for current state
  get currentUser(): User | null {
    return this.authState.value.user;
  }

  get isAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  get isLoading(): boolean {
    return this.authState.value.isLoading;
  }

  get error(): string | null {
    return this.authState.value.error;
  }
}
