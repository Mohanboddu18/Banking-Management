import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../../core/services/complaint.service';
import { ToastService } from '../../../core/services/toast.service';
import { Complaint } from '../../../core/models/models';

@Component({
  selector: 'app-support-desk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
          <i class="fa-solid fa-headset text-amber-400"></i> Customer Support & Dispute Resolution Desk
        </h1>
        <p class="text-xs text-slate-400">Investigate customer grievance tickets, update status, and enter resolution notes</p>
      </div>

      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
        <h3 class="text-base font-bold text-white">Active Grievance Tickets ({{ allComplaints().length }})</h3>

        <div *ngIf="allComplaints().length === 0" class="py-12 text-center text-xs text-slate-400">
          No customer complaints found.
        </div>

        <div class="space-y-4">
          <div *ngFor="let c of allComplaints()" class="p-6 rounded-2xl bg-slate-800/40 border border-white/5 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <span class="font-mono text-xs font-bold text-sky-400">#{{ c.complaintTicket }}</span>
                <span class="text-xs font-bold text-white">{{ c.customerName }} ({{ c.customerId }})</span>
                <span class="badge badge-info text-[10px]">{{ c.category }}</span>
              </div>
              <span class="badge" [ngClass]="{
                'badge-warning': c.status === 'OPEN' || c.status === 'ASSIGNED',
                'badge-purple': c.status === 'IN_PROGRESS',
                'badge-success': c.status === 'RESOLVED' || c.status === 'CLOSED'
              }">
                {{ c.status }}
              </span>
            </div>

            <div>
              <h4 class="text-sm font-bold text-white">{{ c.subject }}</h4>
              <p class="text-xs text-slate-300 mt-1 leading-relaxed">{{ c.description }}</p>
            </div>

            <div *ngIf="c.resolutionNotes" class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200">
              <strong>Resolution:</strong> {{ c.resolutionNotes }}
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
              <span class="text-slate-400 text-[10px]">Raised: {{ c.createdAt | date:'medium' }}</span>
              <button (click)="openUpdateModal(c)" class="bank-btn-secondary text-xs py-1.5 px-3">
                <i class="fa-solid fa-pen-to-square text-sky-400"></i> Update Ticket Status
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Ticket Modal -->
      <div *ngIf="selectedComplaint()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-amber-500/30">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">Update Ticket #{{ selectedComplaint()?.complaintTicket }}</h3>
            <button (click)="selectedComplaint.set(null)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="submitUpdate()" class="space-y-4">
            <div>
              <label class="bank-label">Update Status *</label>
              <select [(ngModel)]="newStatus" name="status" class="bank-input">
                <option value="IN_PROGRESS">In Progress / Under Investigation</option>
                <option value="RESOLVED">Resolved & Closed</option>
                <option value="CLOSED">Rejected / Closed</option>
              </select>
            </div>

            <div>
              <label class="bank-label">Resolution Notes / Action Taken *</label>
              <textarea [(ngModel)]="resolutionNotes" name="notes" required rows="3" placeholder="Explain the investigation outcome..." class="bank-input"></textarea>
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" (click)="selectedComplaint.set(null)" class="bank-btn-secondary flex-1">Cancel</button>
              <button type="submit" [disabled]="!resolutionNotes" class="bank-btn-primary flex-1">
                Save Update
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class SupportDeskComponent {
  private complaintService = inject(ComplaintService);
  private toastService = inject(ToastService);

  allComplaints = signal<Complaint[]>([]);
  selectedComplaint = signal<Complaint | null>(null);

  newStatus = 'IN_PROGRESS';
  resolutionNotes = '';

  ngOnInit() {
    this.loadComplaints();
  }

  loadComplaints() {
    this.complaintService.getAllComplaints().subscribe({
      next: (res) => {
        if (res.success && res.data) this.allComplaints.set(res.data);
      }
    });
  }

  openUpdateModal(c: Complaint) {
    this.selectedComplaint.set(c);
    this.newStatus = c.status === 'OPEN' ? 'IN_PROGRESS' : c.status;
    this.resolutionNotes = c.resolutionNotes || '';
  }

  submitUpdate() {
    if (!this.selectedComplaint() || !this.resolutionNotes) return;
    this.complaintService.updateComplaintStatus(this.selectedComplaint()!.id, {
      status: this.newStatus,
      resolutionNotes: this.resolutionNotes
    }).subscribe({
      next: () => {
        this.toastService.success('Ticket status updated!');
        this.selectedComplaint.set(null);
        this.loadComplaints();
      }
    });
  }
}
