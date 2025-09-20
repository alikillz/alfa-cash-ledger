import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { VendorService } from '../../../../core/services/vendor.service';
import { QuickAddModalComponent } from '../../../../shared/components/quick-add-modal/quick-add-modal.component';

@Component({
  selector: 'app-add-vendor-modal',
  standalone: true,
  imports: [CommonModule, QuickAddModalComponent],
  template: `
    <app-quick-add-modal
      title="Vendor"
      fieldName="name"
      (closed)="onClose()"
      (saved)="onSave($event)"
    ></app-quick-add-modal>
  `,
})
export class AddVendorModalComponent {
  private vendorService = inject(VendorService);
  @Output() closed = new EventEmitter<void>(); // ← Add this
  onSave(vendorName: string): void {
    this.vendorService.addVendor(vendorName);
  }

  onClose(): void {
    this.closed.emit(); // ← Emit the closed event
  }
}
