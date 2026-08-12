import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { Loan } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-loan-sanctions',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-stamp"></i> Executive Credit Sanction & Direct Fund Disbursement
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Credit Sanctions Desk
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Review underwriting recommendations, set final sanctioned credit limits, and disburse capital directly into accounts.
        </p>
      </div>

      <div class="bank-card p-6 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-amber-500"></i> Applications Awaiting Final Sanction
          </h3>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ pendingLoans().length }} Pending Approval</span>
        </div>

        <div *ngIf="pendingLoans().length === 0" class="py-8 text-center text-xs text-slate-500">
          No loan applications waiting for manager decision.
        </div>

        <div class="space-y-4">
          <div *ngFor="let l of pendingLoans()" class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-2xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 class="text-sm font-bold text-slate-900 font-serif">{{ l.customerName }}</h4>
                <div class="text-xs text-slate-500 font-mono font-bold">{{ l.loanAccountNumber }} • {{ l.loanTypeName }} ({{ l.interestRate }}% p.a.)</div>
              </div>
              <span class="badge badge-warning text-[9px]">{{ l.status }}</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-y border-slate-200 text-xs bg-white p-3 rounded-xl shadow-2xs">
              <div>
                <span class="text-slate-500 block text-[10px] font-semibold">Requested Amount</span>
                <span class="font-extrabold text-slate-900 font-mono">{{ l.requestedAmount | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] font-semibold">Tenure</span>
                <span class="font-bold text-slate-800">{{ l.tenureMonths }} Months</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] font-semibold">Monthly Income</span>
                <span class="font-extrabold text-emerald-600 font-mono">{{ l.monthlyIncome | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] font-semibold">Estimated EMI</span>
                <span class="font-extrabold text-amber-700 font-mono">{{ l.monthlyEmi | inrCurrency }}</span>
              </div>
            </div>

            <div class="text-xs text-slate-700">
              <strong class="text-slate-900">Declared Purpose:</strong> {{ l.purpose }}
            </div>

            <div *ngIf="l.officerRecommendation" class="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950">
              <strong class="text-[11px] text-amber-800">Officer Assessment & Recommendation:</strong> {{ l.officerRecommendation }}
            </div>

            <div class="flex justify-end gap-2.5 pt-1">
              <button (click)="openDecisionModal(l, 'REJECT')" class="bank-btn-danger text-xs py-1.5 px-4 font-semibold">
                <i class="fa-solid fa-times mr-1"></i> Reject
              </button>
              <button (click)="openDecisionModal(l, 'APPROVE')" class="bank-btn-success text-xs py-1.5 px-4 font-bold shadow-2xs">
                <i class="fa-solid fa-check mr-1"></i> Sanction & Disburse Funds →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Decision Modal -->
      <div *ngIf="selectedLoan()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">
              {{ decisionType === 'APPROVE' ? 'Sanction & Disburse Loan' : 'Reject Loan Application' }}
            </h3>
            <button (click)="selectedLoan.set(null)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="submitDecision()" class="space-y-3 text-xs">
            <div *ngIf="decisionType === 'APPROVE'">
              <label class="bank-label">Approved Sanction Amount (₹) *</label>
              <input [(ngModel)]="approvedAmount" name="appAmt" required type="number" class="bank-input text-base font-extrabold text-emerald-700 font-display" />
              <p class="text-[11px] text-slate-500 mt-1">
                Requested: <strong class="text-slate-900">{{ selectedLoan()?.requestedAmount | inrCurrency }}</strong>. Funds will be directly credited to borrower's account.
              </p>
            </div>

            <div>
              <label class="bank-label">Manager Sanction Order Remarks</label>
              <textarea [(ngModel)]="remarks" name="rem" rows="2" placeholder="Sanction order notes..." class="bank-input text-xs"></textarea>
            </div>

            <div class="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" (click)="selectedLoan.set(null)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button type="submit" class="bank-btn-primary flex-1 py-2 text-xs font-bold"
                      [ngClass]="decisionType === 'APPROVE' ? 'bank-btn-success' : 'bank-btn-danger'">
                Confirm {{ decisionType === 'APPROVE' ? 'Sanction & Disburse' : 'Rejection' }}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class LoanSanctionsComponent {
  private loanService = inject(LoanService);
  private toastService = inject(ToastService);

  pendingLoans = signal<Loan[]>([]);
  selectedLoan = signal<Loan | null>(null);

  decisionType: 'APPROVE' | 'REJECT' = 'APPROVE';
  approvedAmount: number = 0;
  remarks = '';

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loanService.getPendingLoans().subscribe({
      next: (res) => {
        if (res.success && res.data) this.pendingLoans.set(res.data);
      }
    });
  }

  openDecisionModal(loan: Loan, type: 'APPROVE' | 'REJECT') {
    this.selectedLoan.set(loan);
    this.decisionType = type;
    this.approvedAmount = loan.requestedAmount;
    this.remarks = type === 'APPROVE' ? 'Loan sanctioned and approved by Bank Manager.' : 'Application rejected due to eligibility criteria.';
  }

  submitDecision() {
    if (!this.selectedLoan()) return;

    this.loanService.decideByManager(this.selectedLoan()!.id, {
      decision: this.decisionType,
      approvedAmount: this.decisionType === 'APPROVE' ? this.approvedAmount : undefined,
      remarks: this.remarks
    }).subscribe({
      next: () => {
        this.toastService.success(this.decisionType === 'APPROVE' ? 'Loan sanctioned and funds disbursed to customer account!' : 'Loan application rejected.');
        this.selectedLoan.set(null);
        this.loadLoans();
      }
    });
  }
}
