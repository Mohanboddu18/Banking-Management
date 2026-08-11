import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { ManagerService } from '../../../core/services/manager.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-customer-management',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
          <i class="fa-solid fa-user-check text-emerald-400"></i> Customer Accounts & KYC Governance
        </h1>
        <p class="text-xs text-slate-400">Search customer accounts, verify ledger balances, and enforce account lock / suspension</p>
      </div>

      <!-- Search Bar -->
      <div class="bank-glass p-6 rounded-3xl space-y-4">
        <div class="flex gap-3">
          <input [(ngModel)]="query" (keyup.enter)="search()" type="text" placeholder="Search by customer name, account number, or PAN..." class="bank-input" />
          <button (click)="search()" class="bank-btn-primary px-6">
            <i class="fa-solid fa-magnifying-glass"></i> Search
          </button>
        </div>
      </div>

      <!-- Accounts Table -->
      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
        <h3 class="text-base font-bold text-white">Registered Customer Accounts ({{ accounts().length }})</h3>

        <div class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Customer Name</th>
                <th>Type</th>
                <th>Available Balance</th>
                <th>Ledger Balance</th>
                <th>Status</th>
                <th>Governance Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of accounts()">
                <td class="font-mono text-xs font-bold text-sky-400">{{ a.accountNumber }}</td>
                <td>
                  <div class="font-bold text-white text-xs">{{ a.customerName }}</div>
                  <div class="text-[10px] text-slate-500 font-mono">{{ a.customerId }}</div>
                </td>
                <td>
                  <span class="badge badge-info text-[10px]">{{ a.accountTypeName }}</span>
                </td>
                <td class="text-xs font-bold text-emerald-400 font-mono">{{ a.balance | inrCurrency }}</td>
                <td class="text-xs font-mono text-slate-300">{{ a.ledgerBalance | inrCurrency }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-success': a.status === 'ACTIVE',
                    'badge-danger': a.status === 'SUSPENDED' || a.status === 'CLOSED',
                    'badge-warning': a.status === 'PENDING_APPROVAL'
                  }">
                    {{ a.status }}
                  </span>
                </td>
                <td>
                  <button (click)="toggleAccountStatus(a)" class="bank-btn-secondary text-xs py-1 px-3"
                          [ngClass]="a.status === 'ACTIVE' ? 'hover:border-rose-500/50 hover:text-rose-400' : 'hover:border-emerald-500/50 hover:text-emerald-400'">
                    <i class="fa-solid" [ngClass]="a.status === 'ACTIVE' ? 'fa-ban' : 'fa-check'"></i>
                    {{ a.status === 'ACTIVE' ? 'Suspend' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CustomerManagementComponent {
  private employeeService = inject(EmployeeService);
  private managerService = inject(ManagerService);
  private toastService = inject(ToastService);

  accounts = signal<Account[]>([]);
  query = '';

  ngOnInit() {
    this.search();
  }

  search() {
    this.employeeService.searchAccounts(this.query).subscribe({
      next: (res) => {
        if (res.success && res.data) this.accounts.set(res.data);
      }
    });
  }

  toggleAccountStatus(acc: Account) {
    const nextStatus = acc.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.managerService.updateAccountStatus(acc.id, nextStatus).subscribe({
      next: () => {
        this.toastService.success(`Account ${acc.accountNumber} status updated to ${nextStatus}`);
        this.search();
      }
    });
  }
}
