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
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-paper-plane"></i> 24x7 Instant Digital Payments & RTGS/NEFT
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Transfer Money Online
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Transfer funds instantly to any bank account in India with zero fee and 256-bit bank-grade encryption.
        </p>
      </div>

      <!-- Section Sub-Header with Action -->
      <div class="flex items-center justify-between pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-money-bill-transfer text-amber-500"></i> New Payment Order
        </h2>
        <button (click)="showAddBeneficiary.set(true)" class="bank-btn-secondary text-xs py-1.5 px-3 font-semibold flex items-center gap-1.5 shadow-2xs">
          <i class="fa-solid fa-plus text-amber-500"></i> Add Beneficiary
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        <!-- Transfer Form (2 Cols) -->
        <div class="lg:col-span-2 bank-card p-6 space-y-4">
          <form (ngSubmit)="initiateTransfer()" class="space-y-4">
            
            <!-- From Account Selection -->
            <div>
              <label class="bank-label">From Account *</label>
              <select [(ngModel)]="selectedAccount" name="fromAccount" required class="bank-input text-xs font-semibold">
                <option *ngFor="let acc of accounts()" [ngValue]="acc">
                  {{ acc.accountNumber }} — Balance: {{ acc.balance | inrCurrency }} ({{ acc.accountTypeName }})
                </option>
              </select>
            </div>

            <!-- Transfer Mode Switcher -->
            <div>
              <label class="bank-label mb-1.5">Recipient Mode</label>
              <div class="flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
                <button type="button" (click)="setMode('DIRECT')" 
                        class="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        [ngClass]="transferMode === 'DIRECT' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
                  <i class="fa-solid fa-keyboard mr-1 text-amber-500"></i> Direct Account Entry
                </button>
                <button type="button" (click)="setMode('SAVED')" 
                        class="flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        [ngClass]="transferMode === 'SAVED' ? 'bg-white text-slate-900 shadow-xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'">
                  <i class="fa-solid fa-address-book mr-1 text-amber-500"></i> Saved Payees ({{ beneficiaries().length }})
                </button>
              </div>
            </div>

            <!-- Mode 1: Direct Account Entry (Default) -->
            <div *ngIf="transferMode === 'DIRECT'" class="space-y-3 animate-fade-in">
              <div>
                <label class="bank-label">Recipient Account Number *</label>
                <input [(ngModel)]="receiverAccount" name="receiverAccount" required type="text" 
                       placeholder="e.g. SBIN00010002" class="bank-input font-mono text-xs font-bold" />
                
                <!-- Quick Demo Accounts Helper -->
                <div class="mt-1.5 text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
                  <span>Quick Test:</span>
                  <button type="button" (click)="fillDirectAccount('SBIN00010002', 'Priya Sharma')" class="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-amber-50 hover:border-amber-400 text-slate-700 border border-slate-200 text-[10px] font-semibold cursor-pointer shadow-2xs">
                    Priya (SBIN00010002)
                  </button>
                  <button type="button" (click)="fillDirectAccount('SBIN00010003', 'Rohan Gupta')" class="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-amber-50 hover:border-amber-400 text-slate-700 border border-slate-200 text-[10px] font-semibold cursor-pointer shadow-2xs">
                    Rohan (SBIN00010003)
                  </button>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="bank-label">IFSC Code *</label>
                  <input [(ngModel)]="receiverIfsc" name="receiverIfsc" required type="text" 
                         placeholder="SBIN000123" class="bank-input uppercase font-mono text-xs" />
                </div>
                <div>
                  <label class="bank-label">Recipient Name</label>
                  <input [(ngModel)]="receiverName" name="receiverName" type="text" 
                         placeholder="e.g. Priya Sharma" class="bank-input text-xs" />
                </div>
              </div>
            </div>

            <!-- Mode 2: Saved Beneficiary Picker -->
            <div *ngIf="transferMode === 'SAVED'" class="space-y-2 animate-fade-in">
              <label class="bank-label">Choose Beneficiary *</label>
              <select [(ngModel)]="selectedBeneficiary" (ngModelChange)="onBeneficiarySelect($event)" name="beneficiary" class="bank-input text-xs font-semibold">
                <option [ngValue]="null">-- Select a registered beneficiary --</option>
                <option *ngFor="let b of beneficiaries()" [ngValue]="b">
                  {{ b.beneficiaryName }} ({{ b.accountNumber }} - {{ b.bankName }})
                </option>
              </select>

              <div *ngIf="beneficiaries().length === 0" class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span>No saved beneficiaries found.</span>
                <button type="button" (click)="showAddBeneficiary.set(true)" class="text-amber-600 font-bold hover:underline cursor-pointer">
                  + Add One
                </button>
              </div>
            </div>

            <!-- Amount Input & Quick Chips -->
            <div>
              <label class="bank-label">Amount (₹) *</label>
              
              <!-- Transaction Limit Badge Info -->
              <div class="mb-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-950 flex items-center justify-between font-medium">
                <span class="flex items-center gap-1.5">
                  <i class="fa-solid fa-shield-check text-amber-600"></i>
                  <span>Per-Txn Max: ₹1,00,000 • 24H Account Limit Applies</span>
                </span>
                <span class="font-bold font-mono text-[10px] text-amber-900 uppercase">24H RESTRICTED</span>
              </div>

              <div class="relative">
                <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400 pointer-events-none">₹</span>
                <input [(ngModel)]="amount" name="amount" required type="number" min="1" step="0.01"
                       placeholder="0.00" class="bank-input bank-input-with-currency pl-10 text-lg font-extrabold text-slate-900 font-display"
                       [ngClass]="(amount && amount > 100000) ? 'border-rose-500 bg-rose-50/30 focus:ring-rose-400' : ''" />
              </div>

              <!-- Instant Validation Warning -->
              <div *ngIf="amount && amount > 100000" class="mt-1.5 text-xs text-rose-600 font-bold flex items-center gap-1">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>Amount exceeds maximum per-transaction transfer limit of ₹1,00,000 (1 Lakh)!</span>
              </div>

              <!-- Quick Amount Pills -->
              <div class="flex flex-wrap gap-2 mt-2">
                <button type="button" *ngFor="let p of [500, 1000, 2000, 5000, 10000]" 
                        (click)="amount = p"
                        class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:border-amber-400 text-xs font-semibold text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-2xs">
                  +₹{{ p }}
                </button>
              </div>
            </div>

            <!-- Description / Remarks -->
            <div>
              <label class="bank-label">Remarks (Optional)</label>
              <input [(ngModel)]="description" name="description" type="text" 
                     placeholder="e.g. Rent, Bill, Personal" class="bank-input text-xs" />
            </div>

            <!-- Submit Button -->
            <button type="submit" [disabled]="!canSubmit()" 
                    class="bank-btn-primary w-full py-2.5 text-xs font-bold rounded-xl mt-2 cursor-pointer">
              <i class="fa-solid fa-lock text-xs"></i>
              <span>Transfer Funds Now →</span>
            </button>
          </form>
        </div>

        <!-- Right: Saved Beneficiaries Quick List -->
        <div class="bank-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h3 class="text-xs font-bold text-slate-900 font-serif flex items-center gap-1.5">
                <i class="fa-solid fa-address-book text-amber-500"></i> Saved Payees
              </h3>
              <span class="pill-dark text-[9px] py-0 px-2">{{ beneficiaries().length }} saved</span>
            </div>

            <!-- Empty State with Preset Demo Payees -->
            <div *ngIf="beneficiaries().length === 0" class="py-4 text-center space-y-2">
              <p class="text-xs text-slate-500">No saved payees yet.</p>
              <button (click)="seedDemoBeneficiary()" class="w-full py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 hover:border-amber-400 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-2xs">
                + Quick Add Priya Sharma
              </button>
            </div>

            <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
              <div *ngFor="let b of beneficiaries()" 
                   (click)="quickSelectBeneficiary(b)"
                   class="p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 cursor-pointer flex items-center justify-between transition-all group"
                   [ngClass]="receiverAccount === b.accountNumber ? 'border-amber-500 bg-amber-50 shadow-2xs' : ''">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-md bg-amber-500/15 text-amber-800 flex items-center justify-center font-bold text-xs">
                    {{ b.beneficiaryName.substring(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">{{ b.beneficiaryName }}</div>
                    <div class="text-[10px] text-slate-500 font-mono">{{ b.accountNumber }} • {{ b.bankName }}</div>
                  </div>
                </div>
                <button (click)="deleteBeneficiary(b, $event)" title="Delete" class="text-slate-400 hover:text-rose-600 text-xs p-1 cursor-pointer">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Security Tip Box -->
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div class="font-bold text-slate-800 flex items-center gap-1">
              <i class="fa-solid fa-shield-check text-amber-500 text-xs"></i> 256-Bit Encrypted Transfer
            </div>
            <p class="text-[10px] leading-tight text-slate-500">
              Godavari Bank protects your transaction with PIN authorization and instant SMS alerts.
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
      <div *ngIf="showAddBeneficiary()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">Add New Beneficiary</h3>
            <button (click)="showAddBeneficiary.set(false)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="saveBeneficiary()" class="space-y-3 text-xs">
            <div>
              <label class="bank-label">Beneficiary Name *</label>
              <input [(ngModel)]="newBen.beneficiaryName" name="bName" required type="text" class="bank-input text-xs" placeholder="e.g. Rahul Verma" />
            </div>
            <div>
              <label class="bank-label">Account Number *</label>
              <input [(ngModel)]="newBen.accountNumber" name="bAcc" required type="text" class="bank-input font-mono text-xs" placeholder="SBIN00010002" />
            </div>
            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="bank-label">IFSC Code *</label>
                <input [(ngModel)]="newBen.ifscCode" name="bIfsc" required type="text" class="bank-input uppercase font-mono text-xs" placeholder="GDVB000123" />
              </div>
              <div>
                <label class="bank-label">Bank Name *</label>
                <input [(ngModel)]="newBen.bankName" name="bBank" required type="text" class="bank-input text-xs" placeholder="Godavari Bank" />
              </div>
            </div>

            <div class="flex gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" (click)="showAddBeneficiary.set(false)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button type="submit" [disabled]="!newBen.beneficiaryName || !newBen.accountNumber || !newBen.ifscCode" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
                Save Payee
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Success Receipt Modal -->
      <div *ngIf="lastSuccessTxn()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-2xl flex items-center justify-center mx-auto">
            <i class="fa-solid fa-check"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 font-serif">Transfer Successful!</h3>
            <p class="text-xs text-slate-500 font-mono mt-0.5">{{ lastSuccessTxn()?.transactionRef }}</p>
          </div>

          <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Amount Paid:</span>
              <span class="font-extrabold text-emerald-600 font-mono">{{ lastSuccessTxn()?.amount | inrCurrency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">From Account:</span>
              <span class="font-mono text-slate-800 font-semibold">{{ lastSuccessTxn()?.fromAccountNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">New Balance:</span>
              <span class="font-mono text-slate-900 font-extrabold">{{ lastSuccessTxn()?.balanceAfter | inrCurrency }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Date:</span>
              <span class="text-slate-500">{{ lastSuccessTxn()?.createdAt | date:'medium' }}</span>
            </div>
          </div>

          <button (click)="lastSuccessTxn.set(null)" class="bank-btn-primary w-full py-2.5 text-xs font-bold rounded-xl">
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
    return !!this.selectedAccount && !!this.receiverAccount && !!this.receiverIfsc && !!this.amount && this.amount > 0 && this.amount <= 100000;
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
