import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, Transaction } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-cashier-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
          <i class="fa-solid fa-cash-register text-emerald-400"></i> Cashier Counter Terminal
        </h1>
        <p class="text-xs text-slate-400">Process over-the-counter cash deposits and withdrawals for walk-in banking customers</p>
      </div>

      <!-- Account Search Bar -->
      <div class="bank-glass p-6 rounded-3xl space-y-4">
        <label class="bank-label">Customer Account Lookup (Account Number / Name / PAN / Mobile)</label>
        <div class="flex gap-3">
          <input [(ngModel)]="searchQuery" (keyup.enter)="searchAccounts()" type="text" 
                 placeholder="e.g. SBIN00010001 or Mohan or ABCDE1001F" class="bank-input" />
          <button (click)="searchAccounts()" class="bank-btn-primary px-6">
            <i class="fa-solid fa-magnifying-glass"></i> Search
          </button>
        </div>

        <!-- Search Results List -->
        <div *ngIf="searchResults().length > 0" class="pt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
            <div *ngFor="let acc of searchResults()" 
                 (click)="selectAccount(acc)"
                 class="p-3 rounded-2xl bg-slate-800/60 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500/50 cursor-pointer flex justify-between items-center transition-all"
                 [ngClass]="selectedAccount?.accountNumber === acc.accountNumber ? 'border-emerald-500 ring-2 ring-emerald-500/30' : ''">
              <div>
                <div class="text-xs font-bold text-white">{{ acc.customerName }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ acc.accountNumber }} • {{ acc.accountTypeName }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-bold text-emerald-400">{{ acc.balance | inrCurrency }}</div>
                <span class="badge badge-success text-[9px]">{{ acc.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Counter Transaction Form -->
      <div *ngIf="selectedAccount" class="bank-glass p-6 md:p-8 rounded-3xl space-y-6 animate-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-2">
          <div>
            <h3 class="text-lg font-bold text-white">{{ selectedAccount.customerName }}</h3>
            <p class="text-xs text-slate-400 font-mono">{{ selectedAccount.accountNumber }} • {{ selectedAccount.branchName }}</p>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-slate-400 uppercase font-semibold">Current Available Balance</div>
            <div class="text-xl font-extrabold text-emerald-400 font-mono">{{ selectedAccount.balance | inrCurrency }}</div>
          </div>
        </div>

        <!-- Mode Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <button type="button" (click)="opMode = 'DEPOSIT'" 
                  class="p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  [ngClass]="opMode === 'DEPOSIT' ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30' : 'bg-slate-800/40 border-slate-700 text-slate-400'">
            <i class="fa-solid fa-circle-arrow-down text-emerald-400"></i> Cash Deposit
          </button>
          <button type="button" (click)="opMode = 'WITHDRAW'" 
                  class="p-3.5 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  [ngClass]="opMode === 'WITHDRAW' ? 'bg-rose-600/25 border-rose-500 text-rose-300 ring-2 ring-rose-500/30' : 'bg-slate-800/40 border-slate-700 text-slate-400'">
            <i class="fa-solid fa-circle-arrow-up text-rose-400"></i> Cash Withdrawal
          </button>
        </div>

        <form (ngSubmit)="processCounterTxn()" class="space-y-4">
          <div>
            <label class="bank-label">Amount to {{ opMode === 'DEPOSIT' ? 'Deposit' : 'Withdraw' }} (₹) *</label>
            <input [(ngModel)]="amount" name="amt" required type="number" min="10" placeholder="0.00" class="bank-input text-xl font-bold text-white" />
          </div>

          <!-- Quick Cash Amount Chips -->
          <div class="flex flex-wrap gap-2">
            <button type="button" *ngFor="let p of [500, 1000, 2000, 5000, 10000, 20000]" 
                    (click)="amount = p"
                    class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700">
              ₹{{ p }}
            </button>
          </div>

          <div>
            <label class="bank-label">Teller Remarks</label>
            <input [(ngModel)]="remarks" name="rem" type="text" placeholder="Counter cash transaction (No PIN required)" class="bank-input" />
          </div>

          <button type="submit" [disabled]="!amount || amount <= 0" 
                  class="w-full py-4 rounded-xl font-bold text-base shadow-xl transition-all flex items-center justify-center gap-2 mt-2"
                  [ngClass]="opMode === 'DEPOSIT' ? 'bank-btn-success' : 'bank-btn-danger'">
            <i class="fa-solid" [ngClass]="opMode === 'DEPOSIT' ? 'fa-circle-check' : 'fa-hand-holding-dollar'"></i>
            Complete Counter {{ opMode === 'DEPOSIT' ? 'Deposit' : 'Withdrawal' }}
          </button>
        </form>
      </div>

    </div>
  `
})
export class CashierDeskComponent {
  private employeeService = inject(EmployeeService);
  private toastService = inject(ToastService);

  searchQuery = '';
  searchResults = signal<Account[]>([]);
  selectedAccount: Account | null = null;

  opMode: 'DEPOSIT' | 'WITHDRAW' = 'DEPOSIT';
  amount: number | null = null;
  remarks = '';

  ngOnInit() {
    this.searchAccounts();
  }

  searchAccounts() {
    this.employeeService.searchAccounts(this.searchQuery).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.searchResults.set(res.data);
          if (res.data.length > 0 && !this.selectedAccount) {
            this.selectedAccount = res.data[0];
          }
        }
      }
    });
  }

  selectAccount(acc: Account) {
    this.selectedAccount = acc;
  }

  processCounterTxn() {
    if (!this.selectedAccount || !this.amount) return;

    if (this.opMode === 'DEPOSIT') {
      this.employeeService.cashierDeposit({
        accountNumber: this.selectedAccount.accountNumber,
        amount: this.amount,
        description: this.remarks || 'Cashier Counter Cash Deposit'
      }).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success(`₹${this.amount} deposited into account ${this.selectedAccount?.accountNumber}`);
            this.amount = null;
            this.remarks = '';
            this.searchAccounts();
          }
        },
        error: (err) => {
          const msg = err.error?.message || 'Deposit failed';
          this.toastService.error(msg);
        }
      });
    } else {
      this.employeeService.cashierWithdraw({
        accountNumber: this.selectedAccount.accountNumber,
        amount: this.amount,
        description: this.remarks || 'Cashier Counter Cash Withdrawal'
      }).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success(`₹${this.amount} cash dispensed to customer from account ${this.selectedAccount?.accountNumber}`);
            this.amount = null;
            this.remarks = '';
            this.searchAccounts();
          }
        },
        error: (err) => {
          const msg = err.error?.message || 'Withdrawal failed';
          this.toastService.error(msg);
        }
      });
    }
  }
}
