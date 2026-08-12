import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VASService } from '../../../core/services/vas.service';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, Merchant } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';
import { QrScannerModalComponent } from '../../../shared/components/qr-scanner-modal/qr-scanner-modal.component';

@Component({
  selector: 'app-vas-qr',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe, PinModalComponent, QrScannerModalComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-qrcode"></i> Instant BharatQR & Merchant Settlements
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Scan & Pay QR
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Scan verified BharatQR codes, merchant UPI IDs, or enter codes directly for zero-fee real-time settlements.
        </p>
      </div>

      <!-- Action Sub-Header -->
      <div class="flex items-center justify-between pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-receipt text-amber-500"></i> Merchant Payment
        </h2>
        <button (click)="showScanner.set(true)" class="bank-btn-primary text-xs py-1.5 px-3.5 font-bold shadow-xs">
          <i class="fa-solid fa-camera"></i> Open Camera Scanner
        </button>
      </div>

      <!-- Payment Form Card -->
      <div class="bank-card p-6 space-y-4">
        <form (ngSubmit)="initiateQrPayment()" class="space-y-4 text-xs">
          
          <div>
            <label class="bank-label">From Account *</label>
            <select [(ngModel)]="selectedAccount" name="account" required class="bank-input text-xs font-semibold">
              <option *ngFor="let acc of accounts()" [ngValue]="acc">
                {{ acc.accountNumber }} (Available: {{ acc.balance | inrCurrency }})
              </option>
            </select>
          </div>

          <div>
            <label class="bank-label">Merchant Code / QR Payload *</label>
            <div class="relative">
              <input [(ngModel)]="qrPayload" name="qrPayload" required type="text" 
                     placeholder="e.g. MERCH001 or scanned merchant ID" class="bank-input bank-input-with-icon-right pr-10 font-mono text-xs font-bold" />
              <button type="button" (click)="showScanner.set(true)" class="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700 cursor-pointer">
                <i class="fa-solid fa-qrcode text-base"></i>
              </button>
            </div>
            <p *ngIf="selectedMerchantName" class="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <i class="fa-solid fa-circle-check text-[10px]"></i> Merchant: {{ selectedMerchantName }}
            </p>
          </div>

          <div>
            <label class="bank-label">Amount (₹) *</label>
            <div class="relative">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 pointer-events-none">₹</span>
              <input [(ngModel)]="amount" name="amount" required type="number" min="1" step="0.01"
                     placeholder="0.00" class="bank-input bank-input-with-currency pl-10 text-lg font-extrabold text-slate-900 font-display" />
            </div>

            <!-- Quick Amounts -->
            <div class="flex flex-wrap gap-2 mt-2">
              <button type="button" *ngFor="let p of [100, 250, 500, 1000, 2000]" 
                      (click)="amount = p"
                      class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:border-amber-400 text-xs font-semibold text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs">
                +₹{{ p }}
              </button>
            </div>
          </div>

          <div>
            <label class="bank-label">Note / Invoice Ref (Optional)</label>
            <input [(ngModel)]="note" name="note" type="text" placeholder="e.g. Dinner, Grocery Bill, Shopping" class="bank-input text-xs" />
          </div>

          <button type="submit" [disabled]="!selectedAccount || !qrPayload || !amount || amount <= 0" 
                  class="bank-btn-primary w-full py-2.5 text-xs font-bold rounded-xl mt-1 cursor-pointer">
            <i class="fa-solid fa-bolt"></i> Pay Merchant Instantly →
          </button>
        </form>
      </div>

      <!-- Quick Verified Merchants Grid -->
      <div class="bank-card p-5 space-y-3">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-1.5">
            <i class="fa-solid fa-store text-amber-500"></i> Verified Partner Merchants
          </h3>
          <span class="pill-dark text-[9px] py-0 px-2">{{ merchants().length }} Active</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div *ngFor="let m of merchants()" 
               (click)="pickMerchant(m)"
               class="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 cursor-pointer flex items-center justify-between transition-all group shadow-2xs">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center text-sm font-bold shadow-2xs">
                <i class="fa-solid fa-shop"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">{{ m.businessName }}</div>
                <div class="text-[10px] text-slate-500 font-mono">{{ m.category }} • {{ m.merchantCode }}</div>
              </div>
            </div>
            <span class="pill-dark text-[9px] py-0 px-2 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">Select</span>
          </div>
        </div>
      </div>

      <!-- QR Scanner Modal -->
      <app-qr-scanner-modal *ngIf="showScanner()"
                            (merchantSelected)="onMerchantScanned($event)"
                            (close)="showScanner.set(false)">
      </app-qr-scanner-modal>

      <!-- PIN Modal -->
      <app-pin-modal *ngIf="showPinModal()"
                     [title]="'Authorize QR Payment of ₹' + amount"
                     [subtitle]="'Paying merchant ' + (selectedMerchantName || qrPayload)"
                     (confirmed)="onPinConfirmed($event)"
                     (cancel)="showPinModal.set(false)">
      </app-pin-modal>

      <!-- Success Receipt Modal -->
      <div *ngIf="receipt()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-xs w-full shadow-2xl text-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-2xl flex items-center justify-center mx-auto">
            <i class="fa-solid fa-check"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 font-serif">Payment Successful!</h3>
            <p class="text-xs text-slate-500 font-mono mt-0.5">{{ receipt()?.transactionRef }}</p>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Merchant:</span>
              <span class="text-slate-900 font-bold">{{ receipt()?.merchantName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Amount Paid:</span>
              <span class="font-extrabold text-emerald-600 font-mono">{{ receipt()?.amount | inrCurrency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">New Balance:</span>
              <span class="font-mono text-slate-900 font-bold">{{ receipt()?.remainingBalance | inrCurrency }}</span>
            </div>
          </div>

          <button (click)="receipt.set(null)" class="bank-btn-primary w-full py-2.5 text-xs font-bold rounded-xl">
            Done
          </button>
        </div>
      </div>

    </div>
  `
})
export class VasQrComponent {
  private vasService = inject(VASService);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);

  accounts = signal<Account[]>([]);
  merchants = signal<Merchant[]>([]);
  selectedAccount: Account | null = null;

  qrPayload = '';
  selectedMerchantName = '';
  amount: number | null = null;
  note = '';

  showScanner = signal<boolean>(false);
  showPinModal = signal<boolean>(false);
  receipt = signal<any | null>(null);

  ngOnInit() {
    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.accounts.set(res.data);
          if (res.data.length > 0) this.selectedAccount = res.data[0];
        }
      }
    });

    this.vasService.getMerchants().subscribe({
      next: (res) => {
        if (res.success && res.data) this.merchants.set(res.data);
      }
    });
  }

  pickMerchant(m: Merchant) {
    this.qrPayload = m.merchantCode;
    this.selectedMerchantName = m.businessName;
  }

  onMerchantScanned(data: { qrPayload: string; merchantName: string }) {
    this.qrPayload = data.qrPayload;
    this.selectedMerchantName = data.merchantName;
    this.showScanner.set(false);
  }

  initiateQrPayment() {
    if (!this.selectedAccount || !this.qrPayload || !this.amount || this.amount <= 0) return;
    if (this.amount > this.selectedAccount.balance) {
      this.toastService.error('Insufficient account balance!');
      return;
    }
    this.showPinModal.set(true);
  }

  onPinConfirmed(pin: string) {
    this.showPinModal.set(false);
    if (!this.selectedAccount || !this.amount) return;

    this.vasService.payQR({
      accountNumber: this.selectedAccount.accountNumber,
      qrPayload: this.qrPayload,
      amount: this.amount,
      note: this.note,
      transactionPin: pin
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.receipt.set(res.data);
          this.toastService.success('Payment successful!');
          this.amount = null;
          this.qrPayload = '';
          this.selectedMerchantName = '';
          this.note = '';
          this.accountService.getMyAccounts().subscribe(r => { if (r.data) this.accounts.set(r.data); });
        }
      }
    });
  }
}
