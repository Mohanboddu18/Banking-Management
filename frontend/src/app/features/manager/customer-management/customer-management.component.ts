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
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-user-check"></i> Customer Directory & Governance Controls
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Customer Account Controls
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Search customer accounts, verify ledger balances, freeze accounts or lift suspensions with 1-click controls.
        </p>
      </div>

      <!-- Search Bar -->
      <div class="bank-card p-6 space-y-3">
        <label class="bank-label">Customer Search Query</label>
        <div class="flex gap-2">
          <input [(ngModel)]="query" (keyup.enter)="search()" type="text" placeholder="Search customer name, account number, PAN..." class="bank-input text-xs flex-1 font-semibold" />
          <button (click)="search()" class="bank-btn-primary px-5 text-xs font-bold shadow-xs">
            <i class="fa-solid fa-magnifying-glass mr-1"></i> Search Accounts
          </button>
        </div>
      </div>

      <!-- Accounts Table -->
      <div class="bank-card p-6 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-users text-amber-500"></i> Account Holders Directory
          </h3>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ accounts().length }} Accounts</span>
        </div>

        <div class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Available Balance</th>
                <th>Ledger Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of accounts()">
                <td class="font-mono text-xs font-bold text-slate-900">{{ a.accountNumber }}</td>
                <td>
                  <div class="font-bold text-slate-900 text-xs">{{ a.customerName }}</div>
                  <div class="text-[10px] text-slate-500 font-mono">{{ a.customerId }}</div>
                </td>
                <td>
                  <span class="badge badge-info text-[9px]">{{ a.accountTypeName }}</span>
                </td>
                <td class="text-xs font-extrabold text-emerald-600 font-mono">{{ a.balance | inrCurrency }}</td>
                <td class="text-xs font-mono font-bold text-slate-700">{{ a.ledgerBalance | inrCurrency }}</td>
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
                  <button (click)="toggleAccountStatus(a)" class="bank-btn-secondary text-xs py-1 px-3 font-semibold"
                          [ngClass]="a.status === 'ACTIVE' ? 'hover:text-rose-600 hover:border-rose-300' : 'hover:text-emerald-600 hover:border-emerald-300'">
                    <i class="fa-solid" [ngClass]="a.status === 'ACTIVE' ? 'fa-ban' : 'fa-check'"></i>
                    {{ a.status === 'ACTIVE' ? 'Freeze / Suspend' : 'Activate Account' }}
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
