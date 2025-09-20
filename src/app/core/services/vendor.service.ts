import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  // Signal containing the vendors array
  private vendorsSignal = signal<string[]>([
    'Shell',
    'Caltex',
    'PTCL',
    'K-Electric',
    'Local Market',
    'Auto Workshop',
  ]);

  // Public read-only signal
  vendors$ = this.vendorsSignal.asReadonly();

  addVendor(newVendor: string): void {
    const current = this.vendorsSignal();
    if (!current.includes(newVendor)) {
      this.vendorsSignal.set([...current, newVendor]);
    }
  }

  // FIXED: Return the signal value, not call itself
  getVendors(): string[] {
    return this.vendorsSignal(); // ← Get the current value
  }
}
