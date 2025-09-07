import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface Business {
  id: string;
  name: string;
  timezone: string;
  currentBalance: number;
  lowBalanceThreshold: number;
  initialBalance: number;
  status: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  private authService = inject(AuthService);

  private businesses: Business[] = [
    {
      id: '1',
      name: 'ALFA Petroleum',
      timezone: 'Asia/Karachi',
      currentBalance: 100000,
      lowBalanceThreshold: 50000,
      initialBalance: 100000,
      status: 'active',
    },
    {
      id: '2',
      name: 'Alfa Stand',
      timezone: 'Asia/Karachi',
      currentBalance: 10000,
      lowBalanceThreshold: 50000,
      initialBalance: 100000,
      status: 'active',
    },
    {
      id: '3',
      name: 'ALFA Bagh',
      timezone: 'Asia/Karachi',
      currentBalance: 5000,
      lowBalanceThreshold: 5000,
      initialBalance: 100000,
      status: 'active',
    },
  ];

  private currentBusinessSubject = new BehaviorSubject<Business>(this.businesses[0]);
  public currentBusiness$ = this.currentBusinessSubject.asObservable();

  constructor() {
    this.loadSavedBusiness();
  }

  // Get all businesses (with role-based access)
  getBusinesses(): Business[] {
    const user = this.authService.currentUser;

    if (user?.role === 'owner') {
      return this.businesses; // Owners see all businesses
    }

    // Managers only see their current assigned business
    const currentBusiness = this.businesses.find((b) => b.id === user?.currentBusinessId);
    return currentBusiness ? [currentBusiness] : [];
  }

  // Set current business (with role validation)
  setCurrentBusiness(businessId: string): boolean {
    const user = this.authService.currentUser;
    const business = this.businesses.find((b) => b.id === businessId);

    if (!business) return false;

    // Role-based validation
    if (user?.role === 'manager' && business.id !== user.currentBusinessId) {
      console.warn('Managers can only access their assigned business');
      return false;
    }

    this.currentBusinessSubject.next(business);
    localStorage.setItem('current_business_id', businessId);
    return true;
  }

  // Get current business
  getCurrentBusiness(): Business {
    return this.currentBusinessSubject.value;
  }

  // Load saved business from storage
  private loadSavedBusiness(): void {
    const savedBusinessId = localStorage.getItem('current_business_id');
    if (savedBusinessId) {
      const business = this.businesses.find((b) => b.id === savedBusinessId);
      if (business) {
        this.currentBusinessSubject.next(business);
      }
    }
  }

  // Update business balance (for transactions)
  updateBusinessBalance(businessId: string, newBalance: number): void {
    const business = this.businesses.find((b) => b.id === businessId);
    if (business) {
      business.currentBalance = newBalance;

      // If updating current business, notify subscribers
      if (businessId === this.currentBusinessSubject.value.id) {
        this.currentBusinessSubject.next({ ...business });
      }
    }
  }
}
