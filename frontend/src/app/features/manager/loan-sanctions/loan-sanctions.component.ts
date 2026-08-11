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
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
          <i class="fa-solid fa-stamp text-rose-400"></i> Executive Loan Sanctions & Auto-Disbursement
        </h1>
        <p class="text-xs text-slate-400">Sanction recommended loans with custom approved credit limits and automatic core account disbursement</p>
      </div>

      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
        <h3 class="text-base font-bold text-white">Applications Awaiting Decision ({{ pendingLoans().length }})</h3>

        <div *ngIf="pendingLoans().length === 0" class="py-12 text-center text-xs text-slate-400">
          No loan applications waiting for manager decision.
        </div>

        <div class="space-y-4">
          <div *ngFor="let l of pendingLoans()" class="p-6 rounded-2xl bg-slate-800/40 border border-white/5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 class="text-base font-bold text-white">{{ l.customerName }} ({{ l.customerId }})</h4>
                <div class="text-xs text-slate-400 font-mono">Ref: {{ l.loanAccountNumber }} • {{ l.loanTypeName }} ({{ l.interestRate }}% p.a.)</div>
              </div>
              <span class="badge badge-warning text-xs font-bold">{{ l.status }}</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-white/5 text-xs">
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Requested Amount</span>
                <span class="font-bold text-white text-sm">{{ l.requestedAmount | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Tenure</span>
                <span class="font-bold text-slate-200">{{ l.tenureMonths }} Months</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Monthly Income</span>
                <span class="font-bold text-emerald-400">{{ l.monthlyIncome | inrCurrency }}</span>
              </div>
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Monthly EMI</span>
                <span class="font-bold text-sky-400">{{ l.monthlyEmi | inrCurrency }}</span>
              </div>
            </div>

            <div class="text-xs text-slate-300">
              <strong class="text-slate-400">Purpose:</strong> {{ l.purpose }}
            </div>

            <div *ngIf="l.officerRecommendation" class="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-200">
              <strong>Loan Officer Assessment:</strong> {{ l.officerRecommendation }}
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button (click)="openDecisionModal(l, 'REJECT')" class="bank-btn-danger text-xs py-2 px-4">
                <i class="fa-solid fa-xmark"></i> Reject Loan
              </button>
              <button (click)="openDecisionModal(l, 'APPROVE')" class="bank-btn-success text-xs py-2 px-5">
                <i class="fa-solid fa-stamp"></i> Sanction & Disburse Funds
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Decision Modal -->
      <div *ngIf="selectedLoan()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border"
             [ngClass]="decisionType === 'APPROVE' ? 'border-emerald-500/40' : 'border-rose-500/40'">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">
              {{ decisionType === 'APPROVE' ? 'Sanction & Disburse Loan' : 'Reject Loan Application' }}
            </h3>
            <button (click)="selectedLoan.set(null)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="submitDecision()" class="space-y-4">
            <div *ngIf="decisionType === 'APPROVE'">
              <label class="bank-label">Approved Loan Amount (₹) *</label>
              <input [(ngModel)]="approvedAmount" name="appAmt" required type="number" class="bank-input text-lg font-bold text-emerald-400" />
              <p class="text-[11px] text-slate-400 mt-1">
                Requested: {{ selectedLoan()?.requestedAmount | inrCurrency }}. Funds will be credited directly to customer's account upon sanction.
              </p>
            </div>

            <div>
              <label class="bank-label">Manager Remarks / Sanction Notes</label>
              <textarea [(ngModel)]="remarks" name="rem" rows="3" placeholder="Sanction order comments..." class="bank-input"></textarea>
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" (click)="selectedLoan.set(null)" class="bank-btn-secondary flex-1">Cancel</button>
              <button type="submit" class="bank-btn-primary flex-1"
                      [ngClass]="decisionType === 'APPROVE' ? 'bank-btn-success' : 'bank-btn-danger'">
                Confirm {{ decisionType === 'APPROVE' ? 'Sanction' : 'Rejection' }}
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
