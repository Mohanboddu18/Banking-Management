import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChequeService } from '../../../core/services/cheque.service';
import { ToastService } from '../../../core/services/toast.service';
import { ChequeRequest } from '../../../core/models/models';

@Component({
  selector: 'app-cheque-desk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-money-check"></i> Operations & Cheque Parcel Issuance
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Cheque Book Dispatch Desk
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Review customer cheque requisition slips, verify account status, and authorize cheque series printing.
        </p>
      </div>

      <div class="bank-card p-6 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-amber-500"></i> Pending Dispatch Requests
          </h3>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ pendingRequests().length }} Awaiting</span>
        </div>

        <div *ngIf="pendingRequests().length === 0" class="py-8 text-center text-xs text-slate-500">
          No pending cheque requests waiting for processing.
        </div>

        <div class="space-y-3">
          <div *ngFor="let req of pendingRequests()" class="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <div class="font-mono text-sm font-extrabold text-slate-900">{{ req.accountNumber }}</div>
              <div class="text-xs text-slate-600 mt-1">Leaves: <strong class="text-amber-700 font-bold font-mono">{{ req.totalLeaves }} leaves</strong> • Requested: {{ req.requestDate | date:'mediumDate' }}</div>
            </div>

            <div class="flex items-center gap-2">
              <button (click)="process(req, 'APPROVE')" class="bank-btn-primary text-xs py-1.5 px-3.5 font-bold shadow-xs">
                <i class="fa-solid fa-check"></i> Approve & Issue
              </button>
              <button (click)="process(req, 'REJECT')" class="bank-btn-danger text-xs py-1.5 px-3 font-semibold">
                <i class="fa-solid fa-times"></i> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChequeDeskComponent {
  private chequeService = inject(ChequeService);
  private toastService = inject(ToastService);

  pendingRequests = signal<ChequeRequest[]>([]);

  ngOnInit() {
    this.loadPending();
  }

  loadPending() {
    this.chequeService.getPendingRequests().subscribe({
      next: (res) => {
        if (res.success && res.data) this.pendingRequests.set(res.data);
      }
    });
  }

  process(req: ChequeRequest, action: string) {
    const id = req.id || req.requestId;
    this.chequeService.processChequeRequest(id, { action }).subscribe({
      next: () => {
        this.toastService.success(`Cheque request ${action === 'APPROVE' ? 'approved and issued' : 'rejected'}`);
        this.loadPending();
      }
    });
  }
}
