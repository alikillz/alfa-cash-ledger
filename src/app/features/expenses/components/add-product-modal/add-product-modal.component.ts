import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { QuickAddModalComponent } from '../../../../shared/components/quick-add-modal/quick-add-modal.component';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [CommonModule, QuickAddModalComponent],
  template: `
    <app-quick-add-modal
      title="Product"
      fieldName="name"
      (closed)="onClose()"
      (saved)="onSave($event)"
    ></app-quick-add-modal>
  `,
})
export class AddProductModalComponent {
  private productService = inject(ProductService);
  @Output() closed = new EventEmitter<void>(); // ← Add this
  onSave(productName: string): void {
    //this.productService.addProduct(productName);
  }

  onClose(): void {
    this.closed.emit(); // ← Emit the closed event
  }
}
