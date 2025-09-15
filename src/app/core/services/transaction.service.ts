import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { BusinessService } from './business.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private businessService = inject(BusinessService);

  private transactions: Transaction[] = [];

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
          (t.type === 'EXPENSE' || t.type === 'SALARY_PAYMENT') &&
          new Date(t.date).toDateString() === today // ← Check date for BOTH types
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
          (t.type === 'EXPENSE' || t.type === 'SALARY_PAYMENT') &&
          new Date(t.date) >= firstDayOfMonth // ← Check date for BOTH types
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

  // Add salary-specific methods
  getSalaryPayments(): Transaction[] {
    return this.transactions.filter((t) => t.type === 'SALARY_PAYMENT');
  }

  getEmployeeSalaryPayments(employeeId: string): Transaction[] {
    return this.transactions.filter(
      (t) => t.type === 'SALARY_PAYMENT' && t.employeeId === employeeId
    );
  }

  getAllTransactions(): Transaction[] {
    return this.transactions; // Return all transactions across all businesses
  }

  getTransactionsByBusiness(businessId: string): Transaction[] {
    return this.transactions.filter((t) => t.businessId === businessId);
  }
}
