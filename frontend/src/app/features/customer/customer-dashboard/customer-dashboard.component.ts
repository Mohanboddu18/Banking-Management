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
    <div class="space-y-6 animate-fade-in py-2 max-w-6xl mx-auto">
      
      <!-- Welcome Hero Section (Matching Reference Header) -->
      <div class="text-center space-y-2.5 py-4">
        <div class="banner-pill">
          <i class="fa-solid fa-building-columns"></i> Secure Retail Banking Portal
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Welcome to Godavari Bank Online
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Manage your savings accounts, instant fund transfers, ATM debit cards, and loan portfolio with 256-bit bank-grade encryption.
        </p>
      </div>

      <!-- Section Title with Amber Icon and Right Pill Button -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 class="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-vault text-amber-500"></i> Accounts & Financial Assets
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">Real-time account balances, credit lines & active debit cards</p>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/customer/transfer" class="bank-btn-primary py-1.5 px-4 text-xs font-bold shadow-xs">
            <i class="fa-solid fa-paper-plane"></i> Send Money
          </a>
          <button (click)="loadData()" class="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 shadow-2xs cursor-pointer flex items-center gap-1.5 transition-all">
            <i class="fa-solid fa-arrows-rotate text-amber-500"></i> Refresh
          </button>
        </div>
      </div>

      <!-- Financial Metric Cards (3 Columns - Matching Reference Table Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <!-- Account Card 1: Primary Account -->
        <div class="bank-card p-5 space-y-3.5">
          <div class="flex items-center justify-between">
            <span class="pill-dark">{{ primaryAccount()?.accountTypeName || 'SAVINGS' }} #{{ primaryAccount()?.id || '1' }}</span>
            <span class="pill-green"><i class="fa-solid fa-circle-check"></i> {{ primaryAccount()?.status || 'ACTIVE' }}</span>
          </div>

          <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <i class="fa-solid fa-id-card text-amber-500 text-sm"></i>
            <span>Account: <strong class="text-slate-900 font-mono">{{ primaryAccount()?.accountNumber || 'Loading...' }}</strong></span>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available Balance</div>
            <div class="text-2xl font-extrabold text-slate-950 font-display">
              {{ totalBalance() | inrCurrency }}
            </div>
            <div class="text-[10px] text-slate-400 font-mono">IFSC: {{ primaryAccount()?.ifscCode }}</div>
          </div>

          <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <a routerLink="/customer/deposit-withdraw" class="text-amber-600 font-bold hover:underline flex items-center gap-1">
              <i class="fa-solid fa-plus-circle"></i> Deposit / Cash
            </a>
            <a routerLink="/customer/statements" class="text-slate-600 font-semibold hover:text-slate-900">
              Passbook →
            </a>
          </div>
        </div>

        <!-- Account Card 2: Active Loans Portfolio -->
        <div class="bank-card p-5 space-y-3.5">
          <div class="flex items-center justify-between">
            <span class="pill-dark">LOAN PORTFOLIO</span>
            <span class="badge" [ngClass]="activeLoans().length > 0 ? 'badge-warning' : 'badge-info'">
              {{ activeLoans().length > 0 ? activeLoans().length + ' Active' : 'No Active Debt' }}
            </span>
          </div>

          <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <i class="fa-solid fa-hand-holding-dollar text-amber-500 text-sm"></i>
            <span>Credit Limit & Outstanding</span>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Outstanding Debt</div>
            <div class="text-2xl font-extrabold text-rose-600 font-display">
              {{ totalLoanOutstanding() | inrCurrency }}
            </div>
            <div class="text-[10px] text-slate-400">Competitive Rates from 8.5% p.a.</div>
          </div>

          <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <a routerLink="/customer/loans" class="text-amber-600 font-bold hover:underline">
              Apply New Loan →
            </a>
            <span class="text-slate-400 text-[10px]">Instant Sanctions</span>
          </div>
        </div>

        <!-- Account Card 3: Primary Debit Card -->
        <div class="bank-card p-5 space-y-3.5">
          <div class="flex items-center justify-between">
            <span class="pill-dark">DEBIT CARD</span>
            <span class="pill-green"><i class="fa-solid fa-circle-check"></i> {{ primaryCard()?.status || 'ACTIVE' }}</span>
          </div>

          <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <i class="fa-solid fa-credit-card text-amber-500 text-sm"></i>
            <span>RuPay Platinum Debit Card</span>
          </div>

          <div class="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center space-y-1 shadow-xs">
            <div class="text-[10px] text-slate-400 tracking-widest font-mono">GODAVARI PLATINUM</div>
            <div class="text-lg font-extrabold font-mono tracking-widest text-amber-400 py-0.5">
              {{ primaryCard()?.maskedCardNumber || '•••• •••• •••• 1001' }}
            </div>
            <div class="text-[10px] text-slate-300">EXP: {{ primaryCard()?.expiryMonth || '12' }}/{{ primaryCard()?.expiryYear || '30' }}</div>
          </div>

          <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <a routerLink="/customer/cards-cheques" class="text-amber-600 font-bold hover:underline">
              Card Controls & PIN →
            </a>
            <span class="text-emerald-600 font-bold text-[10px]">Contactless</span>
          </div>
        </div>

      </div>

      <!-- Main Section: Recent Activity & Quick Value-Added Services -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        
        <!-- Left: Recent Transactions Table (2 Cols) -->
        <div class="lg:col-span-2 bank-card p-5 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <i class="fa-solid fa-clock-rotate-left text-amber-500"></i> Recent Activity
            </h3>
            <a routerLink="/customer/statements" class="text-xs text-amber-600 hover:underline font-bold">
              View All Statements →
            </a>
          </div>

          <div *ngIf="recentTxns().length === 0" class="py-8 text-center text-slate-400 text-xs">
            No transactions found yet.
          </div>

          <div *ngIf="recentTxns().length > 0" class="overflow-x-auto">
            <table class="bank-table">
              <thead>
                <tr>
                  <th>Details</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let txn of recentTxns()">
                  <td>
                    <div class="font-bold text-slate-900 text-xs">{{ txn.description }}</div>
                    <div class="text-[10px] text-slate-500 font-mono">{{ txn.transactionRef }} • {{ txn.createdAt | date:'short' }}</div>
                  </td>
                  <td>
                    <span class="badge badge-info text-[9px]">{{ txn.transactionTypeName }}</span>
                  </td>
                  <td>
                    <span class="font-extrabold text-xs font-mono" [ngClass]="txn.entryType === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'">
                      {{ txn.entryType === 'CREDIT' ? '+' : '-' }}{{ txn.amount | inrCurrency }}
                    </span>
                  </td>
                  <td class="text-xs text-slate-500 font-mono">
                    {{ txn.balanceAfter | inrCurrency }}
                  </td>
                  <td>
                    <span class="badge badge-success text-[9px]">
                      {{ txn.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Value Added Shortcuts & Fast Hub -->
        <div class="bank-card p-5 space-y-3">
          <div class="pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
              <i class="fa-solid fa-layer-group text-amber-500"></i> Digital Services
            </h3>
          </div>

          <!-- QR Pay Widget -->
          <a routerLink="/customer/vas/qr" 
             class="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center text-sm font-bold shadow-2xs">
                <i class="fa-solid fa-qrcode"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Scan & Pay QR</div>
                <div class="text-[10px] text-slate-500">BharatQR & UPI Merchants</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-400 text-xs group-hover:text-amber-600"></i>
          </a>

          <!-- Mobile Telecom Recharge -->
          <a routerLink="/customer/vas/recharge" 
             class="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 flex items-center justify-center text-sm font-bold shadow-2xs">
                <i class="fa-solid fa-mobile-screen-button"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Mobile Recharge</div>
                <div class="text-[10px] text-slate-500">Jio, Airtel, Vi, BSNL Plans</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-400 text-xs group-hover:text-amber-600"></i>
          </a>

          <!-- Movie Tickets Booking -->
          <a routerLink="/customer/vas/movies" 
             class="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 flex items-center justify-center text-sm font-bold shadow-2xs">
                <i class="fa-solid fa-film"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Movie Tickets</div>
                <div class="text-[10px] text-slate-500">Cinema Seats & Fast Booking</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-400 text-xs group-hover:text-amber-600"></i>
          </a>

          <!-- Cheque & Cards Hub -->
          <a routerLink="/customer/cards-cheques" 
             class="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-2xs">
                <i class="fa-solid fa-money-check"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Cheque Book Request</div>
                <div class="text-[10px] text-slate-500">25/50 Leaf Delivery to Doorstep</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-slate-400 text-xs group-hover:text-amber-600"></i>
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
