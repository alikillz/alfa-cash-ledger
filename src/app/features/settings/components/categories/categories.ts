import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../../core/models/category.model';
import { SettingsStore } from '../../../../core/services/setting.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class Categories implements OnInit {
  private store = inject(SettingsStore);

  categories$ = this.store.categories$; // subscribe via async pipe
  business$ = this.store.business$;
  showList = true;

  form!: FormGroup;
  private fb = inject(FormBuilder);

  ngOnInit() {
    console.log(this.categories$);
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['active'],
    });
  }

  async onSubmit() {
    if (this.form.valid) {
      const biz = this.store.business$.value;
      await this.store.addCategory({
        business_id: biz?.id!,
        ...this.form.value,
      });
      this.form.reset({ status: 'active' });
    }
  }

  async onDelete(cat: Category) {
    await this.store.deleteCategory(cat.id);
  }

  async onEdit(cat: Category) {
    await this.store.updateCategory('', cat);
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
