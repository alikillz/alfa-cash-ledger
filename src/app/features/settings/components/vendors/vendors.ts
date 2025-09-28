import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Vendor } from '../../../../core/models/vendor';
import { SettingsStore } from '../../../../core/services/setting.service';

@Component({
  selector: 'app-vendors',
  templateUrl: './vendors.html',
  styleUrls: ['./vendors.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class Vendors implements OnInit {
  private store = inject(SettingsStore);

  vendors$ = this.store.vendors$; // subscribe via async pipe
  business$ = this.store.business$;
  showList = true;

  form!: FormGroup;
  private fb = inject(FormBuilder);

  ngOnInit() {
    console.log(this.vendors$);
    this.form = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      status: ['active'],
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      const biz = this.store.business$.value;
      await this.store.addVendor({
        business_id: biz?.id!,
        ...this.form.value,
      });
      this.form.reset({ status: 'active' });
    }
  }

  async onDelete(cat: Vendor) {
    await this.store.deleteVendor(cat.id);
  }

  async onEdit(cat: Vendor) {
    await this.store.updateVendor('', cat);
  }

  async toggleList() {
    this.showList = !this.showList;
    if (this.showList) {
    }
  }

  trackById(index: number, cat: any) {
    return cat.id; // only re-render changed rows
  }
}
