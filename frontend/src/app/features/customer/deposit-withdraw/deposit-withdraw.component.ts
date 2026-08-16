import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { CardService } from '../../../core/services/card.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, DebitCard, Transaction } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';

@Component({
  selector: 'app-deposit-withdraw',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe, PinModalComponent],
  template: `
    <div [ngClass]="(depositChannel === 'ATM_CARD' || mode === 'WITHDRAW') ? 'max-w-4xl mx-auto' : 'max-w-xl mx-auto'" class="space-y-6 animate-fade-in py-4">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-vault"></i> Cash Desk & ATM Transactions
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Deposit & Withdrawal
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Add funds using your ATM debit card or withdraw cash securely with 4-digit PIN verification.
        </p>
      </div>

      <!-- Clean Mode Toggle Tabs -->
      <div class="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
        <button type="button" (click)="switchMode('DEPOSIT')"
                class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                [ngClass]="mode === 'DEPOSIT' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
          <i class="fa-solid fa-arrow-down text-amber-500"></i> Deposit Cash
        </button>
        <button type="button" (click)="switchMode('WITHDRAW')"
                class="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                [ngClass]="mode === 'WITHDRAW' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
          <i class="fa-solid fa-arrow-up text-amber-500"></i> Withdraw Cash
        </button>
      </div>

      <!-- Main Layout Grid -->
      <div [ngClass]="(depositChannel === 'ATM_CARD' || mode === 'WITHDRAW') ? 'grid grid-cols-1 md:grid-cols-12 gap-6 items-start' : ''">

        <!-- Left / Main Form Card -->
        <div class="bank-card p-6 md:p-8 space-y-5" [ngClass]="(depositChannel === 'ATM_CARD' || mode === 'WITHDRAW') ? 'md:col-span-7' : ''">
          
          <!-- Deposit Channel Selector (Only in Deposit Mode) -->
          <div *ngIf="mode === 'DEPOSIT'" class="space-y-2">
            <label class="bank-label">Deposit Channel</label>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
                     [ngClass]="depositChannel === 'ATM_CARD' ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-2xs' : 'border-slate-200 bg-slate-50 text-slate-600'">
                <input type="radio" [(ngModel)]="depositChannel" name="depChan" value="ATM_CARD" class="text-amber-500 focus:ring-amber-400" />
                <span><i class="fa-solid fa-credit-card mr-1 text-amber-600"></i> ATM Debit Card</span>
              </label>
              <label class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all"
                     [ngClass]="depositChannel === 'DIRECT' ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-2xs' : 'border-slate-200 bg-slate-50 text-slate-600'">
                <input type="radio" [(ngModel)]="depositChannel" name="depChan" value="DIRECT" class="text-amber-500 focus:ring-amber-400" />
                <span><i class="fa-solid fa-bolt mr-1 text-amber-600"></i> Direct Cash Deposit</span>
              </label>
            </div>
          </div>

          <form (ngSubmit)="submitAction()" class="space-y-4">
            
            <!-- Select Account -->
            <div>
              <label class="bank-label">Select Account *</label>
              <select [(ngModel)]="selectedAccount" (ngModelChange)="onAccountChange($event)" name="account" required class="bank-input text-xs font-semibold">
                <option *ngFor="let acc of accounts()" [ngValue]="acc">
                  {{ acc.accountNumber }} (Available: {{ acc.balance | inrCurrency }})
                </option>
              </select>
            </div>

            <!-- ATM Card Details (When ATM_CARD or WITHDRAW) -->
            <div *ngIf="depositChannel === 'ATM_CARD' || mode === 'WITHDRAW'" class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-800 font-bold flex items-center gap-1.5">
                  <i class="fa-solid fa-credit-card text-amber-500"></i> ATM Debit Card Details
                </span>
                <span *ngIf="selectedCard" class="pill-green text-[9px] py-0 px-2">
                  <i class="fa-solid fa-circle-check"></i> Active Card
                </span>
              </div>

              <!-- Card Picker if available -->
              <div *ngIf="debitCards().length > 0">
                <select [(ngModel)]="selectedCard" name="card" (ngModelChange)="onCardSelect($event)" class="bank-input text-xs font-mono font-bold">
                  <option *ngFor="let c of debitCards()" [ngValue]="c">
                    {{ c.maskedCardNumber }} (Exp: {{ c.expiryMonth }}/{{ c.expiryYear }})
                  </option>
                </select>
              </div>

              <!-- Manual Expiry & CVV for Deposit -->
              <div *ngIf="mode === 'DEPOSIT'" class="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label class="text-[10px] text-slate-500 block mb-0.5 font-semibold">Exp Month</label>
                  <input [(ngModel)]="cardForm.expiryMonth" name="expM" type="number" min="1" max="12" placeholder="12" class="bank-input text-center text-xs" />
                </div>
                <div>
                  <label class="text-[10px] text-slate-500 block mb-0.5 font-semibold">Exp Year</label>
                  <input [(ngModel)]="cardForm.expiryYear" name="expY" type="number" min="2024" max="2040" placeholder="2029" class="bank-input text-center text-xs" />
                </div>
                <div>
                  <label class="text-[10px] text-slate-500 block mb-0.5 font-semibold">CVV</label>
                  <input [(ngModel)]="cardForm.cvv" name="cvv" maxlength="3" type="password" placeholder="•••" class="bank-input text-center text-xs" />
                </div>
              </div>

              <div class="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                <i class="fa-solid fa-shield-halved text-amber-500 text-[10px]"></i>
                <span>Authorized with your 4-digit ATM PIN</span>
              </div>
            </div>

            <!-- Amount -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="bank-label mb-0">Amount (₹) *</label>
                <span *ngIf="mode === 'WITHDRAW' && selectedAccount" class="text-xs text-slate-500">
                  Available: <strong class="text-slate-900 font-mono">{{ selectedAccount.balance | inrCurrency }}</strong>
                </span>
              </div>

              <!-- Transaction Limit Badge Info -->
              <div class="mb-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-950 flex items-center justify-between font-medium">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-shield-check text-amber-600"></i>
                  <span *ngIf="mode === 'DEPOSIT' && depositChannel === 'ATM_CARD'">ATM Card Deposit Max: ₹2,00,000 • 24H Total Limit: ₹2,00,000</span>
                  <span *ngIf="mode === 'DEPOSIT' && depositChannel === 'DIRECT'">Direct Cash Deposit Max: ₹5,00,000 • 24H Total Limit: ₹10,00,000</span>
                  <span *ngIf="mode === 'WITHDRAW'">ATM Withdrawal Max: ₹50,000 • 24H Total Limit: ₹1,00,000</span>
                </span>
                <span class="font-bold font-mono text-[10px] text-amber-900 uppercase">24H RESTRICTED</span>
              </div>

              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 pointer-events-none">₹</span>
                <input [(ngModel)]="amount" name="amount" required type="number" min="10" step="10"
                       placeholder="0.00" class="bank-input bank-input-with-currency pl-10 text-lg font-extrabold text-slate-900 font-display"
                       [ngClass]="((mode === 'DEPOSIT' && depositChannel === 'ATM_CARD' && amount && amount > 200000) || (mode === 'DEPOSIT' && depositChannel === 'DIRECT' && amount && amount > 500000) || (mode === 'WITHDRAW' && amount && amount > 50000)) ? 'border-rose-500 bg-rose-50/30 focus:ring-rose-400' : ''" />
              </div>

              <!-- Instant Validation Warning Message -->
              <div *ngIf="mode === 'DEPOSIT' && depositChannel === 'ATM_CARD' && amount && amount > 200000" class="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>ATM Debit Card deposit is strictly limited to ₹2,00,000 (2 Lakhs) within 24 Hours!</span>
              </div>

              <div *ngIf="mode === 'DEPOSIT' && depositChannel === 'DIRECT' && amount && amount > 500000" class="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>Direct cash deposit cannot exceed ₹5,00,000 (5 Lakhs) per transaction!</span>
              </div>

              <div *ngIf="mode === 'WITHDRAW' && amount && amount > 50000" class="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>Amount exceeds maximum per-transaction ATM withdrawal limit of ₹50,000!</span>
              </div>

              <!-- Quick Amount Chips -->
              <div class="flex flex-wrap gap-2 mt-2">
                <button type="button" *ngFor="let p of [500, 1000, 2000, 5000, 10000]" 
                        (click)="amount = p"
                        class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:border-amber-400 text-xs font-semibold text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs">
                  +₹{{ p }}
                </button>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="bank-label">Remarks (Optional)</label>
              <input [(ngModel)]="description" name="description" type="text" 
                     [placeholder]="mode === 'DEPOSIT' ? 'e.g. Cash Deposit' : 'e.g. ATM Cash Withdrawal'" class="bank-input text-xs" />
            </div>

            <!-- Submit Button -->
            <button type="submit" [disabled]="!canSubmit()" 
                    class="bank-btn-primary w-full py-2.5 rounded-xl text-xs font-bold mt-2 transition-all cursor-pointer">
              <i class="fa-solid" [ngClass]="mode === 'DEPOSIT' ? 'fa-arrow-down' : 'fa-arrow-up'"></i>
              <span>{{ mode === 'DEPOSIT' ? 'Proceed with Cash Deposit' : 'Authorize ATM Cash Withdrawal' }}</span>
            </button>
          </form>
        </div>

        <!-- Right / ATM Card Visual Preview Container (Besides Form Container) -->
        <div *ngIf="depositChannel === 'ATM_CARD' || mode === 'WITHDRAW'" class="md:col-span-5 space-y-4 animate-fade-in">
          
          <!-- ATM Card Visual Element -->
          <div class="relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-all hover:scale-[1.01] border border-slate-800 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 min-h-[215px] flex flex-col justify-between">
            
            <!-- Top Gloss Overlay -->
            <div class="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none"></div>

            <!-- Header: Bank Title & Contactless Symbol -->
            <div class="flex items-center justify-between z-10">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-xs">
                  <i class="fa-solid fa-building-columns"></i>
                </div>
                <div>
                  <div class="text-xs font-black tracking-wider uppercase font-display text-white">GODAVARI BANK</div>
                  <div class="text-[8px] tracking-widest text-amber-400 font-bold uppercase">PREMIUM DEBIT</div>
                </div>
              </div>

              <div class="flex items-center gap-2 text-amber-400">
                <i class="fa-solid fa-wifi text-sm transform rotate-90"></i>
              </div>
            </div>

            <!-- Chip & Card Number -->
            <div class="my-4 space-y-3 z-10">
              <div class="flex items-center justify-between">
                <!-- Metallic EMV Chip -->
                <div class="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/60 flex items-center justify-center p-1 shadow-inner">
                  <div class="w-full h-full border border-amber-700/40 rounded-xs grid grid-cols-2 gap-0.5"></div>
                </div>
                <span class="text-[10px] font-mono text-slate-400 tracking-wider">ATM CARD</span>
              </div>

              <!-- Embossed Card Number -->
              <div class="font-mono text-base sm:text-lg font-extrabold tracking-widest text-amber-100 drop-shadow-xs">
                {{ selectedCard?.maskedCardNumber || (cardForm.cardNumber ? cardForm.cardNumber : '4532 •••• •••• 1001') }}
              </div>
            </div>

            <!-- Footer: Cardholder & Expiry & RuPay Logo -->
            <div class="flex items-end justify-between z-10 text-xs">
              <div>
                <div class="text-[8px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">CARDHOLDER NAME</div>
                <div class="font-bold text-white tracking-wide uppercase font-mono text-xs">
                  {{ selectedAccount?.customerName || 'MOHAN KRISHNA' }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-[8px] text-slate-400 uppercase font-bold tracking-wider mb-0.5">EXPIRES</div>
                <div class="font-mono text-xs font-bold text-amber-300">
                  {{ getFormattedExpiry() }}
                </div>
              </div>

              <!-- RuPay Badge -->
              <div class="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 text-[10px] font-black text-amber-400 tracking-wider font-mono">
                RuPay <span class="text-white text-[8px] font-bold">PLATINUM</span>
              </div>
            </div>

          </div>

          <!-- Security Note Card -->
          <div class="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1 text-xs shadow-2xs">
            <div class="font-bold flex items-center gap-1.5 text-amber-900">
              <i class="fa-solid fa-shield-halved text-amber-600"></i> Verified ATM Deposit & Cash Desk
            </div>
            <p class="text-[11px] text-amber-900/80 leading-relaxed">
              Adding money via your ATM Debit Card processes directly through Godavari Bank's interbank switch with 4-digit PIN authentication.
            </p>
          </div>

        </div>

      </div>

      <!-- PIN Modal -->
      <app-pin-modal *ngIf="showPinModal()"
                     [title]="pinModalTitle"
                     [subtitle]="pinModalSubtitle"
                     (confirmed)="onPinConfirmed($event)"
                     (cancel)="showPinModal.set(false)">
      </app-pin-modal>

      <!-- Minimal Receipt Modal -->
      <div *ngIf="lastTxn()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 md:p-8 rounded-2xl max-w-sm w-full shadow-2xl text-center space-y-4">
          
          <div class="w-12 h-12 rounded-full text-2xl flex items-center justify-center mx-auto"
               [ngClass]="lastTxn()?.entryType === 'CREDIT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'">
            <i class="fa-solid fa-check"></i>
          </div>

          <div>
            <h3 class="text-lg font-bold text-slate-900 font-serif">
              {{ lastTxn()?.entryType === 'CREDIT' ? 'Deposit Successful' : 'Withdrawal Successful' }}
            </h3>
            <p class="text-xs text-slate-500 font-mono mt-0.5">{{ lastTxn()?.transactionRef }}</p>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Amount:</span>
              <span class="font-extrabold text-slate-900 font-mono">{{ lastTxn()?.amount | inrCurrency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">New Balance:</span>
              <span class="font-mono text-emerald-600 font-extrabold">{{ lastTxn()?.balanceAfter | inrCurrency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Channel / Remarks:</span>
              <span class="text-slate-700 font-medium">{{ lastTxn()?.description }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Timestamp:</span>
              <span class="text-slate-500">{{ lastTxn()?.createdAt | date:'medium' }}</span>
            </div>
          </div>

          <button (click)="lastTxn.set(null)" class="bank-btn-primary w-full py-2.5 text-xs font-bold rounded-xl">
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
  private cardService = inject(CardService);
  private toastService = inject(ToastService);
  private titleService = inject(Title);

  accounts = signal<Account[]>([]);
  debitCards = signal<DebitCard[]>([]);
  selectedAccount: Account | null = null;
  selectedCard: DebitCard | null = null;

  mode: 'DEPOSIT' | 'WITHDRAW' = 'DEPOSIT';
  depositChannel: 'ATM_CARD' | 'DIRECT' = 'ATM_CARD';

  amount: number | null = null;
  description = '';

  cardForm = {
    cardNumber: '',
    expiryMonth: 12,
    expiryYear: 2029,
    cvv: '123'
  };

  showPinModal = signal<boolean>(false);
  pinModalTitle = 'Enter 4-Digit ATM PIN';
  pinModalSubtitle = '';
  lastTxn = signal<Transaction | null>(null);

  ngOnInit() {
    this.updateTitle();
    this.loadData();
  }

  updateTitle() {
    if (this.mode === 'DEPOSIT') {
      this.titleService.setTitle('Deposit Cash — Godavari Bank');
    } else {
      this.titleService.setTitle('Withdraw Cash — Godavari Bank');
    }
  }

  loadData() {
    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.accounts.set(res.data);
          if (res.data.length > 0 && !this.selectedAccount) {
            this.selectedAccount = res.data[0];
          }
        }
      }
    });

    this.cardService.getDebitCards().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.debitCards.set(res.data);
          if (res.data.length > 0 && !this.selectedCard) {
            this.selectedCard = res.data[0];
            this.onCardSelect(res.data[0]);
          }
        }
      }
    });
  }

  switchMode(newMode: 'DEPOSIT' | 'WITHDRAW') {
    this.mode = newMode;
    this.amount = null;
    this.description = '';
    this.updateTitle();
  }

  onAccountChange(acc: Account) {
    this.selectedAccount = acc;
    if (this.debitCards().length > 0) {
      const match = this.debitCards().find(c => c.accountNumber === acc?.accountNumber);
      if (match) {
        this.selectedCard = match;
        this.onCardSelect(match);
      }
    }
  }

  onCardSelect(card: DebitCard) {
    this.selectedCard = card;
    if (card) {
      this.cardForm.cardNumber = card.maskedCardNumber || '';
      this.cardForm.expiryMonth = card.expiryMonth || 12;
      this.cardForm.expiryYear = card.expiryYear || 2029;
    }
  }

  canSubmit(): boolean {
    if (!this.selectedAccount || !this.amount || this.amount <= 0) return false;
    if (this.mode === 'DEPOSIT' && this.depositChannel === 'ATM_CARD' && this.amount > 200000) return false;
    if (this.mode === 'DEPOSIT' && this.depositChannel === 'DIRECT' && this.amount > 500000) return false;
    if (this.mode === 'WITHDRAW' && this.amount > 50000) return false;
    if (this.mode === 'WITHDRAW' && this.selectedAccount && this.amount > this.selectedAccount.balance) return false;
    return true;
  }

  getFormattedExpiry(): string {
    const m = (this.cardForm.expiryMonth || 12).toString().padStart(2, '0');
    const y = (this.cardForm.expiryYear || 2029).toString().slice(-2);
    return `${m} / ${y}`;
  }

  submitAction() {
    if (!this.selectedAccount || !this.amount || this.amount <= 0) return;

    if (this.mode === 'WITHDRAW') {
      if (this.amount > this.selectedAccount.balance) {
        this.toastService.error('Withdrawal amount exceeds available balance!');
        return;
      }
      this.pinModalTitle = `Authorize Withdrawal of ₹${this.amount}`;
      this.pinModalSubtitle = `Enter 4-Digit ATM PIN to dispense cash`;
      this.showPinModal.set(true);
    } else {
      if (this.depositChannel === 'ATM_CARD') {
        this.pinModalTitle = `Authorize ATM Deposit of ₹${this.amount}`;
        this.pinModalSubtitle = `Enter 4-Digit ATM PIN to complete deposit`;
        this.showPinModal.set(true);
      } else {
        this.transactionService.deposit({
          accountNumber: this.selectedAccount.accountNumber,
          amount: this.amount,
          depositMethod: 'DIRECT',
          description: this.description || 'Direct Deposit'
        }).subscribe({
          next: (res) => {
            if (res.success && res.data) {
              this.lastTxn.set(res.data);
              this.toastService.success('Deposit successful!');
              this.amount = null;
              this.description = '';
              this.loadData();
            }
          }
        });
      }
    }
  }

  onPinConfirmed(pin: string) {
    this.showPinModal.set(false);
    if (!this.selectedAccount || !this.amount) return;

    if (this.mode === 'DEPOSIT') {
      this.transactionService.deposit({
        accountNumber: this.selectedAccount.accountNumber,
        amount: this.amount,
        depositMethod: 'ATM_CARD',
        cardNumber: this.cardForm.cardNumber || this.selectedCard?.maskedCardNumber,
        expiryMonth: this.cardForm.expiryMonth,
        expiryYear: this.cardForm.expiryYear,
        cvv: this.cardForm.cvv,
        atmPin: pin,
        description: this.description || 'ATM Card Deposit'
      }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.lastTxn.set(res.data);
            this.toastService.success('Deposit successful!');
            this.amount = null;
            this.description = '';
            this.loadData();
          }
        }
      });
    } else {
      this.transactionService.withdraw({
        accountNumber: this.selectedAccount.accountNumber,
        amount: this.amount,
        withdrawMethod: 'ATM_CARD',
        cardNumber: this.cardForm.cardNumber || this.selectedCard?.maskedCardNumber,
        atmPin: pin,
        transactionPin: pin,
        description: this.description || 'ATM Cash Withdrawal'
      }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.lastTxn.set(res.data);
            this.toastService.success('Withdrawal completed!');
            this.amount = null;
            this.description = '';
            this.loadData();
          }
        }
      });
    }
  }
}
