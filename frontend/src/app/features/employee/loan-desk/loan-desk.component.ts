import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { Loan } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-loan-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-file-signature"></i> Credit Underwriting & Appraisal Desk
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Loan Verification Desk
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Review customer loan proposals, verify salary slips & income documents, and issue credit recommendations.
        </p>
      </div>

      <div class="bank-card p-6 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-amber-500"></i> Applications Awaiting Underwriting
          </h3>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ pendingLoans().length }} Pending</span>
        </div>

        <div *ngIf="pendingLoans().length === 0" class="py-8 text-center text-xs text-slate-500">
          No pending loan applications waiting for review.
        </div>

        <div class="space-y-4">
          <div *ngFor="let l of pendingLoans()" class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5 shadow-2xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 class="text-sm font-bold text-slate-900 font-serif">{{ l.customerName }}</h4>
                <div class="text-xs text-slate-500 font-mono font-bold">{{ l.loanAccountNumber }} • {{ l.loanTypeName }}</div>
              </div>
              <span class="badge badge-warning text-[9px]">{{ l.status }}</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-y border-slate-200 text-xs bg-white p-3 rounded-xl shadow-2xs">
              <div>
                <span class="text-slate-500 block text-[10px] font-semibold">Requested Principal</span>
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
                <span class="text-slate-500 block text-[10px] font-semibold">Employment</span>
                <span class="font-bold text-amber-700">{{ l.employmentType }}</span>
              </div>
            </div>

            <div class="text-xs text-slate-700">
              <strong class="text-slate-900">Declared Purpose:</strong> {{ l.purpose }}
            </div>

            <div *ngIf="l.officerRecommendation" class="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950">
              <strong class="text-[11px] text-amber-800">Existing Recommendation:</strong> {{ l.officerRecommendation }}
            </div>

            <div class="flex justify-end pt-1">
              <button (click)="openReviewModal(l)" class="bank-btn-primary text-xs py-1.5 px-4 font-bold shadow-xs">
                Review & Recommend →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Recommendation Modal -->
      <div *ngIf="selectedLoan()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">Underwriter Recommendation</h3>
            <button (click)="selectedLoan.set(null)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="submitReview()" class="space-y-3 text-xs">
            <div>
              <label class="bank-label">Recommendation Decision *</label>
              <select [(ngModel)]="recommendation" name="rec" class="bank-input text-xs font-semibold">
                <option value="RECOMMENDED FOR APPROVAL">Recommended for Approval</option>
                <option value="RECOMMENDED WITH REDUCED AMOUNT">Recommended with Reduced Amount</option>
                <option value="RECOMMENDED FOR REJECTION">Recommended for Rejection</option>
              </select>
            </div>

            <div>
              <label class="bank-label">Verification Notes & Findings *</label>
              <textarea [(ngModel)]="notes" name="notes" required rows="3" placeholder="Verified salary slips, credit score, and income documents..." class="bank-input text-xs"></textarea>
            </div>

            <div class="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" (click)="selectedLoan.set(null)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button type="submit" [disabled]="!notes" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
                Submit Recommendation
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class LoanDeskComponent {
  private loanService = inject(LoanService);
  private toastService = inject(ToastService);

  pendingLoans = signal<Loan[]>([]);
  selectedLoan = signal<Loan | null>(null);

  recommendation = 'RECOMMENDED FOR APPROVAL';
  notes = '';

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

  openReviewModal(loan: Loan) {
    this.selectedLoan.set(loan);
    this.notes = '';
  }

  submitReview() {
    if (!this.selectedLoan() || !this.notes) return;
    this.loanService.reviewByOfficer(this.selectedLoan()!.id, {
      recommendation: this.recommendation,
      notes: this.notes
    }).subscribe({
      next: () => {
        this.toastService.success('Officer review recorded and forwarded to Branch Manager!');
        this.selectedLoan.set(null);
        this.loadLoans();
      }
    });
  }
}
