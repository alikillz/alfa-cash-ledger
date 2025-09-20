import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsSignal = signal<string[]>([
    'Diesel',
    'Petrol',
    'Engine Oil',
    'Electricity Bill',
    'Water Bill',
    'Internet Bill',
    'Office Supplies',
    'Cleaning Materials',
  ]);

  products$ = this.productsSignal.asReadonly();

  addProduct(newProduct: string): void {
    const current = this.productsSignal();
    if (!current.includes(newProduct)) {
      this.productsSignal.set([...current, newProduct]);
    }
  }

  getProducts(): string[] {
    return this.productsSignal();
  }
}
