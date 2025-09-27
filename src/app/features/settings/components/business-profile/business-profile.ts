import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, map } from 'rxjs/operators';
import { Business, BusinessService } from '../../../../core/services/business.service';
import { AuthService } from '../../../../core/services/Supabase/auth.service';

@Component({
  selector: 'app-business-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './business-profile.html',
  styleUrls: ['./business-profile.scss'],
})
export class BusinessProfile implements OnInit {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);
  private authService = inject(AuthService);

  currentUser$ = this.authService.authState$.pipe(map((state) => state.user));
  canEdit$ = this.currentUser$.pipe(map((user) => user?.role === 'owner'));

  form!: FormGroup;
  business$ = this.businessService.currentBusiness$.pipe(
    filter((biz): biz is Business => !!biz) // drop nulls
  );
  saving = false;

  ngOnInit() {
    console.log(this.business$);
    this.business$.subscribe((biz) => {
      if (biz) {
        this.form = this.fb.group({
          name: [biz?.name ?? '', Validators.required], // must have a name
          current_balance: [{ value: biz?.current_balance ?? 0 }], // read-only
          initial_balance: [biz?.initial_balance ?? 0, [Validators.required, Validators.min(0)]],
          low_balance_threshold: [
            biz?.low_balance_threshold ?? 0,
            [Validators.required, Validators.min(0)],
          ],
        });
      }
    });

    this.businessService.fetchBusinesses().then(() => {
      this.business$.subscribe((biz) => {
        if (biz) {
          console.log(biz);
          this.form = this.fb.group({
            name: [biz.name],
            current_balance: [biz.current_balance ?? 0],
            initial_balance: [biz.initial_balance ?? 0],
            low_balance_threshold: [biz.low_balance_threshold ?? 0],
          });
        }
      });
    });
  }

  async onSubmit() {
    if (!this.form.valid) return;

    this.saving = true;
    try {
      const bizUpdate = this.form.getRawValue(); // includes disabled fields if needed
      await this.businessService.updateBusiness(bizUpdate);
      alert('Business updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Failed to update business.');
    } finally {
      this.saving = false;
    }
  }
}
