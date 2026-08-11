import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public Auth Routes
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Customer Routes
  {
    path: 'customer/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/customer-dashboard/customer-dashboard.component').then(m => m.CustomerDashboardComponent)
  },
  {
    path: 'customer/transfer',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/transfer-hub/transfer-hub.component').then(m => m.TransferHubComponent)
  },
  {
    path: 'customer/deposit-withdraw',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/deposit-withdraw/deposit-withdraw.component').then(m => m.DepositWithdrawComponent)
  },
  {
    path: 'customer/cards-cheques',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/cards-cheques/cards-cheques.component').then(m => m.CardsChequesComponent)
  },
  {
    path: 'customer/loans',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/loans-hub/loans-hub.component').then(m => m.LoansHubComponent)
  },
  {
    path: 'customer/vas/qr',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/vas-qr/vas-qr.component').then(m => m.VasQrComponent)
  },
  {
    path: 'customer/vas/recharge',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/vas-recharge/vas-recharge.component').then(m => m.VasRechargeComponent)
  },
  {
    path: 'customer/vas/movies',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/vas-movies/vas-movies.component').then(m => m.VasMoviesComponent)
  },
  {
    path: 'customer/statements',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/statements/statements.component').then(m => m.StatementsComponent)
  },
  {
    path: 'customer/complaints',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_CUSTOMER'] },
    loadComponent: () => import('./features/customer/complaints-hub/complaints-hub.component').then(m => m.ComplaintsHubComponent)
  },
  {
    path: 'customer/profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/customer/profile-settings/profile-settings.component').then(m => m.ProfileSettingsComponent)
  },

  // Employee Routes
  {
    path: 'employee/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_EMPLOYEE_CASHIER', 'ROLE_EMPLOYEE_LOAN_OFFICER', 'ROLE_EMPLOYEE_CUSTOMER_SERVICE', 'ROLE_EMPLOYEE_OPERATIONS', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/employee/employee-dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
  },
  {
    path: 'employee/cashier',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_EMPLOYEE_CASHIER', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/employee/cashier-desk/cashier-desk.component').then(m => m.CashierDeskComponent)
  },
  {
    path: 'employee/loans',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_EMPLOYEE_LOAN_OFFICER', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/employee/loan-desk/loan-desk.component').then(m => m.LoanDeskComponent)
  },
  {
    path: 'employee/cheques',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_EMPLOYEE_OPERATIONS', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/employee/cheque-desk/cheque-desk.component').then(m => m.ChequeDeskComponent)
  },
  {
    path: 'employee/support',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_EMPLOYEE_CUSTOMER_SERVICE', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/employee/support-desk/support-desk.component').then(m => m.SupportDeskComponent)
  },

  // Manager Routes
  {
    path: 'manager/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/manager/manager-dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
  },
  {
    path: 'manager/employees',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/manager/employee-management/employee-management.component').then(m => m.EmployeeManagementComponent)
  },
  {
    path: 'manager/customers',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/manager/customer-management/customer-management.component').then(m => m.CustomerManagementComponent)
  },
  {
    path: 'manager/loans',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/manager/loan-sanctions/loan-sanctions.component').then(m => m.LoanSanctionsComponent)
  },
  {
    path: 'manager/bank-charges',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/manager/bank-charges-config/bank-charges-config.component').then(m => m.BankChargesConfigComponent)
  },
  {
    path: 'manager/audit-logs',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ROLE_MANAGER', 'ROLE_ADMIN'] },
    loadComponent: () => import('./features/manager/audit-logs-viewer/audit-logs-viewer.component').then(m => m.AuditLogsViewerComponent)
  },

  // Fallbacks
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
