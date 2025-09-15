export interface Expense {
  id?: string;
  businessId: string;
  amount: number;
  date: Date;
  category: string;
  vendorName: string;
  productName?: string;
  quantity?: number;
  taxAmount?: number;
  location?: string;
  notes?: string;
  receiptImage?: File | string;
  ocrExtracted?: any;
}

export interface ExpenseFormData {
  amount: number;
  date: Date;
  category: string;
  vendorName: string;
  productName?: string;
  quantity?: number;
  taxAmount?: number;
  location?: string;
  notes?: string;
  receiptImage?: File;
}

export interface Transaction {
  id: string;
  businessId: string;
  type: 'TOP_UP' | 'EXPENSE' | 'SALARY_PAYMENT';
  amount: number;
  date: Date;
  category?: string;
  vendorName?: string; // Make sure this exists
  productName?: string; // Add this property
  description?: string; // This might be what you meant to use
  // Add Top-Up specific properties (optional)
  handedTo?: string; // For TOP_UP transactions
  method?: string; // For TOP_UP transactions

  // Add Salary specific properties (optional - for future)
  employeeId?: string; // For SALARY_PAYMENT transactions
  period?: string; // For SALARY_PAYMENT transactions
}

export interface TopUp {
  id?: string;
  businessId: string;
  amount: number;
  date: Date;
  handedTo: string; // Manager name
  method: 'cash' | 'bank' | 'other';
  notes?: string;
}

export interface TopUpFormData {
  amount: number;
  date: Date;
  handedTo: string;
  method: 'cash' | 'bank' | 'other';
  notes?: string;
}
