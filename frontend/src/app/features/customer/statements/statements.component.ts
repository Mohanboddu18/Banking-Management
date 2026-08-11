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
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-file-invoice text-amber-400"></i> Account Statements & Financial History
          </h1>
          <p class="text-xs text-slate-400">Filter, search, and export official SBI-formatted PDF and CSV statements</p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="downloadPdf()" [disabled]="loadingPdf()" class="bank-btn-primary text-xs">
            <i *ngIf="loadingPdf()" class="fa-solid fa-circle-notch fa-spin"></i>
            <i *ngIf="!loadingPdf()" class="fa-solid fa-file-pdf"></i> Download PDF
          </button>
          <button (click)="downloadCsv()" [disabled]="loadingCsv()" class="bank-btn-secondary text-xs">
            <i *ngIf="loadingCsv()" class="fa-solid fa-circle-notch fa-spin"></i>
            <i *ngIf="!loadingCsv()" class="fa-solid fa-file-csv"></i> Download CSV
          </button>
        </div>
      </div>

      <!-- Filters Panel -->
      <div class="bank-glass p-6 rounded-3xl space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          <div>
            <label class="bank-label">Select Account</label>
            <select [(ngModel)]="selectedAccountNo" (ngModelChange)="loadStatement()" class="bank-input">
              <option *ngFor="let a of accounts()" [value]="a.accountNumber">{{ a.accountNumber }} ({{ a.accountTypeName }})</option>
            </select>
          </div>

          <div>
            <label class="bank-label">Timeframe Period</label>
            <select [(ngModel)]="timeframe" (ngModelChange)="loadStatement()" class="bank-input">
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
              <option value="3_MONTHS">Last 3 Months</option>
              <option value="6_MONTHS">Last 6 Months</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>

          <div *ngIf="timeframe === 'CUSTOM'">
            <label class="bank-label">Start Date</label>
            <input [(ngModel)]="startDate" (ngModelChange)="loadStatement()" type="date" class="bank-input" />
          </div>

          <div *ngIf="timeframe === 'CUSTOM'">
            <label class="bank-label">End Date</label>
            <input [(ngModel)]="endDate" (ngModelChange)="loadStatement()" type="date" class="bank-input" />
          </div>

        </div>
      </div>

      <!-- Statement Summary Stats Bar -->
      <div *ngIf="summary()" class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bank-glass p-4 rounded-2xl">
          <div class="text-[11px] text-slate-400 uppercase font-semibold">Opening Balance</div>
          <div class="text-base font-bold text-white mt-1 font-mono">{{ summary()?.openingBalance | inrCurrency }}</div>
        </div>
        <div class="bank-glass p-4 rounded-2xl">
          <div class="text-[11px] text-slate-400 uppercase font-semibold">Total Debits</div>
          <div class="text-base font-bold text-rose-400 mt-1 font-mono">-{{ summary()?.totalDebits | inrCurrency }}</div>
        </div>
        <div class="bank-glass p-4 rounded-2xl">
          <div class="text-[11px] text-slate-400 uppercase font-semibold">Total Credits</div>
          <div class="text-base font-bold text-emerald-400 mt-1 font-mono">+{{ summary()?.totalCredits | inrCurrency }}</div>
        </div>
        <div class="bank-glass p-4 rounded-2xl">
          <div class="text-[11px] text-slate-400 uppercase font-semibold">Closing Balance</div>
          <div class="text-base font-bold text-sky-400 mt-1 font-mono">{{ summary()?.closingBalance | inrCurrency }}</div>
        </div>
      </div>

      <!-- Statement Table -->
      <div class="bank-glass p-6 rounded-3xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-bold text-white">
            Transactions ({{ summary()?.transactions?.length || 0 }})
          </h3>
        </div>

        <div *ngIf="!summary() || summary()?.transactions?.length === 0" class="py-12 text-center text-xs text-slate-400">
          No transaction entries found for the selected period.
        </div>

        <div *ngIf="summary() && summary()!.transactions.length > 0" class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Reference ID</th>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let txn of summary()!.transactions">
                <td class="text-xs text-slate-300">{{ txn.createdAt | date:'dd-MMM-yyyy HH:mm' }}</td>
                <td class="font-mono text-xs text-sky-400">{{ txn.transactionRef }}</td>
                <td class="text-xs font-medium text-white">{{ txn.description }}</td>
                <td>
                  <span class="badge badge-info text-[10px]">{{ txn.transactionTypeName }}</span>
                </td>
                <td>
                  <span class="font-bold text-xs font-mono" [ngClass]="txn.entryType === 'CREDIT' ? 'text-emerald-400' : 'text-slate-200'">
                    {{ txn.entryType === 'CREDIT' ? '+' : '-' }}{{ txn.amount | inrCurrency }}
                  </span>
                </td>
                <td class="text-xs text-slate-300 font-mono font-semibold">{{ txn.balanceAfter | inrCurrency }}</td>
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
