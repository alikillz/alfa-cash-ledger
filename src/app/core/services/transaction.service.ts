import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { BusinessService } from './business.service';
import { SupabaseService } from './Supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private businessService = inject(BusinessService);
  private supabase = inject(SupabaseService).client;
  // Main store
  private transactions: Transaction[] = [];
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  // Dashboard metrics
  private todaysExpensesSubject = new BehaviorSubject<number>(0);
  public todaysExpenses$ = this.todaysExpensesSubject.asObservable();

  private mtdExpensesSubject = new BehaviorSubject<number>(0);
  public mtdExpenses$ = this.mtdExpensesSubject.asObservable();

  private salaryPaymentsSubject = new BehaviorSubject<Transaction[]>([]);
  public salaryPayments$ = this.salaryPaymentsSubject.asObservable();

  private transactionsByBusinessSubject = new BehaviorSubject<Map<string, Transaction[]>>(
    new Map()
  );
  public transactionsByBusiness$ = this.transactionsByBusinessSubject.asObservable();

  private employeeSalaryMapSubject = new BehaviorSubject<Map<string, Transaction[]>>(new Map());
  public employeeSalaryMap$ = this.employeeSalaryMapSubject.asObservable();

  // ----------------------
  // Load all transactions once
  // ----------------------
  async loadAllTransactions(initialTransactions: Transaction[]) {
    console.log('load');
    const biz = this.businessService.getCurrentBusiness();
    console.log(biz);

    const { data, error } = await this.supabase
      .from('ledger_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    this.transactions = [...data];
    console.log(this.transactions);
    this.transactionsSubject.next(this.transactions);
    // Full compute at load
    this.computeAllMetrics();
  }

  // ----------------------
  // Add a transaction (partial recompute)
  // ----------------------
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<void> {
    console.log(transaction);
    const { error } = await this.supabase.from('ledger_transactions').insert([transaction]);
    if (error) throw error;
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };

    this.transactions.push(newTransaction);
    this.transactionsSubject.next([...this.transactions]);

    // Update only affected metrics
    this.updateMetricsOnAdd(newTransaction);

    // Update business balance
    const currentBusiness = this.businessService.getCurrentBusiness();
    if (currentBusiness) {
      const newBalance =
        transaction.type === 'TOP_UP'
          ? currentBusiness.current_balance + transaction.amount
          : currentBusiness.current_balance - transaction.amount;

      this.businessService.updateBusinessBalance(transaction.business_id, newBalance);
    }
  }

  // ----------------------
  // Full compute (used at initial load)
  // ----------------------
  private computeAllMetrics(): void {
    const now = new Date();
    const todayStr = now.toDateString();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todaySum = 0;
    let mtdSum = 0;
    const salaryPayments: Transaction[] = [];
    const byBusiness = new Map<string, Transaction[]>();
    const byEmployee = new Map<string, Transaction[]>();

    this.transactions.forEach((t) => {
      const tDate = new Date(t.date);
      // Today’s expenses
      if (
        (t.type === 'EXPENSE' || t.type === 'SALARY_PAYMENT') &&
        tDate.toDateString() === todayStr
      ) {
        todaySum += t.amount;
      }

      // Month-to-date expenses
      if ((t.type === 'EXPENSE' || t.type === 'SALARY_PAYMENT') && tDate >= firstDayOfMonth) {
        mtdSum += t.amount;
      }

      // Salary payments
      if (t.type === 'SALARY_PAYMENT') {
        salaryPayments.push(t);
        if (t.employeeId) {
          if (!byEmployee.has(t.employeeId)) byEmployee.set(t.employeeId, []);
          byEmployee.get(t.employeeId)?.push(t);
        }
      }

      // By business
      if (!byBusiness.has(t.business_id)) byBusiness.set(t.business_id, []);
      byBusiness.get(t.business_id)?.push(t);
    });

    this.todaysExpensesSubject.next(todaySum);
    this.mtdExpensesSubject.next(mtdSum);
    this.salaryPaymentsSubject.next(salaryPayments);
    this.transactionsByBusinessSubject.next(byBusiness);
    this.employeeSalaryMapSubject.next(byEmployee);
  }

  // ----------------------
  // Partial update on single transaction addition
  // ----------------------
  private updateMetricsOnAdd(transaction: Transaction): void {
    const now = new Date();
    const todayStr = now.toDateString();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today’s expenses
    if (
      (transaction.type === 'EXPENSE' || transaction.type === 'SALARY_PAYMENT') &&
      new Date(transaction.date).toDateString() === todayStr
    ) {
      const current = this.todaysExpensesSubject.getValue();
      this.todaysExpensesSubject.next(current + transaction.amount);
    }

    // Month-to-date expenses
    if (
      (transaction.type === 'EXPENSE' || transaction.type === 'SALARY_PAYMENT') &&
      new Date(transaction.date) >= firstDayOfMonth
    ) {
      const current = this.mtdExpensesSubject.getValue();
      this.mtdExpensesSubject.next(current + transaction.amount);
    }

    // Salary payments
    if (transaction.type === 'SALARY_PAYMENT') {
      const currentSalary = this.salaryPaymentsSubject.getValue();
      this.salaryPaymentsSubject.next([...currentSalary, transaction]);

      if (transaction.employeeId) {
        const byEmployee = this.employeeSalaryMapSubject.getValue();
        if (!byEmployee.has(transaction.employeeId)) byEmployee.set(transaction.employeeId, []);
        byEmployee.get(transaction.employeeId)?.push(transaction);
        this.employeeSalaryMapSubject.next(byEmployee);
      }
    }

    // Transactions by business
    const byBusiness = this.transactionsByBusinessSubject.getValue();
    if (!byBusiness.has(transaction.business_id)) byBusiness.set(transaction.business_id, []);
    byBusiness.get(transaction.business_id)?.push(transaction);
    this.transactionsByBusinessSubject.next(byBusiness);
  }

  // ----------------------
  // Helper getters
  // ----------------------
  getTransactionsByBusiness(businessId: string): Transaction[] {
    return this.transactionsByBusinessSubject.getValue().get(businessId) ?? [];
  }

  getEmployeeSalaryPayments(employeeId: string): Transaction[] {
    return this.employeeSalaryMapSubject.getValue().get(employeeId) ?? [];
  }

  getAllTransactions(): Transaction[] {
    return [...this.transactions];
  }
}
