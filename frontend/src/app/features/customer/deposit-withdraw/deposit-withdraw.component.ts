import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, Transaction } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';

@Component({
  selector: 'app-deposit-withdraw',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe, PinModalComponent],
  template: `
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
          <i class="fa-solid fa-vault text-amber-400"></i> Self-Service Deposits & Cash Withdrawal
        </h1>
        <p class="text-xs text-slate-400">Instantly credit or withdraw funds directly from your linked accounts</p>
      </div>

      <!-- Mode Switch Tabs -->
      <div class="grid grid-cols-2 gap-3">
        <button (click)="mode = 'DEPOSIT'" 
                class="p-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2.5 transition-all"
                [ngClass]="mode === 'DEPOSIT' ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-950/50' : 'bg-slate-800/40 border-slate-700 text-slate-400'">
          <i class="fa-solid fa-circle-arrow-down text-lg"></i> Deposit Funds
        </button>
        <button (click)="mode = 'WITHDRAW'" 
                class="p-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2.5 transition-all"
                [ngClass]="mode === 'WITHDRAW' ? 'bg-rose-950/50 border-rose-500 text-rose-400 shadow-lg shadow-rose-950/50' : 'bg-slate-800/40 border-slate-700 text-slate-400'">
          <i class="fa-solid fa-circle-arrow-up text-lg"></i> ATM / Cash Withdrawal
        </button>
      </div>

      <!-- Transaction Card -->
      <div class="bank-glass p-6 md:p-8 rounded-3xl">
        <form (ngSubmit)="submitAction()" class="space-y-5">
          
          <div>
            <label class="bank-label">Select Account *</label>
            <select [(ngModel)]="selectedAccount" name="account" required class="bank-input">
              <option *ngFor="let acc of accounts()" [ngValue]="acc">
                {{ acc.accountNumber }} — {{ acc.accountTypeName }} (Balance: {{ acc.balance | inrCurrency }})
              </option>
            </select>
          </div>

          <div>
            <label class="bank-label">Amount (₹) *</label>
            <div class="relative">
              <span class="absolute left-4 top-3 text-lg font-bold text-slate-500">₹</span>
              <input [(ngModel)]="amount" name="amount" required type="number" min="100" step="100"
                     placeholder="0.00" class="bank-input pl-9 text-lg font-bold" 
                     [ngClass]="mode === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'" />
            </div>

            <!-- Quick Amounts -->
            <div class="flex flex-wrap gap-2 mt-2">
              <button type="button" *ngFor="let p of [500, 1000, 2000, 5000, 10000]" 
                      (click)="amount = p"
                      class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700">
                +₹{{ p }}
              </button>
            </div>
          </div>

          <div>
            <label class="bank-label">Description / Remarks</label>
            <input [(ngModel)]="description" name="description" type="text" 
                   [placeholder]="mode === 'DEPOSIT' ? 'e.g. Salary, Cash Deposit' : 'e.g. ATM Cash Withdrawal'" class="bank-input" />
          </div>

          <button type="submit" [disabled]="!selectedAccount || !amount || amount <= 0" 
                  class="w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg"
                  [ngClass]="mode === 'DEPOSIT' ? 'bank-btn-success' : 'bank-btn-danger'">
            <i class="fa-solid" [ngClass]="mode === 'DEPOSIT' ? 'fa-circle-arrow-down' : 'fa-lock'"></i>
            <span>{{ mode === 'DEPOSIT' ? 'Complete Deposit' : 'Authorize Withdrawal' }}</span>
          </button>
        </form>
      </div>

      <!-- PIN Modal for Withdrawal -->
      <app-pin-modal *ngIf="showPinModal()"
                     [title]="'Authorize Cash Withdrawal of ₹' + amount"
                     [subtitle]="'Withdraw from account ' + selectedAccount?.accountNumber"
                     (confirmed)="onPinConfirmed($event)"
                     (cancel)="showPinModal.set(false)">
      </app-pin-modal>

      <!-- Success Receipt -->
      <div *ngIf="lastTxn()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl text-center"
             [ngClass]="lastTxn()?.entryType === 'CREDIT' ? 'border-emerald-500/40' : 'border-rose-500/40'">
          <div class="w-16 h-16 rounded-full text-3xl flex items-center justify-center mx-auto mb-4"
               [ngClass]="lastTxn()?.entryType === 'CREDIT' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500' : 'bg-rose-500/15 text-rose-400 border border-rose-500'">
            <i class="fa-solid fa-check"></i>
          </div>
          <h3 class="text-xl font-bold text-white mb-1">
            {{ lastTxn()?.entryType === 'CREDIT' ? 'Deposit Successful!' : 'Cash Dispensed / Withdrawn!' }}
          </h3>
          <p class="text-xs text-slate-400 mb-6 font-mono">Ref ID: {{ lastTxn()?.transactionRef }}</p>

          <div class="p-4 rounded-2xl bg-slate-900 border border-white/5 text-left space-y-2 mb-6 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Amount:</span>
              <span class="font-bold text-sm" [ngClass]="lastTxn()?.entryType === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'">
                {{ lastTxn()?.amount | inrCurrency }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Updated Balance:</span>
              <span class="font-mono text-white font-bold">{{ lastTxn()?.balanceAfter | inrCurrency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Date & Time:</span>
              <span class="text-slate-300">{{ lastTxn()?.createdAt | date:'medium' }}</span>
            </div>
          </div>

          <button (click)="lastTxn.set(null)" class="bank-btn-primary w-full py-3">
            Done
          </button>
        </div>
      </div>

    </div>
  `
})
export class DepositWithdrawComponent {
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  accounts = signal<Account[]>([]);
  selectedAccount: Account | null = null;
  mode: 'DEPOSIT' | 'WITHDRAW' = 'DEPOSIT';
  amount: number | null = null;
  description = '';

  showPinModal = signal<boolean>(false);
  lastTxn = signal<Transaction | null>(null);

  ngOnInit() {
    this.loadAccounts();
  }

  loadAccounts() {
    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.accounts.set(res.data);
          if (res.data.length > 0) this.selectedAccount = res.data[0];
        }
      }
    });
  }

  submitAction() {
    if (!this.selectedAccount || !this.amount || this.amount <= 0) return;

    if (this.mode === 'DEPOSIT') {
      this.transactionService.deposit({
        accountNumber: this.selectedAccount.accountNumber,
        amount: this.amount,
        description: this.description || 'Self Deposit'
      }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.lastTxn.set(res.data);
            this.toastService.success('Deposit successful!');
            this.amount = null;
            this.description = '';
            this.loadAccounts();
          }
        }
      });
    } else {
      if (this.amount > this.selectedAccount.balance) {
        this.toastService.error('Withdrawal amount exceeds available balance!');
        return;
      }
      this.showPinModal.set(true);
    }
  }

  onPinConfirmed(pin: string) {
    this.showPinModal.set(false);
    if (!this.selectedAccount || !this.amount) return;

    this.transactionService.withdraw({
      accountNumber: this.selectedAccount.accountNumber,
      amount: this.amount,
      transactionPin: pin
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.lastTxn.set(res.data);
          this.toastService.success('Withdrawal completed!');
          this.amount = null;
          this.description = '';
          this.loadAccounts();
        }
      }
    });
  }
}
