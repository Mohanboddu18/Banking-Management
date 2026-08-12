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
    <div class="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      
      <!-- Dark Top Header (Reference Style) -->
      <header class="h-16 bg-[#111827] border-b border-slate-800 px-4 md:px-8 flex items-center justify-between shadow-xs">
        <a routerLink="/" class="flex items-center gap-2.5 no-underline">
          <div class="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-bold shadow-xs">
            <i class="fa-solid fa-building-columns"></i>
          </div>
          <div>
            <span class="text-base font-extrabold text-white tracking-tight font-display">Godavari Bank</span>
            <span class="hidden sm:inline-block text-[9px] uppercase tracking-widest font-semibold text-amber-400 ml-2">Digital Platform</span>
          </div>
        </a>

        <div class="flex items-center gap-2">
          <a routerLink="/auth/register" class="text-xs text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors">
            Open Account
          </a>
          <div class="banner-pill text-[11px] py-1 px-3">
            <i class="fa-solid fa-shield-halved text-amber-600"></i> Secure 256-Bit
          </div>
        </div>
      </header>

      <!-- Main Login Container: 2-Column Split Model with Clean Minimal UI -->
      <main class="flex-1 flex items-center justify-center p-4 md:p-8 animate-fade-in w-full">
        <div class="max-w-4xl w-full rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          <!-- LEFT COLUMN: Branding, Value Props & Demo 1-Click Fill -->
          <div class="md:col-span-6 bg-slate-50 p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 space-y-8">
            
            <!-- Brand Badge & Title -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center text-lg font-bold shadow-2xs">
                  <i class="fa-solid fa-building-columns"></i>
                </div>
                <div>
                  <div class="text-base font-extrabold text-slate-900 tracking-tight leading-tight font-serif">GODAVARI BANK</div>
                  <div class="text-[9px] uppercase tracking-widest font-bold text-amber-700">DIGITAL BANKING PLATFORM</div>
                </div>
              </div>

              <div class="space-y-2 pt-2">
                <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 font-serif tracking-tight leading-snug">
                  Next-Generation Godavari Digital Banking Simulation
                </h1>
                <p class="text-xs text-slate-600 leading-relaxed">
                  Experience end-to-end retail banking, multi-stage credit approvals, instant P2P atomic transfers, QR payments, and branch governance.
                </p>
              </div>

              <!-- Feature Checkmarks with Emerald Badges -->
              <div class="space-y-2.5 pt-2">
                <div class="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] shadow-2xs">
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <span>Pessimistic-Locked Atomic P2P Transfers</span>
                </div>
                <div class="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div class="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] shadow-2xs">
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <span>QR Merchant Payments & Telecom Recharges</span>
                </div>
                <div class="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                  <div class="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] shadow-2xs">
                    <i class="fa-solid fa-check"></i>
                  </div>
                  <span>6 Specialized Bank Staff & Manager Portals</span>
                </div>
              </div>
            </div>

            <!-- Demo One-Click Fill 2x2 Grid -->
            <div class="space-y-2.5 pt-4 border-t border-slate-200">
              <div class="text-[10px] uppercase font-bold text-amber-800 tracking-wider flex items-center gap-1.5">
                <i class="fa-solid fa-bolt text-amber-500"></i> DEMO ONE-CLICK FILL
              </div>
              <div class="grid grid-cols-2 gap-2">
                
                <!-- Customer Preset -->
                <button type="button" (click)="fillPreset('customer1', 'Password@123')"
                        class="p-2.5 rounded-xl bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-2xs">
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-[10px]">
                      <i class="fa-solid fa-user"></i>
                    </div>
                    <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Customer</div>
                  </div>
                  <div class="text-[10px] text-slate-500 font-mono mt-0.5">customer1</div>
                </button>

                <!-- Bank Manager Preset -->
                <button type="button" (click)="fillPreset('manager', 'Password@123')"
                        class="p-2.5 rounded-xl bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-2xs">
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">
                      <i class="fa-solid fa-building-shield"></i>
                    </div>
                    <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Bank Manager</div>
                  </div>
                  <div class="text-[10px] text-slate-500 font-mono mt-0.5">manager</div>
                </button>

                <!-- Head Cashier Preset -->
                <button type="button" (click)="fillPreset('cashier', 'Password@123')"
                        class="p-2.5 rounded-xl bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-2xs">
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                      <i class="fa-solid fa-vault"></i>
                    </div>
                    <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Head Cashier</div>
                  </div>
                  <div class="text-[10px] text-slate-500 font-mono mt-0.5">cashier</div>
                </button>

                <!-- Loan Officer Preset -->
                <button type="button" (click)="fillPreset('loan_officer', 'Password@123')"
                        class="p-2.5 rounded-xl bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 text-left transition-all cursor-pointer group shadow-2xs">
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-md bg-rose-100 text-rose-700 flex items-center justify-center text-[10px]">
                      <i class="fa-solid fa-stamp"></i>
                    </div>
                    <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">Loan Officer</div>
                  </div>
                  <div class="text-[10px] text-slate-500 font-mono mt-0.5">loan_officer</div>
                </button>

              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Sign In Form -->
          <div class="md:col-span-6 p-8 md:p-10 flex flex-col justify-center space-y-6 bg-white">
            
            <div class="space-y-1">
              <h2 class="text-2xl font-bold text-slate-900 font-serif tracking-tight">Sign In</h2>
              <p class="text-xs text-slate-500">Enter your credentials to access your Godavari Bank portal.</p>
            </div>

            <!-- Login Form -->
            <form (ngSubmit)="onSubmit()" class="space-y-4">
              
              <!-- Username -->
              <div class="space-y-1.5">
                <label class="bank-label">Username / Account Number / Mobile</label>
                <div class="relative">
                  <input [(ngModel)]="username" name="username" required type="text" 
                         placeholder="hello@gmail.com"
                         class="bank-input bank-input-with-icon pl-11 text-xs" />
                  <i class="fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                </div>
              </div>

              <!-- Password -->
              <div class="space-y-1.5">
                <label class="bank-label">Password</label>
                <div class="relative">
                  <input [(ngModel)]="password" name="password" required [type]="showPassword() ? 'text' : 'password'"
                         placeholder="••••••••"
                         class="bank-input bank-input-with-icon bank-input-with-icon-right pl-11 pr-11 text-xs" />
                  <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                  <button type="button" (click)="showPassword.set(!showPassword())" 
                          class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer">
                    <i class="fa-solid" [ngClass]="showPassword() ? 'fa-eye-slash' : 'fa-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Options Row -->
              <div class="flex items-center justify-between text-xs pt-1">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" class="rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer" />
                  <span class="text-xs text-slate-600">Remember me</span>
                </label>
                <button type="button" (click)="openForgotModal()" class="text-amber-600 hover:underline text-xs font-semibold cursor-pointer">
                  Forgot Password?
                </button>
              </div>

              <!-- Submit Button -->
              <button type="submit" [disabled]="loading() || !username || !password" 
                      class="bank-btn-primary w-full py-3 text-xs font-bold rounded-xl cursor-pointer shadow-xs">
                <i *ngIf="loading()" class="fa-solid fa-circle-notch fa-spin mr-1"></i>
                <span *ngIf="!loading()">Secure Login <i class="fa-solid fa-arrow-right ml-1"></i></span>
              </button>
            </form>

            <!-- Register Callout Link -->
            <div class="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Don't have a Godavari Bank account? 
              <a routerLink="/auth/register" class="text-amber-600 font-bold hover:underline ml-1">Open Bank Account</a>
            </div>

          </div>

        </div>
      </main>

      <!-- Forgot Password Modal -->
      <div *ngIf="showForgotModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="max-w-md w-full rounded-2xl bg-white border border-slate-200 p-6 md:p-8 space-y-4 shadow-2xl">
          
          <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">Reset Password</h3>
            <button type="button" (click)="closeForgotModal()" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="onForgotSubmit()" class="space-y-3 text-left text-xs">
            <div>
              <label class="bank-label">Username / Account / Mobile *</label>
              <div class="relative">
                <input [(ngModel)]="forgotForm.identifier" name="fIdent" required type="text" 
                       placeholder="e.g. customer1 or 9876543210"
                       class="bank-input bank-input-with-icon pl-11 text-xs" />
                <i class="fa-solid fa-id-card absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label class="bank-label">Security PIN (Default: 1234)</label>
              <div class="relative">
                <input [(ngModel)]="forgotForm.verificationKey" name="fKey" type="text" 
                       placeholder="e.g. 1234"
                       class="bank-input bank-input-with-icon pl-11 text-xs" />
                <i class="fa-solid fa-shield-halved absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label class="bank-label">New Password * (Min 6 chars)</label>
              <div class="relative">
                <input [(ngModel)]="forgotForm.newPassword" name="fNewPass" required type="password" 
                       placeholder="Enter new password"
                       class="bank-input bank-input-with-icon pl-11 text-xs" />
                <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label class="bank-label">Confirm New Password *</label>
              <div class="relative">
                <input [(ngModel)]="forgotForm.confirmPassword" name="fConfPass" required type="password" 
                       placeholder="Confirm new password"
                       class="bank-input bank-input-with-icon pl-11 text-xs" />
                <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>

            <div class="flex gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" (click)="closeForgotModal()" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button type="submit" [disabled]="forgotLoading() || !forgotForm.identifier || !forgotForm.newPassword || !forgotForm.confirmPassword" 
                      class="bank-btn-primary flex-1 py-2 text-xs font-bold">
                <i *ngIf="forgotLoading()" class="fa-solid fa-circle-notch fa-spin mr-1"></i>
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <footer class="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 Godavari Bank Online Management System. 256-Bit Encrypted.
      </footer>
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
