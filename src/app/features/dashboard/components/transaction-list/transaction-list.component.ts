import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { Transaction } from '../../../../core/models/transaction.model';
import { BusinessService } from '../../../../core/services/business.service';
import { CategoryService } from '../../../../core/services/category.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { ProductService } from '../../../../core/services/product.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { VendorService } from '../../../../core/services/vendor.service';
import { TitleCasePipe } from '../../../../shared/pipes/titlecase-pipe';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  template: `
    <div class="transaction-list">
      <div class="list-header">
        <h2>Recent Transactions</h2>

        <!-- Filters -->
        <div class="filters">
          <select [ngModel]="filterType()" (ngModelChange)="filterType.set($event)">
            <option value="ALL">All Transactions</option>
            <option value="EXPENSE">Expenses</option>
            <option value="TOP_UP">Top-Ups</option>
            <option value="SALARY_PAYMENT">Salary Payments</option>
          </select>

          <input
            type="text"
            placeholder="Search vendor or description..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            class="search-input"
          />
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="transactions-container">
        @if (filteredTransactions().length === 0) {
        <div class="empty-state">
          <p>No transactions found</p>
          <span>Start by adding your first expense or top-up</span>
        </div>
        } @else {
        <div *ngIf="transactions$ | async as transaction" class="transaction-table">
          <!-- Table Header -->
          <div class="table-header">
            <div class="col-date">Date</div>
            <div class="col-type">Type</div>
            <div class="col-vendor">Vendor/Description</div>
            <div class="col-category">Category</div>
            <div class="col-amount">Amount</div>
          </div>

          <!-- Table Rows -->
          @for (transaction of transactions$ | async; track transaction.id) {
          <div
            class="table-row"
            [class.expense]="transaction.type === 'EXPENSE'"
            [class.income]="transaction.type !== 'EXPENSE'"
          >
            <div class="col-date">{{ transaction.date | date : 'shortDate' }}</div>
            <div class="col-type">
              <span class="type-badge" [class]="transaction.type.toLowerCase()">
                {{ transaction.type | titlecase }}
              </span>
            </div>
            <div class="col-vendor">
              <div class="vendor-name">
                @if (transaction.type === 'TOP_UP') {
                {{ transaction.handedTo }}
                } @else {
                {{ transaction.vendor_name || 'N/A' }}
                }
              </div>
              @if (transaction.product_name) {
              <div class="product-name">{{ transaction.product_name }}</div>
              }
            </div>
            <div class="col-category">
              @if (transaction.type === 'TOP_UP') { {{ transaction.method }}
              } @else {
              {{ transaction.category_id || 'N/A' }}
              }
            </div>
            <div class="col-amount">
              <span
                [class.negative]="
                  transaction.type === 'EXPENSE' || transaction.type === 'SALARY_PAYMENT'
                "
              >
                {{
                  transaction.type === 'EXPENSE' || transaction.type === 'SALARY_PAYMENT'
                    ? '-'
                    : '+'
                }}
                PKR {{ transaction.amount | number }}
              </span>
            </div>
          </div>
          }
        </div>
        }

        <!-- Summary -->
        @if (filteredTransactions().length > 0) {
        <div class="transaction-summary">
          <div class="summary-item">
            <span>Total Transactions:</span>
            <strong>{{ filteredTransactions().length }}</strong>
          </div>
          <div class="summary-item">
            <span>Total Amount:</span>
            <strong>PKR {{ getTotalAmount() | number }}</strong>
          </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .transaction-list {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .list-header h2 {
        margin: 0;
        color: #2d3748;
        font-size: 1.5rem;
      }

      .filters {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      select,
      .search-input {
        padding: 0.5rem;
        border: 2px solid #e2e8f0;
        border-radius: 6px;
        font-size: 0.9rem;
      }

      .search-input {
        min-width: 250px;
      }

      .transactions-container {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }

      .empty-state {
        padding: 3rem;
        text-align: center;
        color: #718096;
      }

      .empty-state p {
        margin: 0 0 0.5rem 0;
        font-weight: 600;
      }

      .transaction-table {
        width: 100%;
      }

      .table-header,
      .table-row {
        display: grid;
        grid-template-columns: 1fr 0.8fr 2fr 1fr 1fr;
        gap: 1rem;
        padding: 1rem;
        align-items: center;
      }

      .table-header {
        background: #f7fafc;
        font-weight: 600;
        color: #4a5568;
        border-bottom: 2px solid #e2e8f0;
      }

      .table-row {
        border-bottom: 1px solid #e2e8f0;
        transition: background-color 0.2s;

        &:hover {
          background: #f7fafc;
        }

        &.expense {
          border-left: 4px solid #e53e3e;
        }

        &.income {
          border-left: 4px solid #38a169;
        }
      }

      .type-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;

        &.expense {
          background: #fed7d7;
          color: #c53030;
        }

        &.top_up {
          background: #c6f6d5;
          color: #2f855a;
        }

        &.salary_payment {
          background: #bee3f8;
          color: #2c5282;
        }
      }

      .vendor-name {
        font-weight: 600;
        color: #2d3748;
      }

      .product-name {
        font-size: 0.875rem;
        color: #718096;
        margin-top: 0.25rem;
      }

      .col-amount {
        text-align: right;
        font-weight: 600;
      }

      .negative {
        color: #e53e3e;
      }

      .transaction-summary {
        display: flex;
        justify-content: flex-end;
        gap: 2rem;
        padding: 1rem;
        background: #f7fafc;
        border-top: 1px solid #e2e8f0;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .summary-item span {
        font-size: 0.875rem;
        color: #718096;
      }

      .summary-item strong {
        color: #2d3748;
        font-size: 1.1rem;
      }

      @media (max-width: 968px) {
        .table-header,
        .table-row {
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .col-category {
          display: none;
        }

        .filters {
          flex-direction: column;
          align-items: stretch;
        }

        .search-input {
          min-width: auto;
        }
      }

      @media (max-width: 640px) {
        .list-header {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `,
  ],
})
export class TransactionListComponent implements OnInit {
  private businessService = inject(BusinessService);
  private transactionService = inject(TransactionService);
  private categoryService = inject(CategoryService);
  private vendorService = inject(VendorService);
  private productService = inject(ProductService);
  private employeeService = inject(EmployeeService);

  transactions$ = this.transactionService.transactions$; // subscribe via async pipe

  filterType = signal<'ALL' | 'EXPENSE' | 'TOP_UP' | 'SALARY_PAYMENT'>('ALL');
  searchQuery = signal('');

  // Derived transactions with names
  filteredTransactions = signal<Transaction[]>([]);

  ngOnInit() {
    const currentBusiness$ = this.businessService.currentBusiness$;
    const currentBusiness = this.businessService.getCurrentBusiness();
    const currentBusinessId = currentBusiness?.id ?? '';

    if (!currentBusinessId) return;

    // Combine transactions and reference data streams
    combineLatest([
      this.transactionService.transactions$,
      this.categoryService.getCategories(currentBusinessId),
      this.vendorService.getVendor(currentBusinessId),
      this.productService.getProduct(currentBusinessId),
      this.employeeService.employees$,
      currentBusiness$,
    ])
      .pipe(
        map(([transactions, categories, vendors, products, employees, currentBusiness]) => {
          if (!currentBusiness) return [];

          // Filter by current business
          let businessTransactions = transactions.filter(
            (t) => t.business_id === currentBusiness.id
          );

          // Map IDs to names
          businessTransactions = businessTransactions.map((t) => ({
            ...t,
            categoryName: categories.find((c) => c.id === t.category_id)?.name || '-',
            vendorName: vendors.find((v) => v.id === t.vendor_name)?.name || '-',
            productName: products.find((p) => p.id === t.product_name)?.name || '-',
            employeeName: employees.find((e) => e.id === t.employeeId)?.name || '-',
          }));

          return businessTransactions;
        })
      )
      .subscribe((transactions) => {
        this.filteredTransactions.set(transactions);
        this.applyFilters();
      });

    // Reactively apply filters when search or type changes

    effect(() => {
      this.filterType(); // Track the signal value
      this.applyFilters(); // This runs whenever filterType changes
    });
    effect(() => {
      this.searchQuery(); // Track the signal value
      this.applyFilters(); // This runs whenever filterType changes
    });
  }

  applyFilters(): void {
    let filtered = this.filteredTransactions();

    // Filter by type
    if (this.filterType() !== 'ALL') {
      filtered = filtered.filter((t) => t.type === this.filterType());
    }

    // Filter by search query
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.vendor_name?.toLowerCase().includes(query) ||
          t.product_name?.toLowerCase().includes(query) ||
          t.category_id?.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.filteredTransactions.set(filtered);
  }

  getTotalAmount(): number {
    return this.filteredTransactions().reduce((total, t) => {
      if (t.type === 'EXPENSE' || t.type === 'SALARY_PAYMENT') {
        return total - t.amount; // Money OUT
      } else {
        return total + t.amount; // Money IN (TOP_UP)
      }
    }, 0);
  }
}
