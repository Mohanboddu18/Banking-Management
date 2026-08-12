import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, StatementSummary, Transaction } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-statements',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-file-invoice"></i> Financial Reporting & Passbook Statements
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Account Statements
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Review your debits, credits, and closing balances with instant PDF & CSV export capabilities.
        </p>
      </div>

      <!-- Action Sub-Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-sliders text-amber-500"></i> Statement Filters & Period
        </h2>

        <div class="flex items-center gap-2">
          <button (click)="downloadPdf()" [disabled]="loadingPdf()" class="bank-btn-primary text-xs py-1.5 px-3.5 font-bold cursor-pointer shadow-xs">
            <i *ngIf="loadingPdf()" class="fa-solid fa-circle-notch fa-spin mr-1"></i>
            <i *ngIf="!loadingPdf()" class="fa-solid fa-file-pdf mr-1"></i> Export PDF
          </button>
          <button (click)="downloadCsv()" [disabled]="loadingCsv()" class="bank-btn-secondary text-xs py-1.5 px-3.5 font-semibold cursor-pointer shadow-2xs">
            <i *ngIf="loadingCsv()" class="fa-solid fa-circle-notch fa-spin mr-1"></i>
            <i *ngIf="!loadingCsv()" class="fa-solid fa-file-csv mr-1"></i> Export CSV
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      <div class="bank-card p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          
          <div>
            <label class="bank-label">Select Account</label>
            <select [(ngModel)]="selectedAccountNo" (ngModelChange)="loadStatement()" class="bank-input text-xs font-semibold">
              <option *ngFor="let a of accounts()" [value]="a.accountNumber">{{ a.accountNumber }} ({{ a.accountTypeName }})</option>
            </select>
          </div>

          <div>
            <label class="bank-label">Statement Timeframe</label>
            <select [(ngModel)]="timeframe" (ngModelChange)="loadStatement()" class="bank-input text-xs font-semibold">
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
              <option value="3_MONTHS">Last 3 Months</option>
              <option value="6_MONTHS">Last 6 Months</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>

          <div *ngIf="timeframe === 'CUSTOM'">
            <label class="bank-label">Start Date</label>
            <input [(ngModel)]="startDate" (ngModelChange)="loadStatement()" type="date" class="bank-input text-xs" />
          </div>

          <div *ngIf="timeframe === 'CUSTOM'">
            <label class="bank-label">End Date</label>
            <input [(ngModel)]="endDate" (ngModelChange)="loadStatement()" type="date" class="bank-input text-xs" />
          </div>

        </div>
      </div>

      <!-- Statement Summary Stats Bar -->
      <div *ngIf="summary()" class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div class="bank-card p-4 space-y-1">
          <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Opening Balance</div>
          <div class="text-base font-extrabold text-slate-900 font-display">{{ summary()?.openingBalance | inrCurrency }}</div>
        </div>
        <div class="bank-card p-4 space-y-1">
          <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Debits</div>
          <div class="text-base font-extrabold text-rose-600 font-display">-{{ summary()?.totalDebits | inrCurrency }}</div>
        </div>
        <div class="bank-card p-4 space-y-1">
          <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Credits</div>
          <div class="text-base font-extrabold text-emerald-600 font-display">+{{ summary()?.totalCredits | inrCurrency }}</div>
        </div>
        <div class="bank-card p-4 space-y-1">
          <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Closing Balance</div>
          <div class="text-base font-extrabold text-slate-950 font-display">{{ summary()?.closingBalance | inrCurrency }}</div>
        </div>
      </div>

      <!-- Statement Table -->
      <div class="bank-card p-5 space-y-3">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-amber-500"></i> Ledger Records
          </h3>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ summary()?.transactions?.length || 0 }} entries</span>
        </div>

        <div *ngIf="!summary() || summary()?.transactions?.length === 0" class="py-8 text-center text-xs text-slate-500">
          No transactions for the selected period.
        </div>

        <div *ngIf="summary() && summary()!.transactions.length > 0" class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let txn of summary()!.transactions">
                <td class="text-xs text-slate-500 whitespace-nowrap">{{ txn.createdAt | date:'dd-MMM-yyyy HH:mm' }}</td>
                <td class="font-mono text-xs text-slate-700 font-semibold">{{ txn.transactionRef }}</td>
                <td class="text-xs font-bold text-slate-900">{{ txn.description }}</td>
                <td>
                  <span class="badge badge-info text-[9px]">{{ txn.transactionTypeName }}</span>
                </td>
                <td>
                  <span class="font-extrabold text-xs font-mono" [ngClass]="txn.entryType === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'">
                    {{ txn.entryType === 'CREDIT' ? '+' : '-' }}{{ txn.amount | inrCurrency }}
                  </span>
                </td>
                <td class="text-xs text-slate-600 font-mono font-bold">{{ txn.balanceAfter | inrCurrency }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class StatementsComponent {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);

  accounts = signal<Account[]>([]);
  summary = signal<StatementSummary | null>(null);

  selectedAccountNo = '';
  timeframe = '6_MONTHS';
  startDate = '';
  endDate = '';

  loadingPdf = signal<boolean>(false);
  loadingCsv = signal<boolean>(false);

  ngOnInit() {
    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.accounts.set(res.data);
          this.selectedAccountNo = res.data[0].accountNumber;
          this.loadStatement();
        }
      }
    });
  }

  loadStatement() {
    if (!this.selectedAccountNo) return;
    this.transactionService.getStatementData(this.selectedAccountNo, this.timeframe, this.startDate, this.endDate).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (res.data.transactions && res.data.transactions.length > 0) {
            res.data.transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          }
          this.summary.set(res.data);
        }
      }
    });
  }

  downloadPdf() {
    if (!this.selectedAccountNo) return;
    this.loadingPdf.set(true);
    this.transactionService.downloadStatementPdf(this.selectedAccountNo, this.timeframe, this.startDate, this.endDate).subscribe({
      next: (blob) => {
        this.loadingPdf.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bank_Statement_${this.selectedAccountNo}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('PDF Statement downloaded!');
      },
      error: () => this.loadingPdf.set(false)
    });
  }

  downloadCsv() {
    if (!this.selectedAccountNo) return;
    this.loadingCsv.set(true);
    this.transactionService.downloadStatementCsv(this.selectedAccountNo, this.timeframe, this.startDate, this.endDate).subscribe({
      next: (blob) => {
        this.loadingCsv.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bank_Statement_${this.selectedAccountNo}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('CSV Statement downloaded!');
      },
      error: () => this.loadingCsv.set(false)
    });
  }
}
