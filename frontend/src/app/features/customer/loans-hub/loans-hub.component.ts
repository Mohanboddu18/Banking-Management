import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../../core/services/loan.service';
import { AccountService } from '../../../core/services/account.service';
import { ToastService } from '../../../core/services/toast.service';
import { Account, EmiCalculationResult, Loan, LoanRepayment, LoanType } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';
import { PinModalComponent } from '../../../shared/components/pin-modal/pin-modal.component';

@Component({
  selector: 'app-loans-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe, PinModalComponent],
  template: `
    <div class="space-y-8 animate-fade-in max-w-5xl mx-auto">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-hand-holding-dollar text-rose-400"></i> Loans & Credit Facilities Hub
          </h1>
          <p class="text-xs text-slate-400">Apply for retail loans, simulate amortization schedules, pay single EMIs or settle all in 1-click</p>
        </div>
        <button (click)="showApplyModal.set(true)" class="bank-btn-primary text-xs">
          <i class="fa-solid fa-plus"></i> Apply for Loan
        </button>
      </div>

      <!-- SECTION 1: INTERACTIVE EMI CALCULATOR -->
      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-6">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-calculator text-sky-400"></i> Interactive EMI & Amortization Calculator
        </h2>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Sliders Form (2 Cols) -->
          <div class="lg:col-span-2 space-y-5">
            <div>
              <div class="flex justify-between text-xs font-semibold mb-2">
                <span class="text-slate-400">Loan Amount</span>
                <span class="text-sky-400 font-bold text-sm">{{ calcPrincipal | inrCurrency }}</span>
              </div>
              <input type="range" [(ngModel)]="calcPrincipal" (ngModelChange)="recalculateEmi()" 
                     min="25000" max="5000000" step="25000" 
                     class="w-full accent-sky-500 bg-slate-800 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-2">
                <span class="text-slate-400">Annual Interest Rate</span>
                <span class="text-emerald-400 font-bold text-sm">{{ calcRate }}% p.a.</span>
              </div>
              <input type="range" [(ngModel)]="calcRate" (ngModelChange)="recalculateEmi()" 
                     min="7.5" max="18.0" step="0.1" 
                     class="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer" />
            </div>

            <div>
              <div class="flex justify-between text-xs font-semibold mb-2">
                <span class="text-slate-400">Loan Tenure</span>
                <span class="text-amber-400 font-bold text-sm">{{ calcTenure }} Months ({{ (calcTenure/12).toFixed(1) }} Yrs)</span>
              </div>
              <input type="range" [(ngModel)]="calcTenure" (ngModelChange)="recalculateEmi()" 
                     min="6" max="240" step="6" 
                     class="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer" />
            </div>
          </div>

          <!-- Calculated Output Box -->
          <div class="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-sky-950/60 border border-sky-500/30 flex flex-col justify-between text-center">
            <div>
              <div class="text-xs text-slate-400 uppercase font-semibold">Monthly EMI Amount</div>
              <div class="text-3xl font-extrabold text-sky-400 mt-2 font-mono">
                {{ emiResult()?.monthlyEmi || 0 | inrCurrency }}
              </div>
            </div>

            <div class="space-y-2 py-4 border-y border-white/5 text-xs text-slate-300 text-left">
              <div class="flex justify-between">
                <span class="text-slate-400">Total Interest:</span>
                <span class="font-bold text-rose-300">{{ emiResult()?.totalInterest || 0 | inrCurrency }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Total Payable:</span>
                <span class="font-bold text-white">{{ emiResult()?.totalPayable || 0 | inrCurrency }}</span>
              </div>
            </div>

            <button (click)="openApplyWithCalculator()" class="bank-btn-primary w-full text-xs py-2.5">
              Apply with this Plan →
            </button>
          </div>

        </div>
      </div>

      <!-- SECTION 2: MY ACTIVE & APPLIED LOANS -->
      <div class="space-y-4">
        <h2 class="text-lg font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-list-check text-rose-400"></i> My Loan Portfolio
        </h2>

        <div *ngIf="myLoans().length === 0" class="bank-glass p-8 rounded-2xl text-center text-xs text-slate-400">
          No loan applications or active loans found. Use the calculator above to apply for instant funds!
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div *ngFor="let loan of myLoans()" class="bank-glass p-6 rounded-3xl space-y-4 border border-white/10">
            <div class="flex justify-between items-start">
              <div>
                <span class="badge badge-info text-[10px]">{{ loan.loanTypeName }}</span>
                <div class="font-mono text-xs text-slate-400 mt-1 font-semibold">{{ loan.loanAccountNumber }}</div>
              </div>
              <span class="badge" [ngClass]="{
                'badge-success': loan.status === 'ACTIVE',
                'badge-warning': loan.status === 'APPLIED' || loan.status === 'UNDER_REVIEW',
                'badge-danger': loan.status === 'REJECTED',
                'badge-purple': loan.status === 'CLOSED'
              }">
                {{ loan.status }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 py-3 border-y border-white/5 text-xs">
              <div>
                <span class="text-slate-400 block text-[11px]">Sanctioned Amount</span>
                <span class="font-bold text-white text-sm">{{ (loan.approvedAmount || loan.requestedAmount) | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Monthly EMI</span>
                <span class="font-bold text-sky-400 text-sm">{{ loan.monthlyEmi | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Outstanding Principal</span>
                <span class="font-bold text-rose-400">{{ loan.remainingPrincipal | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[11px]">Remaining EMIs</span>
                <span class="font-bold text-slate-200">{{ loan.remainingEmis }} / {{ loan.tenureMonths }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex gap-2">
                <button (click)="viewRepaymentSchedule(loan)" class="bank-btn-secondary flex-1 text-xs py-2">
                  <i class="fa-solid fa-calendar-days text-sky-400"></i> EMI Schedule
                </button>
                <button *ngIf="loan.status === 'ACTIVE'" (click)="openEmiPayment(loan, 'SINGLE')" class="bank-btn-primary flex-1 text-xs py-2">
                  <i class="fa-solid fa-credit-card"></i> Pay 1 EMI ({{ loan.monthlyEmi | inrCurrency }})
                </button>
              </div>

              <!-- Pay All EMIs in Single Payment Button -->
              <button *ngIf="loan.status === 'ACTIVE' && loan.remainingEmis > 0" 
                      (click)="openEmiPayment(loan, 'ALL')" 
                      class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all">
                <i class="fa-solid fa-bolt-lightning text-amber-300"></i>
                Pay All {{ loan.remainingEmis }} EMIs in 1-Click ({{ getTotalPayable(loan) | inrCurrency }})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loan Application Modal -->
      <div *ngIf="showApplyModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-sky-500/30">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">Apply for a Bank Loan</h3>
            <button (click)="showApplyModal.set(false)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="submitLoanApplication()" class="space-y-4">
            <div>
              <label class="bank-label">Select Loan Type *</label>
              <select [(ngModel)]="applyForm.loanTypeCode" name="type" class="bank-input">
                <option *ngFor="let t of loanTypes()" [value]="t.code">{{ t.name }} ({{ t.interestRate }}% p.a.)</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="bank-label">Requested Amount (₹) *</label>
                <input [(ngModel)]="applyForm.requestedAmount" name="reqAmt" required type="number" class="bank-input" />
              </div>
              <div>
                <label class="bank-label">Tenure (Months) *</label>
                <input [(ngModel)]="applyForm.tenureMonths" name="tenure" required type="number" class="bank-input" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="bank-label">Employment Type *</label>
                <select [(ngModel)]="applyForm.employmentType" name="empType" class="bank-input">
                  <option value="Salaried">Salaried (Private / Govt)</option>
                  <option value="Self Employed">Self Employed / Business</option>
                  <option value="Professional">Doctor / Lawyer / CA</option>
                </select>
              </div>
              <div>
                <label class="bank-label">Monthly Income (₹) *</label>
                <input [(ngModel)]="applyForm.monthlyIncome" name="income" required type="number" class="bank-input" />
              </div>
            </div>

            <div>
              <label class="bank-label">Loan Purpose *</label>
              <input [(ngModel)]="applyForm.purpose" name="purpose" required type="text" placeholder="e.g. Home Renovation, Education, Vehicle" class="bank-input" />
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" (click)="showApplyModal.set(false)" class="bank-btn-secondary flex-1">Cancel</button>
              <button type="submit" [disabled]="!applyForm.requestedAmount || !applyForm.tenureMonths" class="bank-btn-primary flex-1">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Amortization Repayment Schedule Modal -->
      <div *ngIf="selectedLoanSchedule()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-2xl w-full shadow-2xl border border-white/10 max-h-[85vh] flex flex-col">
          <div class="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
            <div>
              <h3 class="text-lg font-bold text-white">EMI Repayment Schedule</h3>
              <p class="text-xs text-slate-400 font-mono">Loan Ref: {{ selectedLoanSchedule()?.loanAccountNumber }}</p>
            </div>
            <button (click)="selectedLoanSchedule.set(null)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          <div class="overflow-y-auto flex-1 pr-1">
            <table class="bank-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due Date</th>
                  <th>EMI Amount</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rep of repayments()">
                  <td class="font-bold text-xs">{{ rep.installmentNumber }}</td>
                  <td class="text-xs text-slate-300">{{ rep.dueDate | date:'mediumDate' }}</td>
                  <td class="font-bold text-xs text-sky-400">{{ rep.emiAmount | inrCurrency }}</td>
                  <td class="text-xs text-slate-300">{{ rep.principalComponent | inrCurrency }}</td>
                  <td class="text-xs text-rose-300">{{ rep.interestComponent | inrCurrency }}</td>
                  <td>
                    <span class="badge" [ngClass]="rep.status === 'PAID' ? 'badge-success' : 'badge-warning'">
                      {{ rep.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pay EMI / Pay All Confirmation Modal -->
      <div *ngIf="loanToPay()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-emerald-500/30 space-y-5">
          <div class="flex justify-between items-start pb-3 border-b border-white/10">
            <div>
              <h3 class="text-lg font-bold text-white">
                {{ payMode === 'SINGLE' ? 'Pay Monthly EMI' : 'Settle & Close Full Loan' }}
              </h3>
              <p class="text-xs text-slate-400 font-mono">{{ loanToPay()?.loanAccountNumber }}</p>
            </div>
            <button (click)="loanToPay.set(null)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-400">Payment Type:</span>
              <span class="font-bold text-white">{{ payMode === 'SINGLE' ? '1 Month Installment' : 'Full Foreclosure (' + loanToPay()?.remainingEmis + ' EMIs)' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Total Debit Amount:</span>
              <span class="font-bold text-emerald-400 text-sm font-mono">
                {{ (payMode === 'SINGLE' ? loanToPay()?.monthlyEmi : getTotalPayable(loanToPay())) | inrCurrency }}
              </span>
            </div>
          </div>

          <div>
            <label class="bank-label">Select Account to Debit</label>
            <select [(ngModel)]="selectedAccountNo" class="bank-input">
              <option *ngFor="let acc of accounts()" [value]="acc.accountNumber">
                {{ acc.accountNumber }} — Balance: {{ acc.balance | inrCurrency }}
              </option>
            </select>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" (click)="loanToPay.set(null)" class="bank-btn-secondary flex-1 text-xs">Cancel</button>
            <button type="button" (click)="openPinVerification()" class="bank-btn-success flex-1 text-xs font-bold py-2.5">
              Proceed to PIN Verification →
            </button>
          </div>
        </div>
      </div>

      <!-- PIN Modal for EMI / Foreclosure Payment -->
      <app-pin-modal *ngIf="showPinModal()"
                     [title]="getPinModalTitle()"
                     [subtitle]="'Debit from account ' + selectedAccountNo"
                     (confirmed)="onEmiPinConfirmed($event)"
                     (cancel)="showPinModal.set(false)">
      </app-pin-modal>

    </div>
  `
})
export class LoansHubComponent {
  private loanService = inject(LoanService);
  private accountService = inject(AccountService);
  private toastService = inject(ToastService);

  loanTypes = signal<LoanType[]>([]);
  myLoans = signal<Loan[]>([]);
  repayments = signal<LoanRepayment[]>([]);
  accounts = signal<Account[]>([]);

  calcPrincipal = 500000;
  calcRate = 8.5;
  calcTenure = 36;
  emiResult = signal<EmiCalculationResult | null>(null);

  showApplyModal = signal<boolean>(false);
  selectedLoanSchedule = signal<Loan | null>(null);
  loanToPay = signal<Loan | null>(null);
  payMode: 'SINGLE' | 'ALL' = 'SINGLE';
  selectedAccountNo = '';
  showPinModal = signal<boolean>(false);

  applyForm = {
    loanTypeCode: 'PERSONAL',
    requestedAmount: 500000,
    tenureMonths: 36,
    employmentType: 'Salaried',
    monthlyIncome: 85000,
    purpose: 'Personal Needs'
  };

  ngOnInit() {
    this.loadData();
    this.recalculateEmi();
  }

  loadData() {
    this.loanService.getLoanTypes().subscribe({
      next: (res) => {
        if (res.success && res.data) this.loanTypes.set(res.data);
      }
    });

    this.loanService.getMyLoans().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.myLoans.set(res.data);
        }
      }
    });

    this.accountService.getMyAccounts().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.accounts.set(res.data);
          if (!this.selectedAccountNo) {
            this.selectedAccountNo = res.data[0].accountNumber;
          }
        }
      }
    });
  }

  recalculateEmi() {
    this.loanService.calculateEmi(this.calcPrincipal, this.calcRate, this.calcTenure).subscribe({
      next: (res) => {
        if (res.success && res.data) this.emiResult.set(res.data);
      }
    });
  }

  openApplyWithCalculator() {
    this.applyForm.requestedAmount = this.calcPrincipal;
    this.applyForm.tenureMonths = this.calcTenure;
    this.showApplyModal.set(true);
  }

  submitLoanApplication() {
    this.loanService.applyLoan(this.applyForm).subscribe({
      next: () => {
        this.toastService.success('Loan application submitted for Loan Officer review!');
        this.showApplyModal.set(false);
        this.loadData();
      }
    });
  }

  viewRepaymentSchedule(loan: Loan) {
    this.selectedLoanSchedule.set(loan);
    this.loanService.getRepayments(loan.id).subscribe({
      next: (res) => {
        if (res.success && res.data) this.repayments.set(res.data);
      }
    });
  }

  getTotalPayable(loan: Loan | null): number {
    if (!loan) return 0;
    return (loan.monthlyEmi || 0) * (loan.remainingEmis || 0);
  }

  openEmiPayment(loan: Loan, mode: 'SINGLE' | 'ALL') {
    this.loanToPay.set(loan);
    this.payMode = mode;
    if (this.accounts().length > 0 && !this.selectedAccountNo) {
      this.selectedAccountNo = this.accounts()[0].accountNumber;
    }
  }

  openPinVerification() {
    this.showPinModal.set(true);
  }

  getPinModalTitle(): string {
    const loan = this.loanToPay();
    if (!loan) return 'Authorize Loan Payment';
    if (this.payMode === 'SINGLE') {
      return `Authorize EMI Payment of ₹${loan.monthlyEmi}`;
    } else {
      return `Authorize Full Loan Settlement of ₹${this.getTotalPayable(loan)}`;
    }
  }

  onEmiPinConfirmed(pin: string) {
    const loan = this.loanToPay();
    if (!loan || !this.selectedAccountNo) return;

    this.showPinModal.set(false);

    if (this.payMode === 'SINGLE') {
      this.loanService.payEmi(loan.id, {
        accountNumber: this.selectedAccountNo,
        transactionPin: pin
      }).subscribe({
        next: () => {
          this.toastService.success('EMI installment paid successfully!');
          this.loanToPay.set(null);
          this.loadData();
        }
      });
    } else {
      this.loanService.payAllEmis(loan.id, {
        accountNumber: this.selectedAccountNo,
        transactionPin: pin
      }).subscribe({
        next: () => {
          this.toastService.success('Full loan settled & closed successfully in 1-Click!');
          this.loanToPay.set(null);
          this.loadData();
        }
      });
    }
  }
}
