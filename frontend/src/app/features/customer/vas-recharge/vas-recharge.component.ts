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
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-mobile-screen-button text-teal-400"></i> Mobile Telecom Recharge
          </h1>
          <p class="text-xs text-slate-400">Instant prepaid mobile top-up and data packs across all Indian telecom operators</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Recharge Form (1 Col) -->
        <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-5">
          <form (ngSubmit)="initiateRecharge()" class="space-y-4">
            
            <div>
              <label class="bank-label">Debiting Account *</label>
              <select [(ngModel)]="selectedAccount" name="account" required class="bank-input">
                <option *ngFor="let acc of accounts()" [ngValue]="acc">
                  {{ acc.accountNumber }} (Bal: {{ acc.balance | inrCurrency }})
                </option>
              </select>
            </div>

            <div>
              <label class="bank-label">Mobile Number (10 Digits) *</label>
              <div class="relative">
                <span class="absolute left-3.5 top-3.5 text-xs text-slate-400 font-semibold">+91</span>
                <input [(ngModel)]="mobileNumber" name="mobile" required maxlength="10" type="text" 
                       placeholder="9876543210" class="bank-input pl-12 font-mono" />
              </div>
            </div>

            <div>
              <label class="bank-label">Select Operator *</label>
              <div class="grid grid-cols-2 gap-2">
                <button type="button" *ngFor="let op of operators()" 
                        (click)="selectOperator(op)"
                        class="p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2"
                        [ngClass]="selectedOperator?.id === op.id ? 'bg-teal-600/20 border-teal-500 text-teal-300' : 'bg-slate-800/40 border-slate-700 text-slate-400'">
                  <i class="fa-solid fa-tower-cell"></i> {{ op.name }}
                </button>
              </div>
            </div>

            <div>
              <label class="bank-label">Plan / Recharge Amount (₹) *</label>
              <div class="relative">
                <span class="absolute left-4 top-3 text-lg font-bold text-slate-500">₹</span>
                <input [(ngModel)]="selectedPlanAmount" name="amount" required type="number" 
                       placeholder="0.00" class="bank-input pl-9 text-lg font-bold text-teal-400" />
              </div>
              <p *ngIf="selectedPlanName" class="text-xs text-teal-300 font-medium mt-1">
                Selected: {{ selectedPlanName }}
              </p>
            </div>

            <button type="submit" [disabled]="!selectedAccount || !mobileNumber || !selectedOperator || !selectedPlanAmount" 
                    class="bank-btn-primary w-full py-3.5 text-base">
              <i class="fa-solid fa-bolt"></i> Recharge Now
            </button>
          </form>
        </div>

        <!-- Plans Browser (2 Cols) -->
        <div class="lg:col-span-2 bank-glass p-6 md:p-8 rounded-3xl space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-tags text-teal-400"></i> Popular Plans & Packs
            </h3>
            <span class="text-xs text-slate-400" *ngIf="selectedOperator">
              Showing for <strong class="text-white">{{ selectedOperator.name }}</strong>
            </span>
          </div>

          <div *ngIf="plans().length === 0" class="py-12 text-center text-xs text-slate-400">
            Select a telecom operator on the left to browse best unlimited plans.
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
            <div *ngFor="let p of plans()" 
                 (click)="choosePlan(p)"
                 class="p-4 rounded-2xl bg-slate-800/40 hover:bg-teal-950/40 border border-slate-700/60 hover:border-teal-500/50 cursor-pointer flex flex-col justify-between transition-all group"
                 [ngClass]="selectedPlanAmount === p.amount ? 'border-teal-500 ring-2 ring-teal-500/30' : ''">
              <div>
                <div class="flex justify-between items-start mb-2">
                  <span class="text-xl font-extrabold text-white font-mono">{{ p.amount | inrCurrency }}</span>
                  <span class="badge badge-info text-[10px]">{{ p.validityDays }} Days</span>
                </div>
                <div class="text-xs font-bold text-teal-300 mb-1">{{ p.planName }}</div>
                <div class="text-[11px] text-slate-300 flex items-center gap-2 mb-2">
                  <span><i class="fa-solid fa-database text-sky-400"></i> {{ p.dataQuota }}</span>
                  <span>•</span>
                  <span><i class="fa-solid fa-phone text-emerald-400"></i> {{ p.talktime }}</span>
                </div>
                <p class="text-[10px] text-slate-400 leading-tight">{{ p.description }}</p>
              </div>

              <div class="mt-3 pt-2 border-t border-white/5 flex justify-between items-center text-xs font-semibold text-teal-400 group-hover:translate-x-1 transition-transform">
                <span>Select Plan</span>
                <i class="fa-solid fa-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- PIN Modal -->
      <app-pin-modal *ngIf="showPinModal()"
                     [title]="'Authorize Recharge of ₹' + selectedPlanAmount"
                     [subtitle]="'Mobile number +91 ' + mobileNumber + ' (' + selectedOperator?.name + ')'"
                     (confirmed)="onPinConfirmed($event)"
                     (cancel)="showPinModal.set(false)">
      </app-pin-modal>

      <!-- Success Modal -->
      <div *ngIf="rechargeReceipt()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-teal-500/40 text-center">
          <div class="w-16 h-16 rounded-full bg-teal-500/15 border border-teal-500 text-teal-400 text-3xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <i class="fa-solid fa-check"></i>
          </div>
          <h3 class="text-xl font-bold text-white mb-1">Recharge Successful!</h3>
          <p class="text-xs text-slate-400 mb-6 font-mono">Ref ID: {{ rechargeReceipt()?.transactionRef }}</p>

          <div class="p-4 rounded-2xl bg-slate-900 border border-white/5 text-left space-y-2 mb-6 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Mobile Number:</span>
              <span class="font-mono text-white font-bold">+91 {{ rechargeReceipt()?.mobileNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Operator:</span>
              <span class="text-white">{{ rechargeReceipt()?.operatorName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Amount:</span>
              <span class="font-bold text-teal-400 text-sm">{{ rechargeReceipt()?.amount | inrCurrency }}</span>
            </div>
          </div>

          <button (click)="rechargeReceipt.set(null)" class="bank-btn-primary w-full py-3">
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
        if (res.success && res.data) this.plans.set(res.data);
      }
    });
  }

  choosePlan(p: MobileRechargePlan) {
    this.selectedPlanAmount = p.amount;
    this.selectedPlanName = p.planName;
  }

  initiateRecharge() {
    if (!this.selectedAccount || !this.mobileNumber || !this.selectedOperator || !this.selectedPlanAmount) return;
    if (this.selectedPlanAmount > this.selectedAccount.balance) {
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
