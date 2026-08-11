import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 bg-[#0b1329] border-r border-white/10 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 transition-all duration-300 z-30"
           [ngClass]="{ 'hidden lg:flex': !isOpen, 'flex absolute lg:static left-0 z-50 h-screen': isOpen }">
      
      <!-- Nav Links Container -->
      <div class="p-4 overflow-y-auto flex-1 flex flex-col gap-6">

        <!-- ================= CUSTOMER PORTAL ================= -->
        <div *ngIf="authService.isCustomer()" class="flex flex-col gap-1">
          <div class="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Core Banking</div>
          <a routerLink="/customer/dashboard" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold" 
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-chart-pie text-base w-5 text-sky-400"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/customer/transfer" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-money-bill-transfer text-base w-5 text-emerald-400"></i>
            <span>Transfer Money</span>
          </a>
          <a routerLink="/customer/deposit-withdraw" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-vault text-base w-5 text-amber-400"></i>
            <span>Deposit & Cash</span>
          </a>
          <a routerLink="/customer/cards-cheques" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-credit-card text-base w-5 text-indigo-400"></i>
            <span>Cards & Cheques</span>
          </a>
          <a routerLink="/customer/loans" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-hand-holding-dollar text-base w-5 text-rose-400"></i>
            <span>Loans & EMI Hub</span>
          </a>

          <div class="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Value Added Services</div>
          <a routerLink="/customer/vas/qr" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-qrcode text-base w-5 text-cyan-400"></i>
            <span>Scan & Pay QR</span>
          </a>
          <a routerLink="/customer/vas/recharge" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-mobile-screen-button text-base w-5 text-teal-400"></i>
            <span>Mobile Recharge</span>
          </a>
          <a routerLink="/customer/vas/movies" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-film text-base w-5 text-fuchsia-400"></i>
            <span>Movie Tickets</span>
          </a>

          <div class="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Reports & Support</div>
          <a routerLink="/customer/statements" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-file-invoice text-base w-5 text-amber-400"></i>
            <span>Bank Statements</span>
          </a>
          <a routerLink="/customer/complaints" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-headset text-base w-5 text-blue-400"></i>
            <span>Complaints Desk</span>
          </a>
          <a routerLink="/customer/profile" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-user-gear text-base w-5 text-slate-400"></i>
            <span>Profile & Security</span>
          </a>
        </div>

        <!-- ================= EMPLOYEE PORTAL ================= -->
        <div *ngIf="authService.isEmployee() && !authService.isManager()" class="flex flex-col gap-1">
          <div class="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Staff Operations</div>
          
          <a routerLink="/employee/dashboard" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-gauge-high text-base w-5 text-sky-400"></i>
            <span>Staff Dashboard</span>
          </a>

          <!-- Cashier Terminal (Only Cashier / Asst Manager) -->
          <a *ngIf="authService.isCashier()" routerLink="/employee/cashier" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-cash-register text-base w-5 text-emerald-400"></i>
            <span>Cashier Terminal</span>
          </a>

          <!-- Loan Verification (Only Loan Officer / Asst Manager) -->
          <a *ngIf="authService.isLoanOfficer()" routerLink="/employee/loans" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-file-signature text-base w-5 text-rose-400"></i>
            <span>Loan Verification</span>
          </a>

          <!-- Cheque Issuance (Only Operations / Asst Manager) -->
          <a *ngIf="authService.isChequeOfficer()" routerLink="/employee/cheques" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-money-check text-base w-5 text-indigo-400"></i>
            <span>Cheque Issuance</span>
          </a>

          <!-- Support Desk (Only Customer Support / Asst Manager) -->
          <a *ngIf="authService.isSupportOfficer()" routerLink="/employee/support" routerLinkActive="bg-sky-600/20 text-sky-400 border-sky-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-headset text-base w-5 text-amber-400"></i>
            <span>Support Desk</span>
          </a>
        </div>

        <!-- ================= MANAGER PORTAL ================= -->
        <div *ngIf="authService.isManager()" class="flex flex-col gap-1">
          <div class="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Executive Governance</div>
          <a routerLink="/manager/dashboard" routerLinkActive="bg-purple-600/20 text-purple-400 border-purple-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-chart-line text-base w-5 text-purple-400"></i>
            <span>Executive Analytics</span>
          </a>
          <a routerLink="/manager/employees" routerLinkActive="bg-purple-600/20 text-purple-400 border-purple-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-users-gear text-base w-5 text-sky-400"></i>
            <span>Employee Staffing</span>
          </a>
          <a routerLink="/manager/customers" routerLinkActive="bg-purple-600/20 text-purple-400 border-purple-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-user-check text-base w-5 text-emerald-400"></i>
            <span>Customer Accounts</span>
          </a>
          <a routerLink="/manager/loans" routerLinkActive="bg-purple-600/20 text-purple-400 border-purple-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-stamp text-base w-5 text-rose-400"></i>
            <span>Loan Sanctions</span>
          </a>
          <a routerLink="/manager/bank-charges" routerLinkActive="bg-purple-600/20 text-purple-400 border-purple-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-sliders text-base w-5 text-amber-400"></i>
            <span>Bank Charges Rules</span>
          </a>
          <a routerLink="/manager/audit-logs" routerLinkActive="bg-purple-600/20 text-purple-400 border-purple-500 font-semibold"
             (click)="closeOnMobile()"
             class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-white/5 border border-transparent transition-all">
            <i class="fa-solid fa-clock-rotate-left text-base w-5 text-indigo-400"></i>
            <span>System Audit Logs</span>
          </a>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="p-4 border-t border-white/10 bg-slate-950/40">
        <div class="flex items-center justify-between text-[11px] text-slate-500">
          <span>Simulation Mode</span>
          <span class="text-emerald-400 font-semibold">v1.0.0</span>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  authService = inject(AuthService);

  closeOnMobile() {
    this.close.emit();
  }
}
