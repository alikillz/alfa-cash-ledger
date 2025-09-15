import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/components/header/header.component';
import { AppConfigService } from './core/services/app-config.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent], // ← HeaderComponent here
  template: `
    <!-- ← Change to inline template -->
    <app-header></app-header>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [
    `
      .main-content {
        min-height: calc(100vh - 60px);
        background: #f5f5f5;
      }
    `,
  ],
})
export class App implements OnInit {
  isLoading = true;
  isAuthenticated = false;

  constructor(private configService: AppConfigService, private authService: AuthService) {}

  ngOnInit() {
    this.configService.config$.subscribe((config) => {
      this.isLoading = false;
      //console.log('Configuration loaded:', config);
    });

    this.authService.authState$.subscribe((state) => {
      this.isAuthenticated = state.isAuthenticated;
      // console.log('Auth state:', state);
    });
  }
}
