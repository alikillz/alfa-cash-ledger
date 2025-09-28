import { inject, Injectable } from '@angular/core';

import { Product } from '../models/product.model';
import { SupabaseService } from './Supabase/supabase.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private supabase = inject(SupabaseService).client;

  async getProduct(businessId: string): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from('products')
      .select('id,business_id ,name, category_id, status')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    console.log('got from database');
    if (error) throw error;
    return data ?? [];
  }

  async addProduct(category: Omit<Product, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase.from('products').insert([category]);
    if (error) throw error;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const { error } = await this.supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }
}
