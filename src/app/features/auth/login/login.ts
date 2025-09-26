import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/Supabase/auth.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>ALFA Cash Ledger</h2>
        <p class="subtitle">Sign in to your account</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
            <div class="error-message">Valid email is required</div>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              [class.error]="
                loginForm.get('password')?.invalid && loginForm.get('password')?.touched
              "
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
            <div class="error-message">Password is required</div>
            }
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" formControlName="rememberMe" />
              Remember me
            </label>
          </div>

          @if (errorMessage) {
          <div class="error-message server-error">{{ errorMessage }}</div>
          }

          <button type="submit" class="login-btn" [disabled]="loginForm.invalid">Sign In</button>
        </form>

        <div class="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p><strong>Owner:</strong> owner@alfa.com / password</p>
          <p><strong>Manager:</strong> manager@alfa.com / password</p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        padding: 20px;
      }

      .login-card {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        text-align: center;
        color: #1976d2;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        text-align: center;
        color: #666;
        margin-bottom: 2rem;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      input[type='email'],
      input[type='password'] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;

        &.error {
          border-color: #d32f2f;
        }
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: normal;
      }

      .error-message {
        color: #d32f2f;
        font-size: 0.875rem;
        margin-top: 0.25rem;

        &.server-error {
          text-align: center;
          margin: 1rem 0;
          padding: 0.5rem;
          background: #ffebee;
          border-radius: 4px;
        }
      }

      .login-btn {
        width: 100%;
        padding: 0.75rem;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;

        &:hover:not(:disabled) {
          background: #1565c0;
        }

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }

      .demo-credentials {
        margin-top: 2rem;
        padding: 1rem;
        background: #e3f2fd;
        border-radius: 4px;
        font-size: 0.875rem;

        h4 {
          margin: 0 0 0.5rem 0;
          color: #1976d2;
        }

        p {
          margin: 0.25rem 0;
        }
      }
    `,
  ],
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  loading = false;

  loginForm = this.fb.group({
    email: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: [false],
  });

  isLoading = false;
  errorMessage = '';

  async onSubmit() {
    this.loadingService.show();
    this.loading = true;
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.getRawValue();

      try {
        await this.authService.signIn(email, password);
        // Navigate to dashboard on success
        console.log('login sucess');
        this.router.navigate(['/dashboard']);
      } catch (err: any) {
        this.errorMessage = err?.message ?? 'Sign in failed';
      } finally {
        this.loading = false;
        this.loadingService.hide();
      }

      //this.authService.signUp();

      // For demo purposes - simulate login
      //this.simulateLogin(credentials);

      // For real app, you would use:
      // this.authService.login(credentials).subscribe({
      //   next: () => this.router.navigate(['/dashboard']),
      //   error: (error) => {
      //     this.errorMessage = error.message;
      //     this.isLoading = false;
      //   }
      // });
    }
  }
}
