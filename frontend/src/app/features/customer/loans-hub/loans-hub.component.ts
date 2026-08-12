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
    <div class="space-y-6 animate-fade-in max-w-5xl mx-auto py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-hand-holding-dollar"></i> Retail Credit & Instant Loan Sanctions
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Loans & Credit Lines
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Simulate monthly EMI payments, apply for personal or home loans, and pay installments with 1-click settlement.
        </p>
      </div>

      <!-- Action Sub-Header -->
      <div class="flex items-center justify-between pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-calculator text-amber-500"></i> Interactive EMI Simulator
        </h2>
        <button (click)="showApplyModal.set(true)" class="bank-btn-primary text-xs py-1.5 px-3.5 font-bold shadow-xs">
          <i class="fa-solid fa-plus"></i> Apply for Loan
        </button>
      </div>

      <!-- SECTION 1: INTERACTIVE EMI CALCULATOR -->
      <div class="bank-card p-6 space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Sliders Form (2 Cols) -->
          <div class="lg:col-span-2 space-y-4">
            <div>
              <div class="flex justify-between text-xs mb-1.5 font-semibold">
                <span class="text-slate-600">Loan Amount</span>
                <span class="text-amber-600 font-extrabold font-mono text-sm">{{ calcPrincipal | inrCurrency }}</span>
              </div>
              <input type="range" [(ngModel)]="calcPrincipal" (ngModelChange)="recalculateEmi()" 
                     min="25000" max="5000000" step="25000" 
                     class="w-full accent-amber-500 bg-slate-200 rounded-lg cursor-pointer h-2" />
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1.5 font-semibold">
                <span class="text-slate-600">Interest Rate</span>
                <span class="text-emerald-700 font-extrabold font-mono text-sm">{{ calcRate }}% p.a.</span>
              </div>
              <input type="range" [(ngModel)]="calcRate" (ngModelChange)="recalculateEmi()" 
                     min="7.5" max="18.0" step="0.1" 
                     class="w-full accent-amber-500 bg-slate-200 rounded-lg cursor-pointer h-2" />
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1.5 font-semibold">
                <span class="text-slate-600">Tenure</span>
                <span class="text-slate-900 font-extrabold font-mono text-sm">{{ calcTenure }} Months ({{ (calcTenure/12).toFixed(1) }} Yrs)</span>
              </div>
              <input type="range" [(ngModel)]="calcTenure" (ngModelChange)="recalculateEmi()" 
                     min="6" max="240" step="6" 
                     class="w-full accent-amber-500 bg-slate-200 rounded-lg cursor-pointer h-2" />
            </div>
          </div>

          <!-- Calculated Output Box -->
          <div class="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-center space-y-3 shadow-2xs">
            <div>
              <div class="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estimated Monthly EMI</div>
              <div class="text-2xl font-extrabold text-slate-950 mt-1 font-display">
                {{ emiResult()?.monthlyEmi || 0 | inrCurrency }}
              </div>
            </div>

            <div class="space-y-1.5 py-2.5 border-y border-slate-200 text-xs text-slate-600 text-left">
              <div class="flex justify-between">
                <span class="text-slate-500">Total Interest:</span>
                <span class="font-mono text-slate-900 font-bold">{{ emiResult()?.totalInterest || 0 | inrCurrency }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Total Payable:</span>
                <span class="font-mono text-slate-950 font-extrabold">{{ emiResult()?.totalPayable || 0 | inrCurrency }}</span>
              </div>
            </div>

            <button (click)="openApplyWithCalculator()" class="bank-btn-primary w-full text-xs py-2 font-bold">
              Apply with this Plan →
            </button>
          </div>

        </div>
      </div>

      <!-- SECTION 2: MY ACTIVE & APPLIED LOANS -->
      <div class="space-y-3 pt-2">
        <div class="flex items-center justify-between pb-1">
          <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-list-check text-amber-500"></i> My Loan Portfolio
          </h2>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ myLoans().length }} Active / Applied</span>
        </div>

        <div *ngIf="myLoans().length === 0" class="bank-card p-6 text-center text-xs text-slate-500">
          No loan applications or active credit facilities found.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div *ngFor="let loan of myLoans()" class="bank-card p-5 space-y-3.5">
            <div class="flex justify-between items-start">
              <div>
                <span class="pill-dark">{{ loan.loanTypeName }}</span>
                <div class="font-mono text-xs text-slate-500 mt-1 font-bold">{{ loan.loanAccountNumber }}</div>
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

            <div class="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100 text-xs bg-slate-50/50 p-2.5 rounded-xl">
              <div>
                <span class="text-slate-500 block text-[10px] font-semibold">Sanctioned Amount</span>
                <span class="font-bold text-slate-900">{{ (loan.approvedAmount || loan.requestedAmount) | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] font-semibold">Monthly EMI</span>
                <span class="font-bold text-amber-600 font-mono">{{ loan.monthlyEmi | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] font-semibold">Principal Left</span>
                <span class="font-bold text-rose-600 font-mono">{{ loan.remainingPrincipal | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] font-semibold">Remaining EMIs</span>
                <span class="font-bold text-slate-800">{{ loan.remainingEmis }} / {{ loan.tenureMonths }}</span>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex gap-2">
                <button (click)="viewRepaymentSchedule(loan)" class="bank-btn-secondary flex-1 text-xs py-1.5 font-semibold">
                  <i class="fa-solid fa-calendar-days text-amber-500"></i> View Schedule
                </button>
                <button *ngIf="loan.status === 'ACTIVE'" (click)="openEmiPayment(loan, 'SINGLE')" class="bank-btn-primary flex-1 text-xs py-1.5 font-bold">
                  Pay 1 EMI ({{ loan.monthlyEmi | inrCurrency }})
                </button>
              </div>

              <!-- Pay All EMIs in Single Payment Button -->
              <button *ngIf="loan.status === 'ACTIVE' && loan.remainingEmis > 0" 
                      (click)="openEmiPayment(loan, 'ALL')" 
                      class="bank-btn-success w-full py-1.5 text-xs font-bold shadow-2xs">
                Pay All {{ loan.remainingEmis }} EMIs ({{ getTotalPayable(loan) | inrCurrency }})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loan Application Modal -->
      <div *ngIf="showApplyModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">Apply for a Loan</h3>
            <button (click)="showApplyModal.set(false)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="submitLoanApplication()" class="space-y-3 text-xs">
            <div>
              <label class="bank-label">Loan Type *</label>
              <select [(ngModel)]="applyForm.loanTypeCode" name="type" class="bank-input text-xs font-semibold">
                <option *ngFor="let t of loanTypes()" [value]="t.code">{{ t.name }} ({{ t.interestRate }}% p.a.)</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="bank-label">Amount (₹) *</label>
                <input [(ngModel)]="applyForm.requestedAmount" name="reqAmt" required type="number" class="bank-input text-xs font-bold" />
              </div>
              <div>
                <label class="bank-label">Tenure (Months) *</label>
                <input [(ngModel)]="applyForm.tenureMonths" name="tenure" required type="number" class="bank-input text-xs font-bold" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="bank-label">Employment Type *</label>
                <select [(ngModel)]="applyForm.employmentType" name="empType" class="bank-input text-xs font-semibold">
                  <option value="Salaried">Salaried</option>
                  <option value="Self Employed">Self Employed</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
              <div>
                <label class="bank-label">Monthly Income (₹) *</label>
                <input [(ngModel)]="applyForm.monthlyIncome" name="income" required type="number" class="bank-input text-xs font-bold" />
              </div>
            </div>

            <div>
              <label class="bank-label">Purpose of Loan</label>
              <input [(ngModel)]="applyForm.purpose" name="purpose" required type="text" placeholder="e.g. Home Renovation, Education" class="bank-input text-xs" />
            </div>

            <div class="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" (click)="showApplyModal.set(false)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button type="submit" [disabled]="!applyForm.requestedAmount || !applyForm.tenureMonths" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Amortization Repayment Schedule Modal -->
      <div *ngIf="selectedLoanSchedule()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-xl w-full shadow-2xl max-h-[85vh] flex flex-col space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900 font-serif">Repayment Amortization Schedule</h3>
              <p class="text-[11px] text-slate-500 font-mono">{{ selectedLoanSchedule()?.loanAccountNumber }}</p>
            </div>
            <button (click)="selectedLoanSchedule.set(null)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <div class="overflow-y-auto flex-1 pr-1">
            <table class="bank-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Due Date</th>
                  <th>EMI</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rep of repayments()">
                  <td class="font-bold text-xs">{{ rep.installmentNumber }}</td>
                  <td class="text-xs text-slate-500">{{ rep.dueDate | date:'mediumDate' }}</td>
                  <td class="font-bold text-xs text-amber-600 font-mono">{{ rep.emiAmount | inrCurrency }}</td>
                  <td class="text-xs text-slate-700 font-mono">{{ rep.principalComponent | inrCurrency }}</td>
                  <td class="text-xs text-rose-600 font-mono">{{ rep.interestComponent | inrCurrency }}</td>
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
      <div *ngIf="loanToPay()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-start pb-2 border-b border-slate-100">
            <div>
              <h3 class="text-base font-bold text-slate-900 font-serif">
                {{ payMode === 'SINGLE' ? 'Pay Monthly EMI' : 'Settle Full Loan' }}
              </h3>
              <p class="text-xs text-slate-500 font-mono">{{ loanToPay()?.loanAccountNumber }}</p>
            </div>
            <button (click)="loanToPay.set(null)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Payment Type:</span>
              <span class="font-semibold text-slate-800">{{ payMode === 'SINGLE' ? '1 Month Installment' : 'Full Foreclosure' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Total Amount:</span>
              <span class="font-extrabold text-emerald-600 font-mono">
                {{ (payMode === 'SINGLE' ? loanToPay()?.monthlyEmi : getTotalPayable(loanToPay())) | inrCurrency }}
              </span>
            </div>
          </div>

          <div class="text-xs">
            <label class="bank-label">Debit From Account</label>
            <select [(ngModel)]="selectedAccountNo" class="bank-input text-xs font-semibold">
              <option *ngFor="let acc of accounts()" [value]="acc.accountNumber">
                {{ acc.accountNumber }} (Available: {{ acc.balance | inrCurrency }})
              </option>
            </select>
          </div>

          <div class="flex gap-2 pt-2 border-t border-slate-100">
            <button type="button" (click)="loanToPay.set(null)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
            <button type="button" (click)="openPinVerification()" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
              Authorize PIN →
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
