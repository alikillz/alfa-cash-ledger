import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../core/components/header/header.component';
import { BusinessService } from '../../../core/services/business.service';
import { SettingsStore } from '../../../core/services/setting.service';

@Component({
  selector: 'app-settings-home',
  standalone: true,
  templateUrl: './settings-home.html',
  styleUrls: ['./settings-home.scss'],
  imports: [CommonModule, RouterModule, HeaderComponent],
})
export class SettingsHome implements OnInit {
  private businessService = inject(BusinessService);
  private settingsStore = inject(SettingsStore);

  ngOnInit(): void {
    // Get current business (already chosen from switcher)
    const biz = this.businessService.getCurrentBusiness();
    if (biz) {
      this.settingsStore.loadAllForBusiness(biz.id);
    }

    // Optional: if business can change while in settings
    this.businessService.currentBusiness$.subscribe((biz) => {
      if (biz) {
        this.settingsStore.loadAllForBusiness(biz.id);
      }
    });
  }
}
