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
    <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-qrcode text-cyan-400"></i> Merchant QR Code Payments
          </h1>
          <p class="text-xs text-slate-400">Scan any BharatQR or verified merchant code for instant zero-fee settlement</p>
        </div>
        <button (click)="showScanner.set(true)" class="bank-btn-primary text-xs">
          <i class="fa-solid fa-camera"></i> Open Scanner
        </button>
      </div>

      <!-- Payment Form Card -->
      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-6">
        <form (ngSubmit)="initiateQrPayment()" class="space-y-5">
          
          <div>
            <label class="bank-label">Debiting Account *</label>
            <select [(ngModel)]="selectedAccount" name="account" required class="bank-input">
              <option *ngFor="let acc of accounts()" [ngValue]="acc">
                {{ acc.accountNumber }} — {{ acc.accountTypeName }} (Balance: {{ acc.balance | inrCurrency }})
              </option>
            </select>
          </div>

          <div>
            <label class="bank-label">Merchant Code / QR Payload *</label>
            <div class="relative">
              <input [(ngModel)]="qrPayload" name="qrPayload" required type="text" 
                     placeholder="e.g. MERCH001 or scan QR" class="bank-input pr-12 font-mono" />
              <button type="button" (click)="showScanner.set(true)" class="absolute right-3 top-3 text-sky-400 hover:text-sky-300">
                <i class="fa-solid fa-qrcode text-lg"></i>
              </button>
            </div>
            <p *ngIf="selectedMerchantName" class="text-xs text-emerald-400 font-semibold mt-1">
              <i class="fa-solid fa-circle-check"></i> Paying to: {{ selectedMerchantName }}
            </p>
          </div>

          <div>
            <label class="bank-label">Payment Amount (₹) *</label>
            <div class="relative">
              <span class="absolute left-4 top-3 text-lg font-bold text-slate-500">₹</span>
              <input [(ngModel)]="amount" name="amount" required type="number" min="1" step="0.01"
                     placeholder="0.00" class="bank-input pl-9 text-lg font-bold text-cyan-400" />
            </div>

            <!-- Quick Amounts -->
            <div class="flex flex-wrap gap-2 mt-2">
              <button type="button" *ngFor="let p of [100, 250, 500, 1000, 2000]" 
                      (click)="amount = p"
                      class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700">
                +₹{{ p }}
              </button>
            </div>
          </div>

          <div>
            <label class="bank-label">Payment Note / Bill Reference</label>
            <input [(ngModel)]="note" name="note" type="text" placeholder="e.g. Dinner bill, Grocery shopping" class="bank-input" />
          </div>

          <button type="submit" [disabled]="!selectedAccount || !qrPayload || !amount || amount <= 0" 
                  class="bank-btn-primary w-full py-3.5 text-base">
            <i class="fa-solid fa-shield-halved"></i> Authorize & Pay
          </button>
        </form>
      </div>

      <!-- Quick Verified Merchants Grid -->
      <div class="bank-glass p-6 rounded-3xl space-y-4">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-store text-sky-400"></i> Verified Local Merchants
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div *ngFor="let m of merchants()" 
               (click)="pickMerchant(m)"
               class="p-3.5 rounded-2xl bg-slate-800/40 hover:bg-sky-950/40 border border-slate-700/50 hover:border-sky-500/40 cursor-pointer flex items-center justify-between transition-all group">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                <i class="fa-solid fa-shop"></i>
              </div>
              <div>
                <div class="text-xs font-bold text-white group-hover:text-sky-300">{{ m.businessName }}</div>
                <div class="text-[10px] text-slate-400">{{ m.category }} • {{ m.merchantCode }}</div>
              </div>
            </div>
            <span class="badge badge-success text-[10px]">Select</span>
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
      <div *ngIf="receipt()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-cyan-500/40 text-center">
          <div class="w-16 h-16 rounded-full bg-cyan-500/15 border border-cyan-500 text-cyan-400 text-3xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <i class="fa-solid fa-check"></i>
          </div>
          <h3 class="text-xl font-bold text-white mb-1">Paid to {{ receipt()?.merchantName }}</h3>
          <p class="text-xs text-slate-400 mb-6 font-mono">Ref ID: {{ receipt()?.transactionRef }}</p>

          <div class="p-4 rounded-2xl bg-slate-900 border border-white/5 text-left space-y-2 mb-6 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Amount Paid:</span>
              <span class="font-bold text-cyan-400 text-base">{{ receipt()?.amount | inrCurrency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Merchant Code:</span>
              <span class="font-mono text-white">{{ receipt()?.merchantCode }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Remaining Balance:</span>
              <span class="font-mono text-slate-200 font-bold">{{ receipt()?.remainingBalance | inrCurrency }}</span>
            </div>
          </div>

          <button (click)="receipt.set(null)" class="bank-btn-primary w-full py-3">
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
