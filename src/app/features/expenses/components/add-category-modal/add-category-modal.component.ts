import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CategoryService } from '../../../../core/services/category.service';
import { QuickAddModalComponent } from '../../../../shared/components/quick-add-modal/quick-add-modal.component';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [CommonModule, QuickAddModalComponent],
  template: `
    <app-quick-add-modal
      title="Category"
      fieldName="name"
      (closed)="onClose()"
      (saved)="onSave($event)"
    ></app-quick-add-modal>
  `,
})
export class AddCategoryModalComponent {
  private categoryService = inject(CategoryService);
  @Output() closed = new EventEmitter<void>(); // ← Add this
  onSave(categoryName: string): void {
    this.categoryService.addCategory(categoryName);
  }

  onClose(): void {
    this.closed.emit(); // ← Emit the closed event
  }
}
