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
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-headset text-blue-400"></i> Customer Grievance & Support Desk
          </h1>
          <p class="text-xs text-slate-400">Register dispute tickets, report transaction errors, and track resolution progress</p>
        </div>
        <button (click)="showNewComplaintModal.set(true)" class="bank-btn-primary text-xs">
          <i class="fa-solid fa-plus"></i> Raise New Ticket
        </button>
      </div>

      <!-- Tickets List -->
      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
        <h3 class="text-base font-bold text-white">My Support Tickets ({{ complaints().length }})</h3>

        <div *ngIf="complaints().length === 0" class="py-12 text-center text-xs text-slate-400">
          No grievance tickets registered. If you experience issues, click "Raise New Ticket".
        </div>

        <div class="space-y-4">
          <div *ngFor="let c of complaints()" class="p-5 rounded-2xl bg-slate-800/40 border border-white/5 space-y-3">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <span class="font-mono text-xs font-bold text-sky-400">#{{ c.complaintTicket }}</span>
                <span class="badge badge-info text-[10px]">{{ c.category }}</span>
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
              <h4 class="text-sm font-bold text-white">{{ c.subject }}</h4>
              <p class="text-xs text-slate-300 mt-1 leading-relaxed">{{ c.description }}</p>
            </div>

            <!-- Resolution Info if any -->
            <div *ngIf="c.resolutionNotes" class="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200">
              <div class="font-bold flex items-center gap-1 mb-0.5">
                <i class="fa-solid fa-comment-dots"></i> Resolution / Officer Update:
              </div>
              <p>{{ c.resolutionNotes }}</p>
            </div>

            <div class="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-white/5">
              <span>Assigned To: {{ c.assignedEmployeeName }}</span>
              <span>Raised On: {{ c.createdAt | date:'medium' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- New Ticket Modal -->
      <div *ngIf="showNewComplaintModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-blue-500/30">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">Raise Grievance Ticket</h3>
            <button (click)="showNewComplaintModal.set(false)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="submitComplaint()" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="bank-label">Category *</label>
                <select [(ngModel)]="newTicket.category" name="cat" class="bank-input">
                  <option value="TRANSACTION_FAILURE">Transaction Failure</option>
                  <option value="UNAUTHORIZED_CHARGE">Unauthorized Charge</option>
                  <option value="CARD_ISSUE">Card Issue / Block</option>
                  <option value="LOAN_QUERY">Loan Query</option>
                  <option value="ACCOUNT_ISSUE">Account Issue</option>
                  <option value="OTHER">Other Query</option>
                </select>
              </div>
              <div>
                <label class="bank-label">Priority</label>
                <select [(ngModel)]="newTicket.priority" name="priority" class="bank-input">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label class="bank-label">Subject / Issue Summary *</label>
              <input [(ngModel)]="newTicket.subject" name="sub" required type="text" placeholder="e.g. Transaction timed out but balance was debited" class="bank-input" />
            </div>

            <div>
              <label class="bank-label">Detailed Explanation *</label>
              <textarea [(ngModel)]="newTicket.description" name="desc" required rows="4" placeholder="Provide transaction IDs, date/time, and relevant details..." class="bank-input"></textarea>
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" (click)="showNewComplaintModal.set(false)" class="bank-btn-secondary flex-1">Cancel</button>
              <button type="submit" [disabled]="!newTicket.subject || !newTicket.description" class="bank-btn-primary flex-1">
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
