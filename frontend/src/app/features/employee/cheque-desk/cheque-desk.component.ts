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
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
          <i class="fa-solid fa-money-check text-indigo-400"></i> Cheque Book Processing Desk
        </h1>
        <p class="text-xs text-slate-400">Process customer cheque book requests and assign official CTS-2010 cheque leaf numbers</p>
      </div>

      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
        <h3 class="text-base font-bold text-white">Pending Cheque Requests ({{ pendingRequests().length }})</h3>

        <div *ngIf="pendingRequests().length === 0" class="py-12 text-center text-xs text-slate-400">
          No pending cheque requests waiting for processing.
        </div>

        <div class="space-y-4">
          <div *ngFor="let req of pendingRequests()" class="p-5 rounded-2xl bg-slate-800/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="font-mono text-sm font-bold text-white">{{ req.accountNumber }}</div>
              <div class="text-xs text-slate-400 mt-0.5">Leaves: <strong class="text-sky-400">{{ req.totalLeaves }}</strong> • Requested: {{ req.requestDate | date:'mediumDate' }}</div>
            </div>

            <div class="flex items-center gap-2">
              <button (click)="process(req, 'APPROVE')" class="bank-btn-primary text-xs py-2">
                <i class="fa-solid fa-check"></i> Approve & Issue
              </button>
              <button (click)="process(req, 'REJECT')" class="bank-btn-secondary text-xs py-2 text-rose-400 hover:border-rose-500/50">
                <i class="fa-solid fa-xmark"></i> Reject
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
