import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AuthService } from './Supabase/auth.service';
import { SupabaseService } from './Supabase/supabase.service';

export interface Business {
  id: string;
  name: string;
  timezone: string;
  current_balance: number;
  low_balance_threshold: number;
  initial_balance: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private businesses: Business[] = [];
  private currentBusinessSubject = new BehaviorSubject<Business | null>(null);
  public currentBusiness$ = this.currentBusinessSubject.asObservable();

  constructor(private supabase: SupabaseService, private authService: AuthService) {
    this.loadSavedBusiness();
  }

  // 🔹 Load businesses from Supabase
  async fetchBusinesses(): Promise<Business[]> {
    const user = this.authService.currentUser;
    if (!user) return [];

    let query = this.supabase.client.from('businesses').select('*');

    if (user.role === 'manager') {
      query = query.eq('id', user.currentBusinessId);
    }

    const { data, error } = await query;
    if (error) throw error;

    this.businesses = data ?? [];

    // Ensure current business is valid
    const savedId = localStorage.getItem('current_business_id');
    const found = this.businesses.find((b) => b.id === savedId);
    if (found) {
      this.currentBusinessSubject.next(found);
    } else if (this.businesses.length > 0) {
      this.setCurrentBusiness(this.businesses[0].id);
    }
    console.log(this.businesses);
    return this.businesses;
  }

  getBusinesses(): Business[] {
    return this.businesses;
  }

  setCurrentBusiness(businessId: string): boolean {
    const user = this.authService.currentUser;
    const business = this.businesses.find((b) => b.id === businessId);

    if (!business) return false;

    if (user?.role === 'manager' && business.id !== user.currentBusinessId) {
      console.warn('Managers can only access their assigned business');
      return false;
    }

    this.currentBusinessSubject.next(business);
    localStorage.setItem('current_business_id', businessId);
    return true;
  }

  getCurrentBusiness(): Business | null {
    return this.currentBusinessSubject.value;
  }

  private loadSavedBusiness(): void {
    const savedId = localStorage.getItem('current_business_id');
    if (savedId) {
      const business = this.businesses.find((b) => b.id === savedId);
      if (business) {
        this.currentBusinessSubject.next(business);
      }
    }
  }

  async addBusiness(payload: {
    name: string;
    description?: string;
    currency?: string;
    initialBalance: number;
  }) {
    const user = this.authService.currentUser;
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await this.supabase.client
      .from('businesses')
      .insert({
        name: payload.name,
        description: payload.description,
        currency: payload.currency ?? 'PKR',
        initial_balance: payload.initialBalance,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    this.businesses.push(data);
    this.setCurrentBusiness(data.id);
    return data;
  }

  updateBusinessBalance(businessId: string, newBalance: number): void {
    const business = this.businesses.find((b) => b.id === businessId);
    if (business) {
      business.current_balance = newBalance;
      if (businessId === this.currentBusinessSubject.value?.id) {
        this.currentBusinessSubject.next({ ...business });
      }
    }
  }

  async updateBusiness(updatedBiz: Partial<Business>) {
    const current = this.getCurrentBusiness();
    if (!current) throw new Error('No business selected');

    const { data, error } = await this.supabase.client
      .from('businesses')
      .update(updatedBiz)
      .eq('id', current.id)
      .select()
      .single();

    console.log(error);

    if (error) throw error;

    // Update BehaviorSubject so UI reacts
    this.currentBusinessSubject.next({
      ...current,
      ...data,
    });

    return data;
  }
}
