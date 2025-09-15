import { Injectable, inject } from '@angular/core';
import { BusinessService } from './business.service';
import { EmployeeService } from './employee.service';

export interface PayslipData {
  employee: any;
  payment: any;
  business: any;
  period: string;
  paymentDate: Date;
  amount: number;
  isPartial: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PayslipService {
  private employeeService = inject(EmployeeService);
  private businessService = inject(BusinessService);

  generatePayslip(data: PayslipData): void {
    // This will be implemented with jsPDF
    this.generatePayslipPDF(data);
  }

  private generatePayslipPDF(data: PayslipData): void {
    // We'll implement this after creating the template
    console.log('Generating payslip for:', data.employee.name);

    // For now, create a downloadable HTML page
    this.generateHTMLPayslip(data);
  }

  private generateHTMLPayslip(data: PayslipData): void {
    const payslipWindow = window.open('', '_blank');
    if (!payslipWindow) return;

    const payslipHTML = this.createPayslipHTML(data);
    payslipWindow.document.write(payslipHTML);
    payslipWindow.document.close();

    // Add print functionality
    payslipWindow.focus();
    payslipWindow.print();
  }

  private createPayslipHTML(data: PayslipData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Payslip - ${data.employee.name} - ${data.period}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .payslip-container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; margin: 0; }
    .company-address { color: #7f8c8d; margin: 5px 0; }
    .payslip-title { font-size: 20px; color: #2c3e50; margin: 20px 0; }
    
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; color: #2c3e50; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
    
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .info-item { margin-bottom: 10px; }
    .info-label { font-weight: bold; color: #7f8c8d; display: block; }
    .info-value { color: #2c3e50; }
    
    .salary-breakdown { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .salary-breakdown th { background: #34495e; color: white; padding: 12px; text-align: left; }
    .salary-breakdown td { padding: 12px; border-bottom: 1px solid #ddd; }
    .salary-breakdown tr:last-child td { border-bottom: none; font-weight: bold; background: #ecf0f1; }
    
    .footer { text-align: center; margin-top: 40px; color: #7f8c8d; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
    
    @media print {
      body { background: white; margin: 0; }
      .payslip-container { box-shadow: none; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="payslip-container">
    <!-- Header -->
    <div class="header">
      <h1 class="company-name">ALFA ENTERPRISES</h1>
      <div class="company-address">123 Business Street, Karachi, Pakistan</div>
      <div class="company-address">Phone: +92-21-XXXX-XXXX | Email: accounts@alfa.com</div>
      <h2 class="payslip-title">PAYSLIP FOR ${data.period}</h2>
    </div>

    <!-- Employee & Payment Info -->
    <div class="info-grid">
      <div class="section">
        <h3 class="section-title">Employee Information</h3>
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">${data.employee.name}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Employee ID:</span>
          <span class="info-value">${data.employee.id}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Department:</span>
          <span class="info-value">${data.employee.departmentOrSite || 'Not specified'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Designation:</span>
          <span class="info-value">${data.employee.title || 'Not specified'}</span>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Payment Information</h3>
        <div class="info-item">
          <span class="info-label">Payment Date:</span>
          <span class="info-value">${new Date(data.paymentDate).toLocaleDateString()}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Pay Period:</span>
          <span class="info-value">${data.period}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Payment Type:</span>
          <span class="info-value">${data.isPartial ? 'Partial Payment' : 'Full Salary'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Business:</span>
          <span class="info-value">${data.business.name}</span>
        </div>
      </div>
    </div>

    <!-- Salary Breakdown -->
    <div class="section">
      <h3 class="section-title">Salary Breakdown</h3>
      <table class="salary-breakdown">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount (PKR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td>${data.employee.monthlySalaryAmount.toLocaleString()}</td>
          </tr>
          ${
            data.isPartial
              ? `
          <tr>
            <td>Partial Payment</td>
            <td>-${(data.employee.monthlySalaryAmount - data.amount).toLocaleString()}</td>
          </tr>
          `
              : ''
          }
          <tr>
            <td><strong>Net Pay</strong></td>
            <td><strong>${data.amount.toLocaleString()}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Notes -->
    ${
      data.notes
        ? `
    <div class="section">
      <h3 class="section-title">Notes</h3>
      <p>${data.notes}</p>
    </div>
    `
        : ''
    }

    <!-- Footer -->
    <div class="footer">
      <p>This is computer generated payslip and does not require signature.</p>
      <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>

    <!-- Print Button -->
    <div class="no-print" style="text-align: center; margin-top: 20px;">
      <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Print Payslip
      </button>
    </div>
  </div>
</body>
</html>
    `;
  }

  // TODO: Implement jsPDF version for proper PDF download
  async generatePDFPayslip(data: PayslipData): Promise<void> {
    // This will be implemented with jsPDF and html2canvas
    console.log('PDF generation will be implemented with jsPDF');
  }
}
