import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { EmployeeService } from '../../../core/services/employee.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, Transaction } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-cashier-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-cash-register"></i> Teller Operations & Counter Cash Management
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Cashier Desk Terminal
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Lookup customer savings or current accounts and execute verified walk-in deposits and cash withdrawals.
        </p>
      </div>

      <!-- Account Search Bar -->
      <div class="bank-card p-6 space-y-3">
        <label class="bank-label">Customer Account Lookup (Account No / Name / Mobile)</label>
        <div class="flex gap-2">
          <input [(ngModel)]="searchQuery" (keyup.enter)="searchAccounts()" type="text" 
                 placeholder="e.g. SBIN00010001 or Mohan" class="bank-input text-xs flex-1 font-semibold" />
          <button (click)="searchAccounts()" class="bank-btn-primary px-5 text-xs font-bold">
            <i class="fa-solid fa-magnifying-glass mr-1"></i> Search Account
          </button>
        </div>

        <!-- Search Results List -->
        <div *ngIf="searchResults().length > 0" class="pt-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
            <div *ngFor="let acc of searchResults()" 
                 (click)="selectAccount(acc)"
                 class="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 cursor-pointer flex justify-between items-center transition-all shadow-2xs"
                 [ngClass]="selectedAccount?.accountNumber === acc.accountNumber ? 'border-amber-500 bg-amber-50' : ''">
              <div>
                <div class="text-xs font-bold text-slate-900">{{ acc.customerName }}</div>
                <div class="text-[10px] text-slate-500 font-mono">{{ acc.accountNumber }} • {{ acc.accountTypeName }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs font-extrabold text-emerald-600 font-mono">{{ acc.balance | inrCurrency }}</div>
                <span class="pill-green text-[9px] py-0 px-2">{{ acc.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Counter Transaction Form -->
      <div *ngIf="selectedAccount" class="bank-card p-6 space-y-4 animate-fade-in">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <span class="pill-dark text-[9px] py-0 px-2 mb-1 inline-block">SELECTED CUSTOMER</span>
            <h3 class="text-base font-bold text-slate-900 font-serif">{{ selectedAccount.customerName }}</h3>
            <p class="text-[11px] text-slate-500 font-mono">{{ selectedAccount.accountNumber }} • {{ selectedAccount.branchName }}</p>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Available Balance</div>
            <div class="text-xl font-extrabold text-slate-950 font-display">{{ selectedAccount.balance | inrCurrency }}</div>
          </div>
        </div>

        <!-- Mode Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <button type="button" (click)="setOpMode('DEPOSIT')" 
                  class="p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  [ngClass]="opMode === 'DEPOSIT' ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">
            <i class="fa-solid fa-circle-arrow-down"></i> Cash Deposit
          </button>
          <button type="button" (click)="setOpMode('WITHDRAW')" 
                  class="p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  [ngClass]="opMode === 'WITHDRAW' ? 'bg-rose-600 border-rose-600 text-white shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">
            <i class="fa-solid fa-circle-arrow-up"></i> Cash Withdrawal
          </button>
        </div>

        <form (ngSubmit)="processCounterTxn()" class="space-y-4 text-xs">
          <div>
            <label class="bank-label">Amount (₹) *</label>

            <!-- Teller Counter Limit Info Badge -->
            <div class="mb-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-950 flex items-center justify-between font-medium">
              <span class="flex items-center gap-1.5">
                <i class="fa-solid fa-shield-check text-amber-600"></i>
                <span>{{ opMode === 'DEPOSIT' ? 'Counter Deposit Max: ₹5,00,000 • 24H Account Limit: ₹10,00,000' : 'Counter Withdrawal Max: ₹2,00,000 • 24H Account Limit: ₹5,00,000' }}</span>
              </span>
              <span class="font-bold font-mono text-[10px] text-amber-900 uppercase">TELLER RESTRICTED</span>
            </div>

            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 pointer-events-none">₹</span>
              <input [(ngModel)]="amount" name="amt" required type="number" min="10" placeholder="0.00" 
                     class="bank-input bank-input-with-currency pl-10 text-lg font-extrabold font-display" 
                     [ngClass]="((opMode === 'DEPOSIT' && amount && amount > 500000) || (opMode === 'WITHDRAW' && amount && amount > 200000)) ? 'border-rose-500 bg-rose-50/30 focus:ring-rose-400' : (opMode === 'DEPOSIT' ? 'text-emerald-700' : 'text-rose-700')" />
            </div>

            <!-- Instant Teller Warning -->
            <div *ngIf="opMode === 'DEPOSIT' && amount && amount > 500000" class="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>Amount exceeds maximum per-transaction counter deposit restriction of ₹5,00,000 (5 Lakhs)!</span>
            </div>

            <div *ngIf="opMode === 'WITHDRAW' && amount && amount > 200000" class="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>Amount exceeds maximum per-transaction counter cash withdrawal restriction of ₹2,00,000 (2 Lakhs)!</span>
            </div>
          </div>

          <!-- Quick Cash Amount Chips -->
          <div class="flex flex-wrap gap-2">
            <button type="button" *ngFor="let p of [500, 1000, 2000, 5000, 10000, 20000]" 
                    (click)="amount = p"
                    class="px-3 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 text-xs font-bold text-slate-700 border border-slate-200 cursor-pointer shadow-2xs">
              ₹{{ p }}
            </button>
          </div>

          <div>
            <label class="bank-label">Teller Remarks</label>
            <input [(ngModel)]="remarks" name="rem" type="text" placeholder="Counter cash transaction notes" class="bank-input text-xs" />
          </div>

          <button type="submit" [disabled]="!canSubmit()" 
                  class="w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-xs"
                  [ngClass]="opMode === 'DEPOSIT' ? 'bank-btn-success' : 'bank-btn-danger'">
            <i class="fa-solid" [ngClass]="opMode === 'DEPOSIT' ? 'fa-check' : 'fa-hand-holding-dollar'"></i>
            Complete Counter {{ opMode === 'DEPOSIT' ? 'Deposit' : 'Withdrawal' }} →
          </button>
        </form>
      </div>

    </div>
  `
})
export class CashierDeskComponent {
  private employeeService = inject(EmployeeService);
  private toastService = inject(ToastService);
  private titleService = inject(Title);

  searchQuery = '';
  searchResults = signal<Account[]>([]);
  selectedAccount: Account | null = null;

  opMode: 'DEPOSIT' | 'WITHDRAW' = 'DEPOSIT';
  amount: number | null = null;
  remarks = '';

  ngOnInit() {
    this.updateTitle();
    this.searchAccounts();
  }

  setOpMode(mode: 'DEPOSIT' | 'WITHDRAW') {
    this.opMode = mode;
    this.updateTitle();
  }

  canSubmit(): boolean {
    if (!this.selectedAccount || !this.amount || this.amount <= 0) return false;
    if (this.opMode === 'DEPOSIT' && this.amount > 500000) return false;
    if (this.opMode === 'WITHDRAW' && this.amount > 200000) return false;
    if (this.opMode === 'WITHDRAW' && this.selectedAccount && this.amount > this.selectedAccount.balance) return false;
    return true;
  }

  updateTitle() {
    if (this.opMode === 'DEPOSIT') {
      this.titleService.setTitle('Cashier Deposit Desk — Godavari Bank');
    } else {
      this.titleService.setTitle('Cashier Withdrawal Desk — Godavari Bank');
    }
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
