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
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
          <i class="fa-solid fa-file-signature text-rose-400"></i> Loan Officer Verification Desk
        </h1>
        <p class="text-xs text-slate-400">Review pending customer loan applications, evaluate income, and submit recommendations to Branch Manager</p>
      </div>

      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
        <h3 class="text-base font-bold text-white">Pending Review Applications ({{ pendingLoans().length }})</h3>

        <div *ngIf="pendingLoans().length === 0" class="py-12 text-center text-xs text-slate-400">
          No pending loan applications waiting for officer review.
        </div>

        <div class="space-y-4">
          <div *ngFor="let l of pendingLoans()" class="p-6 rounded-2xl bg-slate-800/40 border border-white/5 space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 class="text-base font-bold text-white">{{ l.customerName }} ({{ l.customerId }})</h4>
                <div class="text-xs text-slate-400 font-mono">Ref: {{ l.loanAccountNumber }} • {{ l.loanTypeName }}</div>
              </div>
              <span class="badge badge-warning text-xs font-bold">{{ l.status }}</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-white/5 text-xs">
              <div>
                <span class="text-slate-500 block text-[10px] uppercase">Requested</span>
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
                <span class="text-slate-500 block text-[10px] uppercase">Employment</span>
                <span class="font-bold text-sky-400">{{ l.employmentType }}</span>
              </div>
            </div>

            <div class="text-xs text-slate-300">
              <strong class="text-slate-400">Purpose:</strong> {{ l.purpose }}
            </div>

            <div *ngIf="l.officerRecommendation" class="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 text-xs text-sky-200">
              <strong>Previous Recommendation:</strong> {{ l.officerRecommendation }}
            </div>

            <div class="flex justify-end pt-2">
              <button (click)="openReviewModal(l)" class="bank-btn-primary text-xs">
                Submit Recommendation →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Recommendation Modal -->
      <div *ngIf="selectedLoan()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-rose-500/30">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">Officer Recommendation</h3>
            <button (click)="selectedLoan.set(null)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="submitReview()" class="space-y-4">
            <div>
              <label class="bank-label">Recommendation Decision *</label>
              <select [(ngModel)]="recommendation" name="rec" class="bank-input">
                <option value="RECOMMENDED FOR APPROVAL">Recommended for Full Approval</option>
                <option value="RECOMMENDED WITH REDUCED AMOUNT">Recommended with Reduced Amount</option>
                <option value="RECOMMENDED FOR REJECTION">Recommended for Rejection (High Risk / Low Income)</option>
              </select>
            </div>

            <div>
              <label class="bank-label">Officer Verification Notes *</label>
              <textarea [(ngModel)]="notes" name="notes" required rows="3" placeholder="Verified salary slips, credit score, and KYC documents..." class="bank-input"></textarea>
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" (click)="selectedLoan.set(null)" class="bank-btn-secondary flex-1">Cancel</button>
              <button type="submit" [disabled]="!notes" class="bank-btn-primary flex-1">
                Forward to Manager
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
