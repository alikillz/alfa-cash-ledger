import { inject, Injectable } from '@angular/core';
import { Vendor } from '../models/vendor';
import { SupabaseService } from './Supabase/supabase.service';

@Injectable({ providedIn: 'root' })
export class VendorService {
  private supabase = inject(SupabaseService).client;

  async getVendor(businessId: string): Promise<Vendor[]> {
    const { data, error } = await this.supabase
      .from('vendors')
      .select('id,business_id ,name, phone, status')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });
    console.log('got from database');
    if (error) throw error;
    return data ?? [];
  }

  async addVendor(category: Omit<Vendor, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase.from('vendors').insert([category]);
    if (error) throw error;
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<void> {
    const { error } = await this.supabase.from('vendors').update(updates).eq('id', id);
    if (error) throw error;
  }

  async deleteVendor(id: string): Promise<void> {
    const { error } = await this.supabase.from('vendors').delete().eq('id', id);
    if (error) throw error;
  }
}
