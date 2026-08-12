import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../../core/services/complaint.service';
import { ToastService } from '../../../core/services/toast.service';
import { Complaint } from '../../../core/models/models';

@Component({
  selector: 'app-complaints-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-headset"></i> 24x7 Customer Grievance & Support Desk
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Help & Disputes Desk
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Raise tickets for transaction disputes, unauthorized charges, or card inquiries with priority resolution SLA.
        </p>
      </div>

      <!-- Action Sub-Header -->
      <div class="flex items-center justify-between pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-ticket text-amber-500"></i> My Support Tickets
        </h2>
        <button (click)="showNewComplaintModal.set(true)" class="bank-btn-primary text-xs py-1.5 px-3.5 font-bold shadow-xs">
          <i class="fa-solid fa-plus"></i> Raise New Ticket
        </button>
      </div>

      <!-- Tickets List -->
      <div class="bank-card p-5 space-y-3">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-sm font-bold text-slate-900 font-serif">Active Cases</h3>
          <span class="pill-dark text-[9px] py-0 px-2">{{ complaints().length }} Total</span>
        </div>

        <div *ngIf="complaints().length === 0" class="py-8 text-center text-xs text-slate-500">
          No grievance tickets found. Click "Raise New Ticket" if you need any assistance.
        </div>

        <div class="space-y-3">
          <div *ngFor="let c of complaints()" class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-extrabold text-amber-700">#{{ c.complaintTicket }}</span>
                <span class="badge badge-info text-[9px]">{{ c.category }}</span>
                <span class="badge" [ngClass]="{
                  'badge-danger': c.priority === 'URGENT' || c.priority === 'HIGH',
                  'badge-warning': c.priority === 'MEDIUM',
                  'badge-info': c.priority === 'LOW'
                }">
                  {{ c.priority }}
                </span>
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

            <!-- Resolution Info if any -->
            <div *ngIf="c.resolutionNotes" class="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
              <div class="font-bold flex items-center gap-1 mb-0.5 text-[11px]">
                <i class="fa-solid fa-comment-dots text-emerald-600"></i> Officer Resolution:
              </div>
              <p class="text-[11px]">{{ c.resolutionNotes }}</p>
            </div>

            <div class="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
              <span>Assigned Officer: <strong class="text-slate-800">{{ c.assignedEmployeeName || 'Pending Triage' }}</strong></span>
              <span>{{ c.createdAt | date:'medium' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- New Ticket Modal -->
      <div *ngIf="showNewComplaintModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">Raise Grievance Ticket</h3>
            <button (click)="showNewComplaintModal.set(false)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="submitComplaint()" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-2.5">
              <div>
                <label class="bank-label">Category *</label>
                <select [(ngModel)]="newTicket.category" name="cat" class="bank-input text-xs font-semibold">
                  <option value="TRANSACTION_FAILURE">Transaction Failure</option>
                  <option value="UNAUTHORIZED_CHARGE">Unauthorized Charge</option>
                  <option value="CARD_ISSUE">Card Issue</option>
                  <option value="LOAN_QUERY">Loan Query</option>
                  <option value="ACCOUNT_ISSUE">Account Issue</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label class="bank-label">Priority</label>
                <select [(ngModel)]="newTicket.priority" name="priority" class="bank-input text-xs font-semibold">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label class="bank-label">Subject *</label>
              <input [(ngModel)]="newTicket.subject" name="sub" required type="text" placeholder="e.g. Transaction debited but failed" class="bank-input text-xs" />
            </div>

            <div>
              <label class="bank-label">Detailed Explanation *</label>
              <textarea [(ngModel)]="newTicket.description" name="desc" required rows="3" placeholder="Provide transaction reference, amount, and details..." class="bank-input text-xs"></textarea>
            </div>

            <div class="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" (click)="showNewComplaintModal.set(false)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button type="submit" [disabled]="!newTicket.subject || !newTicket.description" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class ComplaintsHubComponent {
  private complaintService = inject(ComplaintService);
  private toastService = inject(ToastService);

  complaints = signal<Complaint[]>([]);
  showNewComplaintModal = signal<boolean>(false);

  newTicket = {
    category: 'TRANSACTION_FAILURE',
    priority: 'MEDIUM',
    subject: '',
    description: ''
  };

  ngOnInit() {
    this.loadComplaints();
  }

  loadComplaints() {
    this.complaintService.getMyComplaints().subscribe({
      next: (res) => {
        if (res.success && res.data) this.complaints.set(res.data);
      }
    });
  }

  submitComplaint() {
    this.complaintService.raiseComplaint(this.newTicket).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success('Grievance ticket registered!');
          this.showNewComplaintModal.set(false);
          this.newTicket = { category: 'TRANSACTION_FAILURE', priority: 'MEDIUM', subject: '', description: '' };
          this.loadComplaints();
        }
      }
    });
  }
}
