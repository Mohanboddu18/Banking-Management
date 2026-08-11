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
    <div class="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-clock-rotate-left text-indigo-400"></i> Immutable System Audit Trail
          </h1>
          <p class="text-xs text-slate-400">Real-time immutable security logs recording all transactions, logins, approvals, and system triggers</p>
        </div>

        <button (click)="loadLogs()" class="bank-btn-secondary text-xs">
          <i class="fa-solid fa-arrows-rotate text-sky-400"></i> Refresh Logs
        </button>
      </div>

      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
        <h3 class="text-base font-bold text-white">Live System Audit Events ({{ logs().length }})</h3>

        <div *ngIf="logs().length === 0" class="py-12 text-center text-xs text-slate-400">
          No audit logs recorded yet.
        </div>

        <div *ngIf="logs().length > 0" class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor / Username</th>
                <th>Role</th>
                <th>Action</th>
                <th>Entity Target</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs()">
                <td class="text-xs text-slate-400 font-mono">{{ log.createdAt | date:'dd-MMM HH:mm:ss' }}</td>
                <td class="font-bold text-white text-xs font-mono">{{ log.username }}</td>
                <td>
                  <span class="badge badge-purple text-[9px]">{{ log.role }}</span>
                </td>
                <td class="text-xs font-semibold text-sky-400 font-mono">{{ log.action }}</td>
                <td class="text-xs text-slate-300 font-mono">
                  <span *ngIf="log.entityName">{{ log.entityName }} #{{ log.entityId }}</span>
                </td>
                <td class="text-xs text-slate-300 max-w-xs truncate">{{ log.details }}</td>
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
