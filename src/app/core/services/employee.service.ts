import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Employee } from '../models/empolyee.model';
import { BusinessService } from './business.service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private businessService = inject(BusinessService);

  private employees: Employee[] = [
    // Sample data for ALFA Petroleum
    {
      id: '1',
      businessId: '1',
      name: 'Usman Ali',
      title: 'Station Manager',
      monthlySalaryAmount: 75000,
      salaryDueDay: 5,
      phone: '+923001234568',
      active: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      businessId: '1',
      name: 'Bilal Ahmed',
      title: 'Accountant',
      monthlySalaryAmount: 55000,
      salaryDueDay: 5,
      phone: '+923001234569',
      active: true,
      createdAt: new Date('2024-01-15'),
    },
    // Sample data for other businesses
    {
      id: '3',
      businessId: '2',
      name: 'Saleem Khan',
      title: 'Sales Staff',
      monthlySalaryAmount: 35000,
      salaryDueDay: 5,
      active: true,
      createdAt: new Date('2024-02-01'),
    },
  ];

  private employeesSubject = new BehaviorSubject<Employee[]>(this.employees);
  public employees$ = this.employeesSubject.asObservable();

  // Get employees for current business
  getEmployees(): Employee[] {
    const currentBusiness = this.businessService.getCurrentBusiness();
    return this.employees.filter((emp) => emp.businessId === currentBusiness.id && emp.active);
  }

  // Get employee by ID
  getEmployeeById(id: string): Employee | undefined {
    return this.employees.find((emp) => emp.id === id);
  }

  // Add new employee
  addEmployee(employee: Omit<Employee, 'id'>): void {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.employees.push(newEmployee);
    this.employeesSubject.next([...this.employees]);
  }

  // Update employee
  updateEmployee(id: string, updates: Partial<Employee>): void {
    const index = this.employees.findIndex((emp) => emp.id === id);
    if (index !== -1) {
      this.employees[index] = {
        ...this.employees[index],
        ...updates,
        updatedAt: new Date(),
      };
      this.employeesSubject.next([...this.employees]);
    }
  }

  // Delete employee (soft delete)
  deleteEmployee(id: string): void {
    const index = this.employees.findIndex((emp) => emp.id === id);
    if (index !== -1) {
      this.employees[index] = {
        ...this.employees[index],
        active: false,
        updatedAt: new Date(),
      };
      this.employeesSubject.next([...this.employees]);
    }
  }

  // Get upcoming salary payments
  getUpcomingSalaries(): { employee: Employee; amountDue: number; dueDate: Date }[] {
    const employees = this.getEmployees();
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    return employees.map((employee) => {
      const dueDate = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        employee.salaryDueDay
      );
      return {
        employee,
        amountDue: employee.monthlySalaryAmount,
        dueDate,
      };
    });
  }
}
