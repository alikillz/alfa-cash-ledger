import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppConfigService } from './core/services/app-config.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], // ← This should work
  templateUrl: 'app.html',
  styleUrls: ['app.scss'],
})
export class App implements OnInit {
  isLoading = true;
  isAuthenticated = false;

  constructor(private configService: AppConfigService, private authService: AuthService) {}

  ngOnInit() {
    this.configService.config$.subscribe((config) => {
      this.isLoading = false;
      console.log('Configuration loaded:', config);
    });

    this.authService.authState$.subscribe((state) => {
      this.isAuthenticated = state.isAuthenticated;
      console.log('Auth state:', state);
    });
  }
}
