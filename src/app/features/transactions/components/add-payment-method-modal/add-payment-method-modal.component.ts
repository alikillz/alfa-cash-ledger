import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { PaymentMethodService } from '../../../../core/services/payment-method.service';
import { QuickAddModalComponent } from '../../../../shared/components/quick-add-modal/quick-add-modal.component';

@Component({
  selector: 'app-add-payment-method-modal',
  standalone: true,
  imports: [CommonModule, QuickAddModalComponent],
  template: `
    <app-quick-add-modal
      title="Payment Method"
      fieldName="name"
      (closed)="onClose()"
      (saved)="onSave($event)"
    ></app-quick-add-modal>
  `,
})
export class AddPaymentMethodModalComponent {
  private paymentMethodService = inject(PaymentMethodService);

  @Output() closed = new EventEmitter<void>();

  onSave(methodName: string): void {
    this.paymentMethodService.addPaymentMethod(methodName);
  }

  onClose(): void {
    this.closed.emit();
  }
}
