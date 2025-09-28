import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../../core/models/product.model';
import { SettingsStore } from '../../../../core/services/setting.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrls: ['./products.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class Products implements OnInit {
  private store = inject(SettingsStore);

  products$ = this.store.products$; // subscribe via async pipe
  business$ = this.store.business$;
  showList = true;

  form!: FormGroup;
  private fb = inject(FormBuilder);
  private settingsStore = inject(SettingsStore);
  categories$ = this.settingsStore.categories$;
  ngOnInit() {
    console.log(this.products$);

    this.form = this.fb.group({
      name: ['', Validators.required],
      category_id: ['', Validators.required],
      status: ['active'],
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      const biz = this.store.business$.value;
      await this.store.addProduct({
        business_id: biz?.id!,
        ...this.form.value,
      });
      this.form.reset({ status: 'active' });
    }
  }

  async onDelete(cat: Product) {
    await this.store.deleteProduct(cat.id);
  }

  async onEdit(cat: Product) {
    await this.store.updateProduct('', cat);
  }

  async toggleList() {
    this.showList = !this.showList;
    if (this.showList) {
    }
  }

  trackById(index: number, cat: any) {
    return cat.id; // only re-render changed rows
  }

  getCategoryName(id: string): string | undefined {
    const categories = this.categories$.getValue(); // returns Category[]
    const category = categories.find((cat) => cat.id === id);
    return category?.name;
  }
}
