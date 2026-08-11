import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../core/services/account.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, Beneficiary, Transaction } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';

@Component({
  selector: 'app-transfer-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe, PinModalComponent],
  template: `
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-paper-plane text-sky-400"></i> P2P Fund Transfer Hub
          </h1>
          <p class="text-xs text-slate-400">Instant 24x7 IMPS / NEFT transfer with atomic deadlock protection</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="showAddBeneficiary.set(true)" class="bank-btn-primary text-xs">
            <i class="fa-solid fa-user-plus"></i> Add Beneficiary
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Transfer Form (2 Cols) -->
        <div class="lg:col-span-2 bank-glass p-6 md:p-8 rounded-3xl">
          <form (ngSubmit)="initiateTransfer()" class="space-y-5">
            
            <!-- From Account Selection -->
            <div>
              <label class="bank-label">Debiting Account *</label>
              <select [(ngModel)]="selectedAccount" name="fromAccount" required class="bank-input">
                <option *ngFor="let acc of accounts()" [ngValue]="acc">
                  {{ acc.accountNumber }} — {{ acc.accountTypeName }} (Avail: {{ acc.balance | inrCurrency }})
                </option>
              </select>
            </div>

            <!-- Transfer Mode Switcher -->
            <div>
              <label class="bank-label mb-2">Recipient Selection Method</label>
              <div class="grid grid-cols-2 gap-3">
                <button type="button" (click)="setMode('DIRECT')" 
                        class="p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                        [ngClass]="transferMode === 'DIRECT' ? 'bg-sky-600/20 border-sky-500 text-sky-300 ring-2 ring-sky-500/30' : 'bg-slate-800/40 border-slate-700 text-slate-400'">
                  <i class="fa-solid fa-keyboard"></i> Enter Account Number
                </button>
                <button type="button" (click)="setMode('SAVED')" 
                        class="p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                        [ngClass]="transferMode === 'SAVED' ? 'bg-sky-600/20 border-sky-500 text-sky-300 ring-2 ring-sky-500/30' : 'bg-slate-800/40 border-slate-700 text-slate-400'">
                  <i class="fa-solid fa-address-book"></i> Saved Beneficiaries ({{ beneficiaries().length }})
                </button>
              </div>
            </div>

            <!-- Mode 1: Direct Account Entry (Default) -->
            <div *ngIf="transferMode === 'DIRECT'" class="space-y-4 animate-fade-in">
              <div>
                <label class="bank-label">Recipient Account Number *</label>
                <input [(ngModel)]="receiverAccount" name="receiverAccount" required type="text" 
                       placeholder="e.g. SBIN00010002" class="bank-input font-mono text-base font-bold text-sky-400" />
                
                <!-- Quick Demo Accounts Helper -->
                <div class="mt-2 text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5">
                  <span class="text-slate-500 font-semibold"><i class="fa-solid fa-bolt text-amber-400"></i> Quick Test:</span>
                  <button type="button" (click)="fillDirectAccount('SBIN00010002', 'Priya Sharma')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700">
                    SBIN00010002 (Priya)
                  </button>
                  <button type="button" (click)="fillDirectAccount('SBIN00010003', 'Rohan Gupta')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700">
                    SBIN00010003 (Rohan)
                  </button>
                  <button type="button" (click)="fillDirectAccount('SBIN00010004', 'Amit Verma')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700">
                    SBIN00010004 (Amit)
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="bank-label">Bank IFSC Code *</label>
                  <input [(ngModel)]="receiverIfsc" name="receiverIfsc" required type="text" 
                         placeholder="SBIN000123" class="bank-input uppercase font-mono" />
                </div>
                <div>
                  <label class="bank-label">Recipient Full Name</label>
                  <input [(ngModel)]="receiverName" name="receiverName" type="text" 
                         placeholder="e.g. Priya Sharma" class="bank-input" />
                </div>
              </div>
            </div>

            <!-- Mode 2: Saved Beneficiary Picker -->
            <div *ngIf="transferMode === 'SAVED'" class="space-y-3 animate-fade-in">
              <label class="bank-label">Choose Beneficiary *</label>
              <select [(ngModel)]="selectedBeneficiary" (ngModelChange)="onBeneficiarySelect($event)" name="beneficiary" class="bank-input">
                <option [ngValue]="null">-- Select a registered beneficiary --</option>
                <option *ngFor="let b of beneficiaries()" [ngValue]="b">
                  {{ b.beneficiaryName }} ({{ b.accountNumber }} - {{ b.bankName }})
                </option>
              </select>

              <div *ngIf="beneficiaries().length === 0" class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                <span>No saved beneficiaries found.</span>
                <button type="button" (click)="showAddBeneficiary.set(true)" class="text-amber-400 font-bold underline">
                  + Add One Now
                </button>
              </div>
            </div>

            <!-- Amount Input & Quick Chips -->
            <div>
              <label class="bank-label">Transfer Amount (₹) *</label>
              <div class="relative">
                <span class="absolute left-4 top-3 text-lg font-bold text-slate-500">₹</span>
                <input [(ngModel)]="amount" name="amount" required type="number" min="1" step="0.01"
                       placeholder="0.00" class="bank-input pl-9 text-lg font-bold text-emerald-400" />
              </div>

              <!-- Quick Amount Pills -->
              <div class="flex flex-wrap gap-2 mt-2">
                <button type="button" *ngFor="let p of [500, 1000, 2000, 5000, 10000]" 
                        (click)="amount = p"
                        class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-all">
                  +₹{{ p }}
                </button>
              </div>
            </div>

            <!-- Description / Remarks -->
            <div>
              <label class="bank-label">Payment Remarks / Purpose</label>
              <input [(ngModel)]="description" name="description" type="text" 
                     placeholder="e.g. Rent, Freelance invoice, Personal support" class="bank-input" />
            </div>

            <!-- Submit Button -->
            <button type="submit" [disabled]="!canSubmit()" 
                    class="bank-btn-primary w-full py-3.5 text-base font-bold flex items-center justify-center gap-2">
              <i class="fa-solid fa-lock"></i> Authorize & Transfer Funds
            </button>
          </form>
        </div>

        <!-- Right: Saved Beneficiaries Quick List -->
        <div class="bank-glass p-6 rounded-3xl flex flex-col justify-between space-y-6">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-address-book text-sky-400"></i> Saved Payees
              </h3>
              <span class="text-xs text-sky-400 font-semibold">{{ beneficiaries().length }} saved</span>
            </div>

            <!-- Empty State with Preset Demo Payees -->
            <div *ngIf="beneficiaries().length === 0" class="py-4 text-center space-y-3">
              <p class="text-xs text-slate-400">No custom payees saved yet.</p>
              <button (click)="seedDemoBeneficiary()" class="w-full py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all">
                <i class="fa-solid fa-plus-circle mr-1"></i> Quick Add Priya Sharma
              </button>
            </div>

            <div class="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              <div *ngFor="let b of beneficiaries()" 
                   (click)="quickSelectBeneficiary(b)"
                   class="p-3 rounded-xl bg-slate-800/40 hover:bg-sky-950/40 border border-slate-700/50 hover:border-sky-500/40 cursor-pointer flex items-center justify-between transition-all group"
                   [ngClass]="receiverAccount === b.accountNumber ? 'border-sky-500 ring-1 ring-sky-500/40 bg-sky-950/50' : ''">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-xs">
                    {{ b.beneficiaryName.substring(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">{{ b.beneficiaryName }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ b.accountNumber }} • {{ b.bankName }}</div>
                  </div>
                </div>
                <button (click)="deleteBeneficiary(b, $event)" title="Delete" class="text-slate-500 hover:text-rose-400 text-xs p-1">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Security Tip Box -->
          <div class="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/20 text-xs text-slate-300 space-y-1">
            <div class="font-bold text-sky-400 flex items-center gap-1.5">
              <i class="fa-solid fa-shield-check"></i> 100% Safe Banking
            </div>
            <p class="text-[11px] text-slate-400 leading-tight">
              Godavari Bank never asks for your Transaction PIN or Password over phone or SMS.
            </p>
          </div>
        </div>

      </div>

      <!-- PIN Verification Modal -->
      <app-pin-modal *ngIf="showPinModal()"
                     [title]="'Authorize Transfer of ₹' + amount"
                     [subtitle]="'Sending to ' + (receiverName || receiverAccount)"
                     (confirmed)="onPinConfirmed($event)"
                     (cancel)="showPinModal.set(false)">
      </app-pin-modal>

      <!-- Add Beneficiary Modal -->
      <div *ngIf="showAddBeneficiary()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-sky-500/30">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">Add New Beneficiary</h3>
            <button (click)="showAddBeneficiary.set(false)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <form (ngSubmit)="saveBeneficiary()" class="space-y-4">
            <div>
              <label class="bank-label">Beneficiary Full Name *</label>
              <input [(ngModel)]="newBen.beneficiaryName" name="bName" required type="text" class="bank-input" placeholder="e.g. Rahul Verma" />
            </div>
            <div>
              <label class="bank-label">Account Number *</label>
              <input [(ngModel)]="newBen.accountNumber" name="bAcc" required type="text" class="bank-input font-mono" placeholder="SBIN00010002" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="bank-label">IFSC Code *</label>
                <input [(ngModel)]="newBen.ifscCode" name="bIfsc" required type="text" class="bank-input uppercase font-mono" placeholder="GDVB000123" />
              </div>
              <div>
                <label class="bank-label">Bank Name *</label>
                <input [(ngModel)]="newBen.bankName" name="bBank" required type="text" class="bank-input" placeholder="Godavari Bank" />
              </div>
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" (click)="showAddBeneficiary.set(false)" class="bank-btn-secondary flex-1">Cancel</button>
              <button type="submit" [disabled]="!newBen.beneficiaryName || !newBen.accountNumber || !newBen.ifscCode" class="bank-btn-primary flex-1">
                Save Payee
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Success Receipt Modal -->
      <div *ngIf="lastSuccessTxn()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-emerald-500/40 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500 text-emerald-400 text-3xl flex items-center justify-center mx-auto mb-4 animate-bounce">
            <i class="fa-solid fa-check"></i>
          </div>
          <h3 class="text-xl font-bold text-white mb-1">Transfer Successful!</h3>
          <p class="text-xs text-slate-400 mb-6 font-mono">Ref ID: {{ lastSuccessTxn()?.transactionRef }}</p>

          <div class="p-4 rounded-2xl bg-slate-900 border border-white/5 text-left space-y-2 mb-6 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Amount Paid:</span>
              <span class="font-bold text-emerald-400 text-sm">{{ lastSuccessTxn()?.amount | inrCurrency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">From Account:</span>
              <span class="font-mono text-white">{{ lastSuccessTxn()?.fromAccountNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Balance Remaining:</span>
              <span class="font-mono text-slate-300 font-bold">{{ lastSuccessTxn()?.balanceAfter | inrCurrency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Timestamp:</span>
              <span class="text-slate-300">{{ lastSuccessTxn()?.createdAt | date:'medium' }}</span>
            </div>
          </div>

          <button (click)="lastSuccessTxn.set(null)" class="bank-btn-primary w-full py-3">
            Done
          </button>
        </div>
      </div>

    </div>
  `
})
export class TransferHubComponent {
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private toastService = inject(ToastService);

  accounts = signal<Account[]>([]);
  beneficiaries = signal<Beneficiary[]>([]);

  selectedAccount: Account | null = null;
  transferMode: 'SAVED' | 'DIRECT' = 'DIRECT';
  selectedBeneficiary: Beneficiary | null = null;

  receiverAccount = '';
  receiverIfsc = 'SBIN000123';
  receiverName = '';
  amount: number | null = 1000;
  description = 'P2P Fund Transfer';

  showPinModal = signal<boolean>(false);
  showAddBeneficiary = signal<boolean>(false);
  lastSuccessTxn = signal<Transaction | null>(null);

  newBen = {
    beneficiaryName: '',
    accountNumber: '',
    ifscCode: 'GDVB000123',
    bankName: 'Godavari Bank',
    maxLimit: 100000
  };

  ngOnInit() {
    this.loadData();
  }

  setMode(mode: 'SAVED' | 'DIRECT') {
    this.transferMode = mode;
  }

  fillDirectAccount(accNum: string, name: string) {
    this.transferMode = 'DIRECT';
    this.receiverAccount = accNum;
    this.receiverName = name;
    this.receiverIfsc = 'GDVB000123';
  }

  loadData() {
    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.accounts.set(res.data);
          if (res.data.length > 0) this.selectedAccount = res.data[0];
        }
      }
    });

    this.accountService.getBeneficiaries().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.beneficiaries.set(res.data);
          if (res.data.length > 0) {
            this.transferMode = 'SAVED';
            this.selectedBeneficiary = res.data[0];
            this.onBeneficiarySelect(res.data[0]);
          } else {
            this.transferMode = 'DIRECT';
          }
        }
      }
    });
  }

  seedDemoBeneficiary() {
    this.accountService.addBeneficiary({
      beneficiaryName: 'Priya Sharma',
      accountNumber: 'SBIN00010002',
      ifscCode: 'GDVB000123',
      bankName: 'Godavari Bank',
      maxLimit: 100000
    }).subscribe({
      next: () => {
        this.toastService.success('Added Priya Sharma to saved payees!');
        this.loadData();
      }
    });
  }

  onBeneficiarySelect(b: Beneficiary | null) {
    if (b) {
      this.receiverAccount = b.accountNumber;
      this.receiverIfsc = b.ifscCode;
      this.receiverName = b.beneficiaryName;
    }
  }

  quickSelectBeneficiary(b: Beneficiary) {
    this.transferMode = 'SAVED';
    this.selectedBeneficiary = b;
    this.onBeneficiarySelect(b);
  }

  canSubmit(): boolean {
    return !!this.selectedAccount && !!this.receiverAccount && !!this.receiverIfsc && !!this.amount && this.amount > 0;
  }

  initiateTransfer() {
    if (!this.canSubmit()) return;
    if (this.selectedAccount && this.amount && this.amount > this.selectedAccount.balance) {
      this.toastService.error('Transfer amount exceeds available balance!');
      return;
    }
    this.showPinModal.set(true);
  }

  onPinConfirmed(pin: string) {
    this.showPinModal.set(false);
    if (!this.selectedAccount || !this.amount) return;

    this.transactionService.transfer({
      senderAccountNumber: this.selectedAccount.accountNumber,
      receiverAccountNumber: this.receiverAccount.trim().toUpperCase(),
      receiverIfscCode: this.receiverIfsc.trim().toUpperCase(),
      amount: this.amount,
      description: this.description || 'P2P Fund Transfer',
      transactionPin: pin
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.lastSuccessTxn.set(res.data);
          this.toastService.success('Transfer executed successfully!');
          this.amount = null;
          this.loadData();
        }
      },
      error: (err) => {
        const msg = err.error?.message || err.message || 'Transfer failed. Please check details.';
        this.toastService.error(msg);
      }
    });
  }

  saveBeneficiary() {
    this.accountService.addBeneficiary({
      ...this.newBen,
      accountNumber: this.newBen.accountNumber.trim().toUpperCase(),
      ifscCode: this.newBen.ifscCode.trim().toUpperCase()
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.toastService.success('Beneficiary added successfully!');
          this.showAddBeneficiary.set(false);
          this.newBen = { beneficiaryName: '', accountNumber: '', ifscCode: 'GDVB000123', bankName: 'Godavari Bank', maxLimit: 100000 };
          this.loadData();
        }
      },
      error: (err) => {
        const msg = err.error?.message || 'Could not add beneficiary';
        this.toastService.error(msg);
      }
    });
  }

  deleteBeneficiary(b: Beneficiary, e: Event) {
    e.stopPropagation();
    if (confirm(`Remove ${b.beneficiaryName} from saved beneficiaries?`)) {
      this.accountService.deleteBeneficiary(b.id).subscribe({
        next: () => {
          this.toastService.info('Beneficiary removed');
          this.loadData();
        }
      });
    }
  }
}
