import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { TransferReasonService } from '../../../../core/services/transfer-reason.service';
import { QuickAddModalComponent } from '../../../../shared/components/quick-add-modal/quick-add-modal.component';

@Component({
  selector: 'app-add-transfer-reason-modal',
  standalone: true,
  imports: [CommonModule, QuickAddModalComponent],
  template: `
    <app-quick-add-modal
      title="Transfer Reason"
      fieldName="name"
      (closed)="onClose()"
      (saved)="onSave($event)"
    ></app-quick-add-modal>
  `,
})
export class AddTransferReasonModalComponent {
  private transferReasonService = inject(TransferReasonService);

  @Output() closed = new EventEmitter<void>();

  onSave(reasonName: string): void {
    this.transferReasonService.addTransferReason(reasonName);
  }

  onClose(): void {
    this.closed.emit();
  }
}
