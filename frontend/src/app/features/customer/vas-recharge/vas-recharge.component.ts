import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VASService } from '../../../core/services/vas.service';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, MobileOperator, MobileRechargePlan } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';

@Component({
  selector: 'app-vas-recharge',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe, PinModalComponent],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-mobile-screen-button"></i> Instant Mobile & Data Recharge
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Mobile Recharge
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Instant prepaid top-up, unlimited 5G data packs, and talktime vouchers for all major telecom carriers.
        </p>
      </div>

      <!-- Action Sub-Header -->
      <div class="flex items-center justify-between pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-tower-cell text-amber-500"></i> Carrier Plans & Top-Up
        </h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <!-- Recharge Form (1 Col) -->
        <div class="bank-card p-6 space-y-4">
          <form (ngSubmit)="initiateRecharge()" class="space-y-4 text-xs">
            
            <div>
              <label class="bank-label">From Account *</label>
              <select [(ngModel)]="selectedAccount" name="account" required class="bank-input text-xs font-semibold">
                <option *ngFor="let acc of accounts()" [ngValue]="acc">
                  {{ acc.accountNumber }} (Available: {{ acc.balance | inrCurrency }})
                </option>
              </select>
            </div>

            <div>
              <label class="bank-label">Mobile Number *</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold pointer-events-none">+91</span>
                <input [(ngModel)]="mobileNumber" name="mobile" required maxlength="10" type="text" 
                       placeholder="9876543210" class="bank-input bank-input-with-icon pl-11 font-mono text-xs font-bold" />
              </div>
            </div>

            <div>
              <label class="bank-label">Telecom Operator *</label>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" *ngFor="let op of operators()" 
                        (click)="selectOperator(op)"
                        class="p-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                        [ngClass]="selectedOperator?.id === op.id ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'">
                  <i class="fa-solid fa-tower-cell text-[10px]"></i> {{ op.name }}
                </button>
              </div>
            </div>

            <div>
              <label class="bank-label">Amount (₹) *</label>
              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 pointer-events-none">₹</span>
                <input [ngModel]="selectedPlanAmount" (ngModelChange)="onAmountChange($event)" name="amount" required type="number" 
                       placeholder="e.g. 299" class="bank-input bank-input-with-currency pl-10 text-lg font-extrabold text-slate-900 font-display"
                       [ngClass]="(selectedPlanAmount && selectedPlanAmount > 0 && !isValidPlanAmount()) ? 'border-rose-500 bg-rose-50/30 focus:ring-rose-400' : ''" />
              </div>

              <!-- Matched Plan Display Badge -->
              <div *ngIf="selectedPlanName" class="mt-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-fade-in">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-circle-check text-emerald-600"></i>
                  <span>Matched Pack: {{ selectedPlanName }}</span>
                </span>
                <span class="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase font-mono">MATCHED</span>
              </div>

              <!-- Instant Warning for Invalid Non-Existent Pack Amount -->
              <div *ngIf="selectedPlanAmount && selectedPlanAmount > 0 && !isValidPlanAmount()" class="mt-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 animate-fade-in">
                <i class="fa-solid fa-circle-exclamation text-rose-600"></i>
                <span>No valid {{ selectedOperator?.name || 'carrier' }} pack for ₹{{ selectedPlanAmount }}. Please select an official pack (e.g. ₹299, ₹719, ₹2999).</span>
              </div>
            </div>

            <button type="submit" [disabled]="!canSubmit()" 
                    class="bank-btn-primary w-full py-2.5 text-xs font-bold rounded-xl mt-1 cursor-pointer">
              <i class="fa-solid fa-bolt"></i> Recharge Now →
            </button>
          </form>
        </div>

        <!-- Plans Browser (2 Cols) -->
        <div class="lg:col-span-2 bank-card p-5 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-1.5">
              <i class="fa-solid fa-tags text-amber-500"></i> Available Recharge Plans
            </h3>
            <span class="pill-dark text-[9px] py-0 px-2" *ngIf="selectedOperator">
              {{ selectedOperator.name }}
            </span>
          </div>

          <div *ngIf="plans().length === 0" class="py-8 text-center text-xs text-slate-500">
            Select an operator to browse recharge packs.
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
            <div *ngFor="let p of plans()" 
                 (click)="choosePlan(p)"
                 class="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 cursor-pointer flex flex-col justify-between transition-all group shadow-2xs"
                 [ngClass]="(selectedPlanAmount && Number(selectedPlanAmount) === Number(p.amount)) ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-400/40' : ''">
              <div>
                <div class="flex justify-between items-start mb-1.5">
                  <span class="text-base font-extrabold text-slate-900 font-mono">{{ p.amount | inrCurrency }}</span>
                  <span class="pill-green text-[9px] py-0 px-2">{{ p.validityDays }} Days</span>
                </div>
                <div class="text-xs font-bold text-amber-900 mb-0.5">{{ p.planName }}</div>
                <div class="text-[10px] text-slate-600 font-medium flex items-center gap-1.5 mb-1.5">
                  <span>{{ p.dataQuota }}</span>
                  <span>•</span>
                  <span>{{ p.talktime }}</span>
                </div>
                <p class="text-[10px] text-slate-500 leading-tight">{{ p.description }}</p>
              </div>

              <div class="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] font-bold text-amber-600 group-hover:text-amber-800">
                <span>Select Plan</span>
                <i class="fa-solid fa-arrow-right text-[9px]"></i>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- PIN Modal -->
      <app-pin-modal *ngIf="showPinModal()"
                     [title]="'Authorize Recharge of ₹' + selectedPlanAmount"
                     [subtitle]="'Mobile: +91 ' + mobileNumber + ' (' + selectedOperator?.name + ')'"
                     (confirmed)="onPinConfirmed($event)"
                     (cancel)="showPinModal.set(false)">
      </app-pin-modal>

      <!-- Success Modal -->
      <div *ngIf="rechargeReceipt()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-xs w-full shadow-2xl text-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-2xl flex items-center justify-center mx-auto">
            <i class="fa-solid fa-check"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 font-serif">Recharge Successful!</h3>
            <p class="text-xs text-slate-500 font-mono mt-0.5">{{ rechargeReceipt()?.transactionRef }}</p>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Mobile:</span>
              <span class="font-mono text-slate-900 font-bold">+91 {{ rechargeReceipt()?.mobileNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Operator:</span>
              <span class="text-slate-800 font-semibold">{{ rechargeReceipt()?.operatorName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Amount Paid:</span>
              <span class="font-extrabold text-emerald-600 font-mono">{{ rechargeReceipt()?.amount | inrCurrency }}</span>
            </div>
          </div>

          <button (click)="rechargeReceipt.set(null)" class="bank-btn-primary w-full py-2.5 text-xs font-bold rounded-xl">
            Done
          </button>
        </div>
      </div>

    </div>
  `
})
export class VasRechargeComponent {
  private vasService = inject(VASService);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);

  Number = Number;

  accounts = signal<Account[]>([]);
  operators = signal<MobileOperator[]>([]);
  plans = signal<MobileRechargePlan[]>([]);

  selectedAccount: Account | null = null;
  selectedOperator: MobileOperator | null = null;
  mobileNumber = '';
  selectedPlanAmount: number | null = null;
  selectedPlanName = '';

  showPinModal = signal<boolean>(false);
  rechargeReceipt = signal<any | null>(null);

  ngOnInit() {
    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.accounts.set(res.data);
          if (res.data.length > 0) this.selectedAccount = res.data[0];
        }
      }
    });

    this.vasService.getOperators().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.operators.set(res.data);
          if (res.data.length > 0) this.selectOperator(res.data[0]);
        }
      }
    });
  }

  selectOperator(op: MobileOperator) {
    this.selectedOperator = op;
    this.vasService.getPlans(op.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.plans.set(res.data);
          if (this.selectedPlanAmount) {
            this.onAmountChange(this.selectedPlanAmount);
          }
        }
      }
    });
  }

  choosePlan(p: MobileRechargePlan) {
    this.selectedPlanAmount = p.amount;
    this.selectedPlanName = p.planName;
  }

  onAmountChange(val: any) {
    const num = val !== null && val !== undefined && val !== '' ? Number(val) : null;
    this.selectedPlanAmount = num;
    if (num && num > 0 && this.plans().length > 0) {
      const match = this.plans().find(p => Number(p.amount) === num);
      if (match) {
        this.selectedPlanName = match.planName;
      } else {
        this.selectedPlanName = '';
      }
    } else {
      this.selectedPlanName = '';
    }
  }

  isValidPlanAmount(): boolean {
    if (!this.selectedPlanAmount || this.selectedPlanAmount <= 0) return false;
    if (this.plans().length === 0) return true;
    return this.plans().some(p => Number(p.amount) === Number(this.selectedPlanAmount));
  }

  canSubmit(): boolean {
    return !!this.selectedAccount && 
           !!this.mobileNumber && 
           this.mobileNumber.trim().length === 10 && 
           !!this.selectedOperator && 
           !!this.selectedPlanAmount && 
           this.selectedPlanAmount > 0 && 
           this.isValidPlanAmount();
  }

  initiateRecharge() {
    if (!this.canSubmit()) return;
    if (this.selectedAccount && this.selectedPlanAmount && this.selectedPlanAmount > this.selectedAccount.balance) {
      this.toastService.error('Insufficient account balance!');
      return;
    }
    this.showPinModal.set(true);
  }

  onPinConfirmed(pin: string) {
    this.showPinModal.set(false);
    if (!this.selectedAccount || !this.selectedOperator || !this.selectedPlanAmount) return;

    this.vasService.rechargeMobile({
      accountNumber: this.selectedAccount.accountNumber,
      mobileNumber: this.mobileNumber,
      operatorId: this.selectedOperator.id,
      planName: this.selectedPlanName || 'Prepaid Pack',
      amount: this.selectedPlanAmount,
      transactionPin: pin
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.rechargeReceipt.set(res.data);
          this.toastService.success('Mobile recharge completed!');
          this.mobileNumber = '';
          this.selectedPlanAmount = null;
          this.selectedPlanName = '';
        }
      }
    });
  }
}
