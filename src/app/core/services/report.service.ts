import { Injectable, inject } from '@angular/core';
import { BusinessService } from './business.service';
import { EmployeeService } from './employee.service';
import { TransactionService } from './transaction.service';

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  businessId?: string;
  category?: string;
  vendor?: string;
  employeeId?: string;
}

export interface ReportData {
  title: string;
  type: 'spend' | 'summary' | 'salary' | 'reconciliation' | 'audit';
  data: any[] | { byCategory: any[]; byVendor: any[] }; // ← Union type
  summary?: {
    total: number;
    average: number;
    count: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private businessService = inject(BusinessService);
  private transactionService = inject(TransactionService);
  private employeeService = inject(EmployeeService);

  // R1: Daily Spend by Business
  getDailySpendReport(filters: ReportFilters): ReportData {
    const transactions = this.getFilteredTransactions(filters);
    console.log(transactions);
    // ONLY include expenses for daily spend report
    const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
    const dailyData = this.groupByDate(expenseTransactions);
    const total = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      title: 'Daily Spend Report',
      type: 'spend',
      data: dailyData,
      summary: {
        total,
        average: total / (dailyData.length || 1),
        count: expenseTransactions.length,
      },
    };
  }

  // R2: Category/Vendor Spend
  getCategorySpendReport(filters: ReportFilters): ReportData {
    const transactions = this.getFilteredTransactions(filters).filter((t) => t.type === 'EXPENSE');

    const categoryData = this.groupByCategory(transactions);
    const vendorData = this.groupByVendor(transactions);

    return {
      title: 'Category & Vendor Spend',
      type: 'spend',
      data: {
        byCategory: categoryData,
        byVendor: vendorData,
      },
    };
  }

  // R3: Business Summary
  getBusinessSummaryReport(filters: ReportFilters): ReportData {
    const currentBusiness = this.businessService.getCurrentBusiness();
    const allTransactions = this.transactionService.getAllTransactions();

    // 1. Get transactions for THIS BUSINESS only
    const businessTransactions = allTransactions.filter((t) => t.businessId === currentBusiness.id);

    // 2. CORRECT Opening Balance: Balance at START of report period
    const prePeriodTransactions = businessTransactions.filter(
      (t) => new Date(t.date) < filters.startDate
    );

    const openingBalance =
      currentBusiness.initialBalance +
      prePeriodTransactions
        .filter((t) => t.type === 'TOP_UP')
        .reduce((sum, t) => sum + t.amount, 0) -
      prePeriodTransactions
        .filter((t) => t.type === 'EXPENSE' || t.type === 'SALARY_PAYMENT')
        .reduce((sum, t) => sum + t.amount, 0);

    // 3. CORRECT Period Transactions (within date range)
    const periodTransactions = businessTransactions.filter(
      (t) => new Date(t.date) >= filters.startDate && new Date(t.date) <= filters.endDate
    );

    // 4. CORRECT Calculations
    const topUps = periodTransactions
      .filter((t) => t.type === 'TOP_UP')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = periodTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const salaries = periodTransactions
      .filter((t) => t.type === 'SALARY_PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOutflows = expenses + salaries;
    const closingBalance = openingBalance + topUps - totalOutflows;

    return {
      title: `Business Summary - ${currentBusiness.name}`,
      type: 'summary',
      data: [
        {
          openingBalance,
          topUps,
          expenses,
          salaries,
          totalExpenditure: totalOutflows,
          closingBalance,
          transactionCount: periodTransactions.length,
          period: {
            start: filters.startDate.toISOString().split('T')[0],
            end: filters.endDate.toISOString().split('T')[0],
          },
        },
      ],
    };
  }

  // R4: Salary Liability
  getSalaryLiabilityReport(filters: ReportFilters): ReportData {
    const employees = this.employeeService.getEmployees();
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const liabilityData = employees.map((employee) => {
      const dueDate = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        employee.salaryDueDay
      );
      return {
        employee: employee.name,
        monthlySalary: employee.monthlySalaryAmount,
        dueDate,
        daysUntilDue: Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        status: dueDate > now ? 'UPCOMING' : 'DUE',
      };
    });

    const totalLiability = liabilityData.reduce((sum, item) => sum + item.monthlySalary, 0);

    return {
      title: 'Salary Liability Report',
      type: 'salary',
      data: liabilityData,
      summary: {
        total: totalLiability,
        average: totalLiability / (liabilityData.length || 1),
        count: liabilityData.length,
      },
    };
  }

  // R5: Cash Advances vs Usage
  getReconciliationReport(filters: ReportFilters): ReportData {
    const transactions = this.getFilteredTransactions(filters);

    const topUps = transactions.filter((t) => t.type === 'TOP_UP');
    const expenses = transactions.filter((t) => t.type === 'EXPENSE');

    const totalTopUps = topUps.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const variance = totalTopUps - totalExpenses;

    return {
      title: 'Cash Reconciliation',
      type: 'reconciliation',
      data: [
        {
          totalTopUps,
          totalExpenses,
          variance,
          topUpCount: topUps.length,
          expenseCount: expenses.length,
        },
      ],
    };
  }

  // Helper methods
  private getFilteredTransactions(filters: ReportFilters): any[] {
    let transactions = this.transactionService.getCurrentBusinessTransactions();

    // Filter by date
    transactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= filters.startDate && transactionDate <= filters.endDate;
    });

    // Additional filters can be added here
    if (filters.category) {
      transactions = transactions.filter((t) => t.category === filters.category);
    }

    if (filters.vendor) {
      transactions = transactions.filter((t) => t.vendorName?.includes(filters.vendor!));
    }

    return transactions;
  }

  private groupByDate(transactions: any[]): any[] {
    const grouped: { [key: string]: any } = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = {
          date,
          expenses: 0,
          topUps: 0,
          salaries: 0,
          transactions: [],
        };
      }

      if (transaction.type === 'EXPENSE') {
        grouped[date].expenses += transaction.amount;
      } else if (transaction.type === 'TOP_UP') {
        grouped[date].topUps += transaction.amount;
      } else if (transaction.type === 'SALARY_PAYMENT') {
        grouped[date].salaries += transaction.amount;
      }

      grouped[date].transactions.push(transaction);
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  private groupByCategory(transactions: any[]): any[] {
    const grouped: { [key: string]: any } = {};

    transactions.forEach((transaction) => {
      const category = transaction.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = {
          category,
          total: 0,
          count: 0,
          transactions: [],
        };
      }

      grouped[category].total += transaction.amount;
      grouped[category].count++;
      grouped[category].transactions.push(transaction);
    });

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }

  private groupByVendor(transactions: any[]): any[] {
    const grouped: { [key: string]: any } = {};

    transactions.forEach((transaction) => {
      const vendor = transaction.vendorName || 'Unknown Vendor';
      if (!grouped[vendor]) {
        grouped[vendor] = {
          vendor,
          total: 0,
          count: 0,
          transactions: [],
        };
      }

      grouped[vendor].total += transaction.amount;
      grouped[vendor].count++;
      grouped[vendor].transactions.push(transaction);
    });

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }

  // Export methods (to be implemented)
  exportToCSV(data: any[], filename: string): void {
    console.log('Exporting to CSV:', filename);
    // Will implement CSV export
  }

  exportToPDF(data: any[], filename: string): void {
    console.log('Exporting to PDF:', filename);
    // Will implement PDF export
  }
}
