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
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-headset"></i> Customer Service & Grievance Resolution
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Support Desk Console
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Investigate reported customer tickets, track dispute inquiries, and record official resolutions.
        </p>
      </div>

      <div class="bank-card p-6 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <i class="fa-solid fa-ticket text-amber-500"></i> Active Grievance Queue
          </h3>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ allComplaints().length }} Total</span>
        </div>

        <div *ngIf="allComplaints().length === 0" class="py-8 text-center text-xs text-slate-500">
          No customer complaints found.
        </div>

        <div class="space-y-3">
          <div *ngFor="let c of allComplaints()" class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-extrabold text-amber-700">#{{ c.complaintTicket }}</span>
                <span class="text-xs font-bold text-slate-900">{{ c.customerName }}</span>
                <span class="badge badge-info text-[9px]">{{ c.category }}</span>
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
              <h4 class="text-xs font-bold text-slate-900">{{ c.subject }}</h4>
              <p class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ c.description }}</p>
            </div>

            <div *ngIf="c.resolutionNotes" class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
              <strong class="text-[11px] text-emerald-800">Resolution Update:</strong> {{ c.resolutionNotes }}
            </div>

            <div class="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
              <span class="text-slate-500 text-[10px]">Raised: {{ c.createdAt | date:'medium' }}</span>
              <button (click)="openUpdateModal(c)" class="bank-btn-primary text-xs py-1 px-3 font-bold shadow-xs">
                <i class="fa-solid fa-pen-to-square mr-1"></i> Update Status
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Update Ticket Modal -->
      <div *ngIf="selectedComplaint()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">Update Ticket #{{ selectedComplaint()?.complaintTicket }}</h3>
            <button (click)="selectedComplaint.set(null)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="submitUpdate()" class="space-y-3 text-xs">
            <div>
              <label class="bank-label">Update Status *</label>
              <select [(ngModel)]="newStatus" name="status" class="bank-input text-xs font-semibold">
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved & Closed</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label class="bank-label">Resolution Notes & Actions Taken *</label>
              <textarea [(ngModel)]="resolutionNotes" name="notes" required rows="3" placeholder="Explain the investigation outcome..." class="bank-input text-xs"></textarea>
            </div>

            <div class="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" (click)="selectedComplaint.set(null)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button type="submit" [disabled]="!resolutionNotes" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
                Save Resolution
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
