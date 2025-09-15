export interface Employee {
  id?: string;
  businessId: string;
  name: string;
  title?: string;
  cnic?: string;
  cnicImageUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  startDate?: Date;
  emergencyContact?: string;
  departmentOrSite?: string;
  bankDetails?: string;
  notes?: string;
  monthlySalaryAmount: number;
  salaryDueDay: number; // 1-31
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SalaryPayment {
  id?: string;
  employeeId: string;
  businessId: string;
  amount: number;
  date: Date;
  period: string; // YYYY-MM
  partialPayment: boolean;
  notes?: string;
  payslipUrl?: string;
}

export interface SalarySchedule {
  id?: string;
  employeeId: string;
  month: string; // YYYY-MM
  dueDate: Date;
  status: 'DUE' | 'PAID' | 'PARTIAL';
  totalDue: number;
  totalPaid: number;
  remaining: number;
}
