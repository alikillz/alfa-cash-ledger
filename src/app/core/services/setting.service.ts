import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { Vendor } from '../models/vendor';
import { Business } from './business.service';
import { SupabaseService } from './Supabase/supabase.service';

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private supabase = inject(SupabaseService).client;

  business$ = new BehaviorSubject<Business | null>(null);
  categories$ = new BehaviorSubject<Category[]>([]);
  vendors$ = new BehaviorSubject<Vendor[]>([]);
  products$ = new BehaviorSubject<Product[]>([]);

  async loadAllForBusiness(businessId: string) {
    const [bizRes, catRes, vendorRes, prodRes] = await Promise.all([
      this.supabase.from('businesses').select('*').eq('id', businessId).single(),
      this.supabase
        .from('categories')
        .select('id, business_id,name, description, status')
        .eq('business_id', businessId),
      this.supabase
        .from('vendors')
        .select('id, business_id,name, description, status')
        .eq('business_id', businessId),
      this.supabase
        .from('products')
        .select('id, business_id,name, category_id, status')
        .eq('business_id', businessId),
    ]);

    if (bizRes.data) this.business$.next(bizRes.data);
    if (catRes.data) this.categories$.next(catRes.data);
    if (vendorRes.data) this.vendors$.next(vendorRes.data);
    if (prodRes.data) this.products$.next(prodRes.data);
  }

  // CRUD methods (same pattern for vendors/products)

  //Vendor
  async addVendor(vendor: Omit<Vendor, 'id'>) {
    const { data, error } = await this.supabase.from('vendors').insert([vendor]).select().single();
    if (error) throw error;
    this.vendors$.next([...this.vendors$.value, data]);
  }

  async updateVendor(id: string, updates: Partial<Vendor>) {
    const { data, error } = await this.supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    this.vendors$.next(this.vendors$.value.map((c) => (c.id === id ? data : c)));
  }

  async deleteVendor(id: string) {
    await this.supabase.from('vendors').delete().eq('id', id);
    this.vendors$.next(this.vendors$.value.filter((c) => c.id !== id));
  }

  // Category
  async addCategory(category: Omit<Category, 'id'>) {
    const { data, error } = await this.supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    if (error) throw error;
    this.categories$.next([...this.categories$.value, data]);
  }

  async updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await this.supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    this.categories$.next(this.categories$.value.map((c) => (c.id === id ? data : c)));
  }

  async deleteCategory(id: string) {
    await this.supabase.from('categories').delete().eq('id', id);
    this.categories$.next(this.categories$.value.filter((c) => c.id !== id));
  }

  //Product
  async addProduct(product: Omit<Product, 'id'>) {
    const { data, error } = await this.supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    if (error) throw error;
    this.products$.next([...this.products$.value, data]);
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await this.supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    this.products$.next(this.products$.value.map((c) => (c.id === id ? data : c)));
  }

  async deleteProduct(id: string) {
    await this.supabase.from('products').delete().eq('id', id);
    this.products$.next(this.products$.value.filter((c) => c.id !== id));
  }
}
