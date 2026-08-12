import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager.service';
import { AuditLogItem } from '../../../core/models/models';

@Component({
  selector: 'app-audit-logs-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-clock-rotate-left"></i> Security Logging & Regulatory Compliance Trail
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          System Audit Logs
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Immutable forensic audit trail recording financial transactions, administrative actions, and authentication events.
        </p>
      </div>

      <!-- Action Sub-Header -->
      <div class="flex items-center justify-between pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-shield-halved text-amber-500"></i> Event Audit Trail
        </h2>

        <button (click)="loadLogs()" class="bank-btn-secondary text-xs py-1.5 px-3.5 font-semibold shadow-2xs">
          <i class="fa-solid fa-arrows-rotate mr-1 text-amber-600"></i> Refresh Log Stream
        </button>
      </div>

      <div class="bank-card p-6 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif">Logged Activity Events</h3>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ logs().length }} Records</span>
        </div>

        <div *ngIf="logs().length === 0" class="py-8 text-center text-xs text-slate-500">
          No audit logs recorded yet.
        </div>

        <div *ngIf="logs().length > 0" class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Entity Target</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs()">
                <td class="text-xs text-slate-500 font-mono whitespace-nowrap">{{ log.createdAt | date:'dd-MMM-yyyy HH:mm:ss' }}</td>
                <td class="font-bold text-slate-900 text-xs font-mono">{{ log.username }}</td>
                <td>
                  <span class="pill-dark text-[9px] py-0 px-2">{{ log.role }}</span>
                </td>
                <td class="text-xs font-extrabold text-amber-700 font-mono">{{ log.action }}</td>
                <td class="text-xs text-slate-700 font-mono font-semibold">
                  <span *ngIf="log.entityName">{{ log.entityName }} #{{ log.entityId }}</span>
                </td>
                <td class="text-xs text-slate-600 max-w-xs truncate">{{ log.details }}</td>
                <td>
                  <span class="badge badge-success text-[9px]">{{ log.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AuditLogsViewerComponent {
  private managerService = inject(ManagerService);
  logs = signal<AuditLogItem[]>([]);

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.managerService.getAuditLogs().subscribe({
      next: (res) => {
        if (res.success && res.data) this.logs.set(res.data);
      }
    });
  }
}
