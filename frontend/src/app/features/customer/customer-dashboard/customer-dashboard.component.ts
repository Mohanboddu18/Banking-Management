import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { CardService } from '../../../core/services/card.service';
import { LoanService } from '../../../core/services/loan.service';
import { AuthService } from '../../../core/services/auth.service';
import { Account, DebitCard, Loan, Transaction } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { MaskCardPipe } from '../../../shared/pipes/mask-card.pipe';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, InrCurrencyPipe, MaskCardPipe],
  template: `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Welcome Header Banner -->
      <div class="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#002b49] via-[#083358] to-[#0f172a] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="relative z-10">
          <div class="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <i class="fa-solid fa-circle-check"></i> Verified Retail Customer
          </div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white mb-2">
            Welcome back, {{ authService.currentUser()?.fullName }}!
          </h1>
          <p class="text-xs md:text-sm text-slate-300">
            Account Number: <span class="font-mono text-sky-300 font-semibold">{{ primaryAccount()?.accountNumber || 'Loading...' }}</span> • IFSC: <span class="font-mono text-slate-300 font-semibold">{{ primaryAccount()?.ifscCode }}</span>
          </p>
        </div>

        <!-- Quick Quick Action CTAs -->
        <div class="flex flex-wrap gap-2.5 relative z-10">
          <a routerLink="/customer/transfer" class="bank-btn-primary py-2.5 px-4 text-xs font-bold">
            <i class="fa-solid fa-paper-plane"></i> Send Money
          </a>
          <a routerLink="/customer/vas/qr" class="bank-btn-secondary py-2.5 px-4 text-xs font-bold bg-white/10 hover:bg-white/15">
            <i class="fa-solid fa-qrcode"></i> Scan QR
          </a>
          <a routerLink="/customer/statements" class="bank-btn-secondary py-2.5 px-4 text-xs font-bold">
            <i class="fa-solid fa-file-arrow-down"></i> Statement
          </a>
        </div>
      </div>

      <!-- Financial Metric Cards (3 Columns) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <!-- Total Available Balance Card -->
        <div class="bank-glass p-6 rounded-2xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Available Balance</div>
              <div class="text-2xl md:text-3xl font-extrabold text-white mt-1">
                {{ totalBalance() | inrCurrency }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xl">
              <i class="fa-solid fa-wallet"></i>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
            <span>{{ accounts().length }} Linked Account(s)</span>
            <span class="text-emerald-400 font-semibold flex items-center gap-1">
              <i class="fa-solid fa-shield"></i> RBI Insured
            </span>
          </div>
        </div>

        <!-- Active Loans Outstanding -->
        <div class="bank-glass p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Loan Balance</div>
              <div class="text-2xl md:text-3xl font-extrabold text-rose-400 mt-1">
                {{ totalLoanOutstanding() | inrCurrency }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xl">
              <i class="fa-solid fa-hand-holding-dollar"></i>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
            <span>{{ activeLoans().length }} Active Facility</span>
            <a routerLink="/customer/loans" class="text-sky-400 hover:underline">View Repayments →</a>
          </div>
        </div>

        <!-- Primary Card Preview -->
        <div class="bank-glass p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div class="flex justify-between items-start mb-4">
            <div>
              <div class="text-xs font-medium text-slate-400 uppercase tracking-wider">Primary Debit Card</div>
              <div class="text-lg font-bold text-slate-200 mt-1 font-mono tracking-wider">
                {{ primaryCard()?.maskedCardNumber || '•••• •••• •••• 1001' }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
              <i class="fa-brands fa-cc-visa"></i>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/5">
            <span class="badge" [ngClass]="primaryCard()?.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'">
              {{ primaryCard()?.status || 'ACTIVE' }}
            </span>
            <a routerLink="/customer/cards-cheques" class="text-sky-400 hover:underline">Card Controls →</a>
          </div>
        </div>

      </div>

      <!-- Main Section: Recent Activity & Quick Value-Added Services -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Recent Transactions Table (2 Cols) -->
        <div class="lg:col-span-2 bank-glass p-6 rounded-3xl">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-clock-rotate-left text-sky-400"></i>
              <h3 class="text-base font-bold text-white">Recent Transactions</h3>
            </div>
            <a routerLink="/customer/statements" class="text-xs text-sky-400 hover:underline font-semibold">
              View All History →
            </a>
          </div>

          <div *ngIf="recentTxns().length === 0" class="py-12 text-center text-slate-400 text-xs">
            No transactions found yet. Try transferring or depositing funds!
          </div>

          <div *ngIf="recentTxns().length > 0" class="overflow-x-auto">
            <table class="bank-table">
              <thead>
                <tr>
                  <th>Details / Reference</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let txn of recentTxns()">
                  <td>
                    <div class="font-semibold text-white text-xs">{{ txn.description }}</div>
                    <div class="text-[10px] text-slate-500 font-mono">{{ txn.transactionRef }} • {{ txn.createdAt | date:'short' }}</div>
                  </td>
                  <td>
                    <span class="badge badge-info text-[10px]">{{ txn.transactionTypeName }}</span>
                  </td>
                  <td>
                    <span class="font-bold text-xs" [ngClass]="txn.entryType === 'CREDIT' ? 'text-emerald-400' : 'text-slate-200'">
                      {{ txn.entryType === 'CREDIT' ? '+' : '-' }}{{ txn.amount | inrCurrency }}
                    </span>
                  </td>
                  <td class="text-xs text-slate-400 font-mono">
                    {{ txn.balanceAfter | inrCurrency }}
                  </td>
                  <td>
                    <span class="badge badge-success text-[10px]">
                      <i class="fa-solid fa-check"></i> {{ txn.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Value Added Shortcuts & Fast Hub -->
        <div class="bank-glass p-6 rounded-3xl flex flex-col gap-4">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-grid-2 text-sky-400"></i> Digital Services Hub
          </h3>

          <!-- QR Pay Widget -->
          <a routerLink="/customer/vas/qr" 
             class="p-4 rounded-2xl bg-gradient-to-br from-sky-950/60 to-slate-900 border border-sky-500/20 hover:border-sky-500/50 flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-qrcode"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-white">Merchant QR Pay</div>
                <div class="text-[11px] text-slate-400">Instant UPI & QR Settlements</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-500 text-xs group-hover:text-sky-400"></i>
          </a>

          <!-- Mobile Telecom Recharge -->
          <a routerLink="/customer/vas/recharge" 
             class="p-4 rounded-2xl bg-gradient-to-br from-teal-950/60 to-slate-900 border border-teal-500/20 hover:border-teal-500/50 flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-mobile-screen-button"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-white">Mobile Recharge</div>
                <div class="text-[11px] text-slate-400">Jio, Airtel, Vi, BSNL</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-500 text-xs group-hover:text-teal-400"></i>
          </a>

          <!-- Movie Tickets Booking -->
          <a routerLink="/customer/vas/movies" 
             class="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-950/60 to-slate-900 border border-fuchsia-500/20 hover:border-fuchsia-500/50 flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-film"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-white">Movie Tickets</div>
                <div class="text-[11px] text-slate-400">Interactive Seat Layout Booking</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-500 text-xs group-hover:text-fuchsia-400"></i>
          </a>

          <!-- Need Help / Raise Ticket -->
          <a routerLink="/customer/complaints" 
             class="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/20 hover:border-amber-500/50 flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                <i class="fa-solid fa-headset"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-white">Grievance Desk</div>
                <div class="text-[11px] text-slate-400">Raise or Track Support Tickets</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-500 text-xs group-hover:text-amber-400"></i>
          </a>
        </div>

      </div>

    </div>
  `
})
export class CustomerDashboardComponent {
  authService = inject(AuthService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private cardService = inject(CardService);
  private loanService = inject(LoanService);

  accounts = signal<Account[]>([]);
  primaryAccount = signal<Account | null>(null);
  recentTxns = signal<Transaction[]>([]);
  primaryCard = signal<DebitCard | null>(null);
  activeLoans = signal<Loan[]>([]);

  totalBalance = signal<number>(0);
  totalLoanOutstanding = signal<number>(0);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.accounts.set(res.data);
          if (res.data.length > 0) {
            this.primaryAccount.set(res.data[0]);
            this.totalBalance.set(res.data.reduce((sum, a) => sum + a.balance, 0));
            this.loadRecentTransactions(res.data[0].accountNumber);
          }
        }
      }
    });

    this.cardService.getDebitCards().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.primaryCard.set(res.data[0]);
        }
      }
    });

    this.loanService.getMyLoans().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.activeLoans.set(res.data.filter(l => l.status === 'ACTIVE'));
          const out = res.data.filter(l => l.status === 'ACTIVE').reduce((sum, l) => sum + (l.remainingPrincipal || 0), 0);
          this.totalLoanOutstanding.set(out);
        }
      }
    });
  }

  loadRecentTransactions(accNum: string) {
    this.transactionService.getRecentTransactions(accNum).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.recentTxns.set(res.data);
        }
      }
    });
  }
}
