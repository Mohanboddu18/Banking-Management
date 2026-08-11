import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 animate-fade-in max-w-5xl mx-auto">
      
      <!-- Welcome Banner -->
      <div class="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0284c7]/30 border border-white/10 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="text-xs text-sky-400 font-semibold uppercase tracking-wider mb-1">
            <i class="fa-solid fa-id-badge"></i> Bank Staff Terminal
          </div>
          <h1 class="text-2xl md:text-3xl font-extrabold text-white">
            Welcome, {{ authService.currentUser()?.fullName }}
          </h1>
          <p class="text-xs text-slate-300 mt-1">
            Employee ID: <span class="font-mono text-sky-300 font-bold">{{ authService.currentUser()?.employeeId }}</span> • Role: <span class="text-slate-200 font-bold">{{ getRoleTitle() }}</span>
          </p>
        </div>
      </div>

      <!-- Quick Desk Navigation Cards (Filtered by Role) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        <!-- Cashier Counter (Only Cashier) -->
        <a *ngIf="authService.isCashier()" routerLink="/employee/cashier" class="bank-glass p-6 md:p-8 rounded-3xl space-y-4 hover:border-emerald-500/50 transition-all group">
          <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-cash-register"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white group-hover:text-emerald-300">Cashier Counter</h3>
            <p class="text-xs text-slate-400 mt-1">Process walk-in deposits and cash withdrawals (No customer PIN required)</p>
          </div>
          <span class="text-xs text-emerald-400 font-bold flex items-center gap-1">Open Terminal →</span>
        </a>

        <!-- Loan Officer Desk (Only Loan Officer) -->
        <a *ngIf="authService.isLoanOfficer()" routerLink="/employee/loans" class="bank-glass p-6 md:p-8 rounded-3xl space-y-4 hover:border-rose-500/50 transition-all group">
          <div class="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-file-signature"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white group-hover:text-rose-300">Loan Verification</h3>
            <p class="text-xs text-slate-400 mt-1">Review loan applications and submit recommendations</p>
          </div>
          <span class="text-xs text-rose-400 font-bold flex items-center gap-1">Review Applications →</span>
        </a>

        <!-- Cheque Issuance (Only Operations) -->
        <a *ngIf="authService.isChequeOfficer()" routerLink="/employee/cheques" class="bank-glass p-6 md:p-8 rounded-3xl space-y-4 hover:border-indigo-500/50 transition-all group">
          <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-money-check"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white group-hover:text-indigo-300">Cheque Dispatch</h3>
            <p class="text-xs text-slate-400 mt-1">Approve leaves and assign leaf serial ranges</p>
          </div>
          <span class="text-xs text-indigo-400 font-bold flex items-center gap-1">Manage Cheques →</span>
        </a>

        <!-- Customer Support Desk (Only Support Officer) -->
        <a *ngIf="authService.isSupportOfficer()" routerLink="/employee/support" class="bank-glass p-6 md:p-8 rounded-3xl space-y-4 hover:border-amber-500/50 transition-all group">
          <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            <i class="fa-solid fa-headset"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-white group-hover:text-amber-300">Grievance Desk</h3>
            <p class="text-xs text-slate-400 mt-1">Resolve customer disputes and inquiries</p>
          </div>
          <span class="text-xs text-amber-400 font-bold flex items-center gap-1">Support Console →</span>
        </a>

      </div>

    </div>
  `
})
export class EmployeeDashboardComponent {
  authService = inject(AuthService);

  getRoleTitle(): string {
    const role = this.authService.currentUser()?.roles?.[0] || '';
    if (role.includes('CASHIER')) return 'Head Cashier';
    if (role.includes('LOAN')) return 'Loan Officer';
    if (role.includes('OPERATIONS')) return 'Operations & Cheque Officer';
    if (role.includes('CUSTOMER_SERVICE')) return 'Support Officer';
    if (role.includes('ASST_MANAGER')) return 'Assistant Manager';
    return 'Bank Officer';
  }
}
