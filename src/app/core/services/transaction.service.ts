import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BusinessService } from './business.service';

export interface Transaction {
  id: string;
  businessId: string;
  type: 'TOP_UP' | 'EXPENSE' | 'SALARY_PAYMENT';
  amount: number;
  date: Date;
  category?: string;
  vendor?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private businessService = inject(BusinessService);

  private transactions: Transaction[] = [
    // Sample data for ALFA Petroleum
    {
      id: '1',
      businessId: '1',
      type: 'EXPENSE',
      amount: 2500,
      date: new Date(),
      category: 'Fuel',
      vendor: 'Shell',
      description: 'Diesel purchase',
    },
    {
      id: '2',
      businessId: '1',
      type: 'EXPENSE',
      amount: 1500,
      date: new Date(),
      category: 'Maintenance',
      vendor: 'Auto Shop',
      description: 'Oil change',
    },
    {
      id: '3',
      businessId: '1',
      type: 'TOP_UP',
      amount: 50000,
      date: new Date(Date.now() - 86400000),
      description: 'Cash advance',
    },

    // Sample data for Alfa Stand
    {
      id: '4',
      businessId: '2',
      type: 'EXPENSE',
      amount: 3500,
      date: new Date(),
      category: 'Supplies',
      vendor: 'Market',
      description: 'Stock purchase',
    },
    {
      id: '5',
      businessId: '2',
      type: 'TOP_UP',
      amount: 30000,
      date: new Date(Date.now() - 172800000),
      description: 'Cash injection',
    },

    // Sample data for ALFA Bagh
    {
      id: '6',
      businessId: '3',
      type: 'EXPENSE',
      amount: 4200,
      date: new Date(),
      category: 'Utilities',
      vendor: 'Electric Co',
      description: 'Electricity bill',
    },
  ];

  private transactionsSubject = new BehaviorSubject<Transaction[]>(this.transactions);
  public transactions$ = this.transactionsSubject.asObservable();

  // Get transactions for current business
  getCurrentBusinessTransactions() {
    const currentBusiness = this.businessService.getCurrentBusiness();
    return this.transactions.filter((t) => t.businessId === currentBusiness.id);
  }

  // Get today's expenses for current business
  getTodaysExpenses(): number {
    const today = new Date().toDateString();
    const currentBusiness = this.businessService.getCurrentBusiness();

    return this.transactions
      .filter(
        (t) =>
          t.businessId === currentBusiness.id &&
          t.type === 'EXPENSE' &&
          new Date(t.date).toDateString() === today
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Get month-to-date expenses
  getMTDExpenses(): number {
    const currentBusiness = this.businessService.getCurrentBusiness();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.transactions
      .filter(
        (t) =>
          t.businessId === currentBusiness.id &&
          t.type === 'EXPENSE' &&
          new Date(t.date) >= firstDayOfMonth
      )
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Add new transaction
  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };

    this.transactions.push(newTransaction);
    this.transactionsSubject.next([...this.transactions]);

    // Update business balance
    if (transaction.type === 'TOP_UP') {
      const newBalance =
        this.businessService.getCurrentBusiness().currentBalance + transaction.amount;
      this.businessService.updateBusinessBalance(transaction.businessId, newBalance);
    } else {
      const newBalance =
        this.businessService.getCurrentBusiness().currentBalance - transaction.amount;
      this.businessService.updateBusinessBalance(transaction.businessId, newBalance);
    }
  }
}
