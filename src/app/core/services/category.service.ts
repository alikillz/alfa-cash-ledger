import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private categoriesSignal = signal<string[]>([
    'Fuel',
    'Utilities',
    'Maintenance',
    'Supplies',
    'Build–Civil',
    'Build–Mechanical',
    'Build–Electrical',
  ]);

  categories$ = this.categoriesSignal.asReadonly();

  addCategory(newCategory: string): void {
    const current = this.categoriesSignal();
    if (!current.includes(newCategory)) {
      this.categoriesSignal.set([...current, newCategory]);
    }
  }

  getCategories(): string[] {
    return this.categoriesSignal(); // ← FIXED
  }
}
