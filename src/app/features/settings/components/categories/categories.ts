import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../../../core/models/category.model';
import { BusinessService } from '../../../../core/services/business.service';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  styleUrls: ['./categories.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class Categories implements OnInit {
  private fb = inject(FormBuilder);
  private businessService = inject(BusinessService);
  private categoryService = inject(CategoryService);

  form!: FormGroup;
  categories: Category[] = [];
  saving = false;
  editing: Category | null = null;
  loading = false;
  showList = false;

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: ['active', Validators.required],
    });

    this.loadCategories();

    // reload categories when business changes
    this.businessService.currentBusiness$.subscribe(() => {
      this.loadCategories();
    });
  }

  async loadCategories() {
    const biz = this.businessService.getCurrentBusiness();
    if (!biz) return;

    this.loading = true;
    try {
      this.categories = await this.categoryService.getCategories(biz.id);
    } catch (err) {
      console.error(err);
      alert('Failed to load categories.');
    } finally {
      this.loading = false;
    }
  }

  async onSubmit() {
    if (!this.form.valid) return;

    this.saving = true;
    try {
      const biz = this.businessService.getCurrentBusiness();
      if (!biz) throw new Error('No business selected');

      const payload = {
        ...this.form.value,
        business_id: biz.id,
      };

      if (this.editing) {
        await this.categoryService.updateCategory(this.editing.id, payload);
      } else {
        await this.categoryService.addCategory(payload);
      }

      this.form.reset({ status: 'active' });
      this.editing = null;
      await this.loadCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to save category.');
    } finally {
      this.saving = false;
    }
  }

  onEdit(cat: Category) {
    this.editing = cat;
    this.form.patchValue(cat);
  }

  async onDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await this.categoryService.deleteCategory(cat.id);
      await this.loadCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to delete category.');
    }
  }

  async toggleList() {
    this.showList = !this.showList;
    if (this.showList) {
      await this.loadCategories();
    }
  }
}
