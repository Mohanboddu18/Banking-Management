import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6 animate-fade-in max-w-5xl mx-auto py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-id-badge"></i> Staff Operations & Departmental Workstation
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Welcome, {{ authService.currentUser()?.fullName }}
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Employee ID: <strong class="font-mono text-slate-900">{{ authService.currentUser()?.employeeId }}</strong> • Assigned Role: <strong class="text-amber-700">{{ getRoleTitle() }}</strong>
        </p>
      </div>

      <!-- Section Header -->
      <div class="flex items-center justify-between pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-layer-group text-amber-500"></i> Departmental Terminals
        </h2>
        <span class="pill-dark text-[9px] py-0 px-2.5">Duty Active</span>
      </div>

      <!-- Quick Desk Navigation Cards (Filtered by Role) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        <!-- Cashier Counter (Only Cashier) -->
        <a *ngIf="authService.isCashier()" routerLink="/employee/cashier" class="bank-card p-6 space-y-4 hover:border-amber-400 transition-all group flex flex-col justify-between shadow-2xs">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-xl shadow-2xs">
            <i class="fa-solid fa-cash-register"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 font-serif group-hover:text-amber-950">Cashier Counter</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">Process walk-in deposits and cash withdrawals for account holders</p>
          </div>
          <span class="text-xs text-amber-700 font-bold flex items-center gap-1 group-hover:text-amber-900">Open Cashier Terminal →</span>
        </a>

        <!-- Loan Officer Desk (Only Loan Officer) -->
        <a *ngIf="authService.isLoanOfficer()" routerLink="/employee/loans" class="bank-card p-6 space-y-4 hover:border-amber-400 transition-all group flex flex-col justify-between shadow-2xs">
          <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center text-xl shadow-2xs">
            <i class="fa-solid fa-file-signature"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 font-serif group-hover:text-amber-950">Loan Verification</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">Review retail credit applications, underwriting checks, and KYC</p>
          </div>
          <span class="text-xs text-amber-700 font-bold flex items-center gap-1 group-hover:text-amber-900">Review Applications →</span>
        </a>

        <!-- Cheque Issuance (Only Operations) -->
        <a *ngIf="authService.isChequeOfficer()" routerLink="/employee/cheques" class="bank-card p-6 space-y-4 hover:border-amber-400 transition-all group flex flex-col justify-between shadow-2xs">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center text-xl shadow-2xs">
            <i class="fa-solid fa-money-check"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 font-serif group-hover:text-amber-950">Cheque Dispatch</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">Approve cheque book requisition slips and dispatch leaf parcels</p>
          </div>
          <span class="text-xs text-amber-700 font-bold flex items-center gap-1 group-hover:text-amber-900">Manage Cheques →</span>
        </a>

        <!-- Customer Support Desk (Only Support Officer) -->
        <a *ngIf="authService.isSupportOfficer()" routerLink="/employee/support" class="bank-card p-6 space-y-4 hover:border-amber-400 transition-all group flex flex-col justify-between shadow-2xs">
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-xl shadow-2xs">
            <i class="fa-solid fa-headset"></i>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 font-serif group-hover:text-amber-950">Grievance Desk</h3>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">Resolve customer disputes, failed transaction queries, and tickets</p>
          </div>
          <span class="text-xs text-amber-700 font-bold flex items-center gap-1 group-hover:text-amber-900">Support Console →</span>
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
