import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  private paymentMethods = signal<string[]>(['Jazz Cash', 'Easypaisa', 'Bank Transfer']);

  paymentMethods$ = this.paymentMethods.asReadonly();

  addPaymentMethod(newMethod: string): void {
    const current = this.paymentMethods();
    if (!current.includes(newMethod)) {
      this.paymentMethods.set([...current, newMethod]);
    }
  }

  getPaymentMethods(): string[] {
    return this.paymentMethods();
  }
}
