// src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { Session, Subscription } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { mapSupabaseUser } from '../../mappers/user.mapper';
import { AuthState, User } from '../../models/auth.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService).client;
  private router = inject(Router);

  private authState = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // start loading
    error: null,
  });
  public authState$ = this.authState.asObservable();

  private authSubscription: Subscription | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // 1️⃣ Restore session
    const { data, error } = await this.supabase.auth.getSession();
    if (error) {
      console.warn('getSession error', error);
    }
    if (data?.session) {
      this.setAuthStateFromSession(data.session);
    } else {
      this.clearAuthState();
    }

    // 2️⃣ Listen for auth state changes
    const { data: sub } = this.supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        this.setAuthStateFromSession(session);
      } else {
        this.clearAuthState();
      }
    });

    this.authSubscription = sub?.subscription ?? null;
  }

  private setAuthStateFromSession(session: Session) {
    const user = mapSupabaseUser(session.user); // 👈 make sure this always returns your `User`
    const token = session.access_token;

    this.authState.next({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
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

  async signIn(email: string, password: string) {
    this.setLoading(true);

    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      this.setError(error.message);
      throw error;
    }

    if (data.session) {
      this.setAuthStateFromSession(data.session);
    }
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  async signUp(email: string, password: string, metadata: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (error) throw error;
    return data;
  }

  hasRole(role: 'owner' | 'manager'): boolean {
    return this.authState.value.user?.role === role;
  }

  // helpers
  private setLoading(isLoading: boolean) {
    this.authState.next({ ...this.authState.value, isLoading, error: null });
  }

  private setError(error: string | null) {
    this.authState.next({ ...this.authState.value, isLoading: false, error });
  }

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
