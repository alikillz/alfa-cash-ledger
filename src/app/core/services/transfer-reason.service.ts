import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TransferReasonService {
  private transferReasons = signal<string[]>([
    'Salary Advance',
    'Emergency Fund',
    'Operational Cash',
    'Inventory Purchase',
    'Utility Payment',
    'Other',
  ]);

  transferReasons$ = this.transferReasons.asReadonly();

  addTransferReason(newReason: string): void {
    const current = this.transferReasons();
    if (!current.includes(newReason)) {
      this.transferReasons.set([...current, newReason]);
    }
  }

  getTransferReasons(): string[] {
    return this.transferReasons();
  }
}
