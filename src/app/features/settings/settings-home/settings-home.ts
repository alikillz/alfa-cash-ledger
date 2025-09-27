import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../core/components/header/header.component';

@Component({
  selector: 'app-settings-home',
  imports: [RouterModule, CommonModule, HeaderComponent],
  templateUrl: './settings-home.html',
  styleUrl: './settings-home.scss',
})
export class SettingsHome {}
