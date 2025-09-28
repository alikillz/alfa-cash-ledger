import { inject, Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { SupabaseService } from './Supabase/supabase.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private supabase = inject(SupabaseService).client;

  async getCategories(businessId: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('id,business_id ,name, description, status')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    console.log('got from database');
    if (error) throw error;
    return data ?? [];
  }

  async addCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase.from('categories').insert([category]);
    if (error) throw error;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const { error } = await this.supabase.from('categories').update(updates).eq('id', id);
    if (error) throw error;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
}
