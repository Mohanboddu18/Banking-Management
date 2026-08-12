import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-60 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 transition-all duration-200 z-30 shadow-xs"
           [ngClass]="{ 'hidden lg:flex': !isOpen, 'flex absolute lg:static left-0 z-50 h-screen': isOpen }">
      
      <!-- Nav Links Container -->
      <div class="p-3 overflow-y-auto flex-1 flex flex-col gap-3">

        <!-- ================= CUSTOMER PORTAL ================= -->
        <div *ngIf="authService.isCustomer()" class="flex flex-col gap-0.5">
          <div class="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Core Banking</div>
          <a routerLink="/customer/dashboard" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500" 
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-chart-pie w-4 text-amber-500"></i>
            <span>Dashboard</span>
          </a>
          <a routerLink="/customer/transfer" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-money-bill-transfer w-4 text-emerald-600"></i>
            <span>Transfer Money</span>
          </a>
          <a routerLink="/customer/deposit-withdraw" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-vault w-4 text-amber-500"></i>
            <span>Deposit & Cash</span>
          </a>
          <a routerLink="/customer/cards-cheques" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-credit-card w-4 text-indigo-600"></i>
            <span>Cards & Cheques</span>
          </a>
          <a routerLink="/customer/loans" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-hand-holding-dollar w-4 text-rose-600"></i>
            <span>Loans & EMI</span>
          </a>

          <div class="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Services</div>
          <a routerLink="/customer/vas/qr" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-qrcode w-4 text-cyan-600"></i>
            <span>Scan QR</span>
          </a>
          <a routerLink="/customer/vas/recharge" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-mobile-screen-button w-4 text-teal-600"></i>
            <span>Mobile Recharge</span>
          </a>
          <a routerLink="/customer/vas/movies" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-film w-4 text-purple-600"></i>
            <span>Movie Tickets</span>
          </a>

          <div class="px-3 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Reports</div>
          <a routerLink="/customer/statements" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-file-invoice w-4 text-amber-500"></i>
            <span>Bank Statements</span>
          </a>
          <a routerLink="/customer/complaints" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-headset w-4 text-blue-600"></i>
            <span>Complaints Desk</span>
          </a>
          <a routerLink="/customer/profile" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-user-gear w-4 text-slate-500"></i>
            <span>Profile & Security</span>
          </a>
        </div>

        <!-- ================= EMPLOYEE PORTAL ================= -->
        <div *ngIf="authService.isEmployee() && !authService.isManager()" class="flex flex-col gap-0.5">
          <div class="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Staff Portal</div>
          
          <a routerLink="/employee/dashboard" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-gauge-high w-4 text-amber-500"></i>
            <span>Dashboard</span>
          </a>

          <!-- Cashier Terminal (Only Cashier / Asst Manager) -->
          <a *ngIf="authService.isCashier()" routerLink="/employee/cashier" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-cash-register w-4 text-emerald-600"></i>
            <span>Cashier Desk</span>
          </a>

          <!-- Loan Verification (Only Loan Officer / Asst Manager) -->
          <a *ngIf="authService.isLoanOfficer()" routerLink="/employee/loans" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-file-signature w-4 text-rose-600"></i>
            <span>Loan Desk</span>
          </a>

          <!-- Cheque Issuance (Only Operations / Asst Manager) -->
          <a *ngIf="authService.isChequeOfficer()" routerLink="/employee/cheques" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-money-check w-4 text-indigo-600"></i>
            <span>Cheque Desk</span>
          </a>

          <!-- Support Desk (Only Customer Support / Asst Manager) -->
          <a *ngIf="authService.isSupportOfficer()" routerLink="/employee/support" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-headset w-4 text-amber-500"></i>
            <span>Support Desk</span>
          </a>
        </div>

        <!-- ================= MANAGER PORTAL ================= -->
        <div *ngIf="authService.isManager()" class="flex flex-col gap-0.5">
          <div class="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Management</div>
          <a routerLink="/manager/dashboard" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-chart-line w-4 text-purple-600"></i>
            <span>Overview</span>
          </a>
          <a routerLink="/manager/employees" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-users-gear w-4 text-sky-600"></i>
            <span>Employees</span>
          </a>
          <a routerLink="/manager/customers" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-user-check w-4 text-emerald-600"></i>
            <span>Customers</span>
          </a>
          <a routerLink="/manager/loans" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-stamp w-4 text-rose-600"></i>
            <span>Loan Sanctions</span>
          </a>
          <a routerLink="/manager/bank-charges" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-sliders w-4 text-amber-500"></i>
            <span>Charges Rules</span>
          </a>
          <a routerLink="/manager/audit-logs" routerLinkActive="bg-amber-50 text-amber-950 font-bold border-l-2 border-amber-500"
             (click)="closeOnMobile()"
             class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-colors">
            <i class="fa-solid fa-clock-rotate-left w-4 text-indigo-600"></i>
            <span>Audit Logs</span>
          </a>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="p-3 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
        <span class="font-bold text-slate-700">Godavari Bank</span>
        <span class="pill-green text-[9px] py-0 px-2">Online</span>
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
