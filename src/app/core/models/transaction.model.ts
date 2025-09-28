export interface Expense {
  id?: string;
  business_id: string;
  amount: number;
  date: Date;
  category_id: string;
  vendor_name: string;
  product_name?: string;
  quantity?: number;
  tax_amount?: number;
  location?: string;
  notes?: string;
  receipt_image_url?: string;
  ocrExtracted?: any;
}

export interface ExpenseFormData {
  amount: number;
  date: Date;
  category_id: string;
  vendor_name: string;
  product_name?: string;
  quantity?: number;
  tax_amount?: number;
  location?: string;
  notes?: string;
  receipt_image_url?: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  type: 'TOP_UP' | 'EXPENSE' | 'SALARY_PAYMENT';
  amount: number;
  date: Date;
  category_id?: string;
  vendor_name?: string; // Make sure this exists
  product_name?: string; // Add this property
  description?: string; // This might be what you meant to use
  tax_amount?: number;
  // Add Top-Up specific properties (optional)
  handedTo?: string; // For TOP_UP transactions
  method?: string; // For TOP_UP transactions
  transferReason?: string;
  receipt_image_url?: string;
  // Add Salary specific properties (optional - for future)
  employeeId?: string; // For SALARY_PAYMENT transactions
  period?: string; // For SALARY_PAYMENT transactions
}

export interface TopUp {
  id?: string;
  business_id: string;
  amount: number;
  date: Date;
  handedTo: string; // Manager name
  method: 'Jazz Cash' | 'Easy Paisa' | 'Bank';
  transferReason?: string;
  proofImage?: File;
  notes?: string;
}

export interface TopUpFormData {
  amount: number;
  date: Date;
  handedTo: string;
  method: 'Jazz Cash' | 'Easy Paisa' | 'Bank';
  transferReason?: string;
  proofImage?: File;
  notes?: string;
}
