// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { Session } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { mapSupabaseUser } from '../../mappers/user.mapper';
import { AuthResponse, AuthState, User } from '../../models/auth.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService).client;
  private router = inject(Router);

  private authState = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
  public authState$ = this.authState.asObservable();

  // keep reference so you can unsubscribe if needed
  private authSubscription: any;

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const user = mapSupabaseUser(data.session.user);
        const token = data.session.access_token;
        this.handleLoginSuccess({ user, token });
      }
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user = mapSupabaseUser(session.user);
        this.handleLoginSuccess({ user, token: session.access_token });
      } else {
        this.clearAuthState();
      }
    });
    //this.initialize();
  }

  private async initialize() {
    // Restore any existing session (getSession waits/refreshes as needed)
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) {
        // non-fatal: log and continue
        console.warn('getSession error', error);
      } else if (data?.session) {
        this.setAuthStateFromSession(data.session);
      }
    } catch (err) {
      console.warn('restore session err', err);
    }

    // Listen to auth events (SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED ...)
    const { data: sub } = this.supabase.auth.onAuthStateChange((event, session) => {
      if (!session || event === 'SIGNED_OUT') {
        this.clearAuthState();
      } else {
        this.setAuthStateFromSession(session);
      }
    });

    // keep subscription so we could unsubscribe if necessary
    this.authSubscription = sub?.subscription ?? sub;
  }

  private setAuthStateFromSession(session: Session) {
    //const user = session.user ?? null;
    const user = mapSupabaseUser(session.user);
    const token = (session as any)?.access_token ?? null;
    this.authState.next({
      user,
      token,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    });
  }

  private setLoading(isLoading: boolean) {
    this.authState.next({ ...this.authState.value, isLoading, error: null });
  }

  private setError(err: string | null) {
    this.authState.next({ ...this.authState.value, isLoading: false, error: err });
  }

  // PUBLIC: sign in with email/password
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      this.handleLoginError(error);
      throw error;
    }

    if (data.session && data.user) {
      // Map Supabase user to your User model
      const user: User = {
        id: data.user.id,
        email: data.user.email ?? '',
        role: (data.user.user_metadata?.['role'] as 'owner' | 'manager') ?? 'manager', // default if missing
        name: data.user.user_metadata?.['name'] ?? '',
        phone: data.user.user_metadata?.['phone'] ?? '',
        status: (data.user.user_metadata?.['status'] as 'active' | 'inactive') ?? 'active',
        created_at: new Date(data.user.created_at).toDateString(),
        currentBusinessId: data.user.user_metadata?.['currentBusinessId'] ?? undefined,
      };

      const token = data.session.access_token;

      this.handleLoginSuccess({ user, token });
    }
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

    console.log(this.authState);
  }

  hasRole(role: 'owner' | 'manager'): boolean {
    const currentUser = this.authState.value.user;
    return currentUser?.role === role;
  }

  // PUBLIC: sign out
  async signOut() {
    await this.supabase.auth.signOut();
    this.clearAuthState();
    // optional navigation
    this.router.navigate(['/login']);
  }

  private clearAuthState() {
    this.authState.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }

  async signUp() {
    //email: any, password: any, options: any
    const email = 'alikillz86@gmail.com';
    const password = '123@123@123';

    await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'owner', // or 'manager'
          name: 'Mohammad Ali',
          status: 'active',
          businessId: '1015045d-cee8-4d9c-b46f-29cce4dd7f50',
          phone: '+923216834668',
        },
      },
    });
  }

  // convenience getters
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
