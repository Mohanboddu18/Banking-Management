import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#070d1e] flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Background Ambient Glows -->
      <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-sky-600/15 blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none"></div>

      <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f1936]/80 backdrop-blur-xl relative z-10">
        
        <!-- Left Banner: Godavari Bank Branding & Visuals -->
        <div class="p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-[#002b49] via-[#091f42] to-[#0a1633] border-b md:border-b-0 md:border-r border-white/10">
          <div>
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-sky-500/30">
                <i class="fa-solid fa-building-columns"></i>
              </div>
              <div>
                <h1 class="text-2xl font-extrabold text-white tracking-tight">GODAVARI BANK</h1>
                <p class="text-xs text-sky-400 font-semibold tracking-wider">DIGITAL BANKING PLATFORM</p>
              </div>
            </div>

            <h2 class="text-xl md:text-2xl font-bold text-slate-100 leading-snug mb-3">
              Next-Generation Godavari Digital Banking Simulation
            </h2>
            <p class="text-xs text-slate-300 mb-6 leading-relaxed">
              Experience end-to-end retail banking, multi-stage credit approvals, instant P2P atomic transfers, QR payments, and branch governance.
            </p>

            <div class="space-y-3">
              <div class="flex items-center gap-3 text-xs text-slate-300">
                <div class="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <i class="fa-solid fa-check text-[10px]"></i>
                </div>
                <span>Pessimistic-Locked Atomic P2P Transfers</span>
              </div>
              <div class="flex items-center gap-3 text-xs text-slate-300">
                <div class="w-6 h-6 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <i class="fa-solid fa-check text-[10px]"></i>
                </div>
                <span>QR Merchant Payments & Telecom Recharges</span>
              </div>
              <div class="flex items-center gap-3 text-xs text-slate-300">
                <div class="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <i class="fa-solid fa-check text-[10px]"></i>
                </div>
                <span>6 Specialized Bank Staff & Manager Portals</span>
              </div>
            </div>
          </div>

          <!-- Quick Preset Switchers -->
          <div class="mt-8 pt-6 border-t border-white/10">
            <div class="text-[11px] font-semibold text-sky-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-bolt text-amber-400"></i> Demo One-Click Fill
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button (click)="fillPreset('customer1', 'Password@123')" class="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 text-left border border-white/5 transition-all">
                <span class="font-bold text-white block">👤 Customer</span>
                <span class="text-[10px] text-slate-400">customer1</span>
              </button>
              <button (click)="fillPreset('manager', 'Password@123')" class="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 text-left border border-white/5 transition-all">
                <span class="font-bold text-purple-300 block">👔 Bank Manager</span>
                <span class="text-[10px] text-slate-400">manager</span>
              </button>
              <button (click)="fillPreset('cashier', 'Password@123')" class="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 text-left border border-white/5 transition-all">
                <span class="font-bold text-emerald-300 block">💵 Head Cashier</span>
                <span class="text-[10px] text-slate-400">cashier</span>
              </button>
              <button (click)="fillPreset('loan_officer', 'Password@123')" class="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 text-left border border-white/5 transition-all">
                <span class="font-bold text-rose-300 block">📑 Loan Officer</span>
                <span class="text-[10px] text-slate-400">loan_officer</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Form: Login Controls -->
        <div class="p-8 md:p-12 flex flex-col justify-center">
          <h3 class="text-2xl font-bold text-white mb-1">Sign In</h3>
          <p class="text-xs text-slate-400 mb-6">Enter your credentials to access your Godavari Bank portal.</p>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="bank-label">Username / Account Number / Mobile</label>
              <div class="relative">
                <input [(ngModel)]="username" name="username" required type="text" 
                       placeholder="e.g. customer1 or manager"
                       class="bank-input pl-10" />
                <i class="fa-solid fa-user absolute left-3.5 top-3.5 text-slate-500 text-sm"></i>
              </div>
            </div>

            <div>
              <label class="bank-label">Password</label>
              <div class="relative">
                <input [(ngModel)]="password" name="password" required [type]="showPassword() ? 'text' : 'password'"
                       placeholder="••••••••••••"
                       class="bank-input pl-10 pr-10" />
                <i class="fa-solid fa-lock absolute left-3.5 top-3.5 text-slate-500 text-sm"></i>
                <button type="button" (click)="showPassword.set(!showPassword())" 
                        class="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300">
                  <i class="fa-solid" [ngClass]="showPassword() ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" class="rounded bg-slate-800 border-slate-700 text-sky-500" />
                <span>Remember me</span>
              </label>
              <button type="button" (click)="openForgotModal()" class="text-sky-400 hover:text-sky-300 font-semibold hover:underline cursor-pointer">
                Forgot Password?
              </button>
            </div>

            <button type="submit" [disabled]="loading() || !username || !password" 
                    class="bank-btn-primary w-full py-3 mt-2 text-base">
              <i *ngIf="loading()" class="fa-solid fa-circle-notch fa-spin"></i>
              <span *ngIf="!loading()">Secure Login <i class="fa-solid fa-arrow-right ml-1"></i></span>
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-8 text-center text-xs text-slate-400">
            Don't have a Godavari Bank account? 
            <a routerLink="/auth/register" class="text-sky-400 font-semibold hover:underline ml-1">Open Bank Account</a>
          </div>
        </div>

      </div>

      <!-- FORGOT PASSWORD MODAL -->
      <div *ngIf="showForgotModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div class="max-w-md w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f1936] p-6 md:p-8 space-y-5 relative">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white text-lg shadow-lg shadow-amber-500/20">
                <i class="fa-solid fa-key"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">Reset Password</h3>
                <p class="text-xs text-slate-400">Godavari Bank Self-Service Recovery</p>
              </div>
            </div>
            <button type="button" (click)="closeForgotModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <form (ngSubmit)="onForgotSubmit()" class="space-y-4 text-left">
            <div>
              <label class="bank-label">Username / Account / Mobile / Email *</label>
              <div class="relative">
                <input [(ngModel)]="forgotForm.identifier" name="fIdent" required type="text" 
                       placeholder="e.g. customer1 or 9876543210"
                       class="bank-input pl-10 text-sm" />
                <i class="fa-solid fa-id-card absolute left-3.5 top-3.5 text-slate-500 text-sm"></i>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="bank-label mb-0">Security PIN or PAN (Optional / Demo: 1234)</label>
              </div>
              <div class="relative">
                <input [(ngModel)]="forgotForm.verificationKey" name="fKey" type="text" 
                       placeholder="e.g. 1234 or ABCDE1234F"
                       class="bank-input pl-10 text-sm" />
                <i class="fa-solid fa-shield-halved absolute left-3.5 top-3.5 text-slate-500 text-sm"></i>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">Customers can verify via their 4-digit PIN (default <span class="text-sky-400 font-mono">1234</span>).</p>
            </div>

            <div>
              <label class="bank-label">New Password * (Min 6 chars)</label>
              <div class="relative">
                <input [(ngModel)]="forgotForm.newPassword" name="fNewPass" required type="password" 
                       placeholder="Enter new password"
                       class="bank-input pl-10 text-sm" />
                <i class="fa-solid fa-lock absolute left-3.5 top-3.5 text-slate-500 text-sm"></i>
              </div>
            </div>

            <div>
              <label class="bank-label">Confirm New Password *</label>
              <div class="relative">
                <input [(ngModel)]="forgotForm.confirmPassword" name="fConfPass" required type="password" 
                       placeholder="Confirm new password"
                       class="bank-input pl-10 text-sm" />
                <i class="fa-solid fa-check-double absolute left-3.5 top-3.5 text-slate-500 text-sm"></i>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button type="button" (click)="closeForgotModal()" class="bank-btn-secondary py-2 text-xs">
                Cancel
              </button>
              <button type="submit" [disabled]="forgotLoading() || !forgotForm.identifier || !forgotForm.newPassword || !forgotForm.confirmPassword"
                      class="bank-btn-primary py-2.5 px-6 text-sm">
                <i *ngIf="forgotLoading()" class="fa-solid fa-circle-notch fa-spin mr-1"></i>
                <span *ngIf="!forgotLoading()"><i class="fa-solid fa-key mr-1"></i> Reset Password</span>
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  showForgotModal = signal<boolean>(false);
  forgotLoading = signal<boolean>(false);
  forgotForm = {
    identifier: '',
    verificationKey: '1234',
    newPassword: '',
    confirmPassword: ''
  };

  fillPreset(u: string, p: string) {
    this.username = u;
    this.password = p;
  }

  openForgotModal() {
    this.forgotForm = {
      identifier: this.username || '',
      verificationKey: '1234',
      newPassword: '',
      confirmPassword: ''
    };
    this.showForgotModal.set(true);
  }

  closeForgotModal() {
    this.showForgotModal.set(false);
  }

  onForgotSubmit() {
    if (!this.forgotForm.identifier) {
      this.toastService.warning('Please enter your username, account number, or email.');
      return;
    }
    if (!this.forgotForm.newPassword || this.forgotForm.newPassword.length < 6) {
      this.toastService.warning('New password must be at least 6 characters.');
      return;
    }
    if (this.forgotForm.newPassword !== this.forgotForm.confirmPassword) {
      this.toastService.warning('New passwords do not match. Please re-enter.');
      return;
    }

    this.forgotLoading.set(true);
    this.authService.forgotPassword({
      identifier: this.forgotForm.identifier.trim(),
      newPassword: this.forgotForm.newPassword,
      verificationKey: this.forgotForm.verificationKey ? this.forgotForm.verificationKey.trim() : undefined
    }).subscribe({
      next: (res) => {
        this.forgotLoading.set(false);
        this.toastService.success(res.message || 'Password reset successfully! You can now sign in.');
        this.username = this.forgotForm.identifier.trim();
        this.password = this.forgotForm.newPassword;
        this.closeForgotModal();
      },
      error: (err) => {
        this.forgotLoading.set(false);
        const msg = err.error?.message || err.message || 'Password reset failed. Please verify your details.';
        this.toastService.error(msg);
      }
    });
  }

  onSubmit() {
    if (!this.username || !this.password) return;

    this.loading.set(true);
    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastService.success(`Welcome back to Godavari Bank, ${res.data.fullName}!`);

        if (res.data.userType === 'CUSTOMER') {
          this.router.navigate(['/customer/dashboard']);
        } else if (res.data.roles.includes('ROLE_MANAGER') || res.data.roles.includes('ROLE_ADMIN')) {
          this.router.navigate(['/manager/dashboard']);
        } else {
          this.router.navigate(['/employee/dashboard']);
        }
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
