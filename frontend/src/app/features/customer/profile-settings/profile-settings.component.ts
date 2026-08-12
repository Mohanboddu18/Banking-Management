import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserProfile } from '../../../core/models/models';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-user-shield"></i> Verified Identity & Account Credentials
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Profile & Security Settings
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Manage your verified KYC profile, update your 4-digit transaction authorization PIN, and modify security credentials.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        <!-- Left: KYC Profile Summary Card (1 Col) -->
        <div class="bank-card p-6 rounded-2xl space-y-5 shadow-2xs">
          <div class="text-center pb-4 border-b border-slate-100">
            <div class="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 text-2xl font-extrabold flex items-center justify-center mx-auto mb-3 shadow-xs">
              {{ getInitials() }}
            </div>
            <h3 class="text-base font-bold text-slate-900 font-serif">{{ profile()?.fullName }}</h3>
            <p class="text-xs text-amber-700 font-mono font-bold">{{ profile()?.customerId || profile()?.employeeId }}</p>
            <div class="mt-2">
              <span class="pill-green text-[9px] py-0.5 px-2.5"><i class="fa-solid fa-circle-check mr-1"></i> KYC VERIFIED</span>
            </div>
          </div>

          <div class="space-y-3.5 text-xs">
            <div>
              <span class="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Email Address</span>
              <span class="text-slate-900 font-semibold">{{ profile()?.email }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Mobile Number</span>
              <span class="text-slate-900 font-mono font-bold">+91 {{ profile()?.mobile }}</span>
            </div>
            <div *ngIf="profile()?.panNumber">
              <span class="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">PAN Card</span>
              <span class="text-slate-900 font-mono font-bold">{{ profile()?.panNumber }}</span>
            </div>
            <div *ngIf="profile()?.maskedAadhaar">
              <span class="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Aadhaar UID</span>
              <span class="text-slate-900 font-mono font-bold">{{ profile()?.maskedAadhaar }}</span>
            </div>
            <div *ngIf="profile()?.nomineeName">
              <span class="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Registered Nominee</span>
              <span class="text-slate-900 font-semibold">{{ profile()?.nomineeName }} ({{ profile()?.nomineeRelation }})</span>
            </div>
          </div>
        </div>

        <!-- Right: Security Forms (2 Cols) -->
        <div class="md:col-span-2 space-y-6">
          
          <!-- Set / Change Transaction PIN -->
          <div class="bank-card p-6 md:p-7 rounded-2xl space-y-4 shadow-2xs">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
              <i class="fa-solid fa-shield-keyhole text-amber-500 text-lg"></i>
              <h3 class="text-base font-bold text-slate-900 font-serif">Update 4-Digit Transaction PIN</h3>
            </div>
            <p class="text-xs text-slate-600">Change the authorization PIN required for fund transfers, withdrawals, deposits, and VAS payments.</p>

            <form (ngSubmit)="submitPinChange()" class="space-y-4 pt-1">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="bank-label">New 4-Digit PIN *</label>
                  <input [(ngModel)]="newPin" name="nPin" required maxlength="4" type="password" placeholder="••••" class="bank-input text-center text-lg font-extrabold tracking-widest" />
                </div>
                <div>
                  <label class="bank-label">Confirm New PIN *</label>
                  <input [(ngModel)]="confirmPin" name="cPin" required maxlength="4" type="password" placeholder="••••" class="bank-input text-center text-lg font-extrabold tracking-widest" />
                </div>
              </div>

              <button type="submit" [disabled]="!newPin || newPin.length !== 4 || newPin !== confirmPin" class="bank-btn-primary text-xs py-2 px-5 font-bold">
                Update Transaction PIN →
              </button>
            </form>
          </div>

          <!-- Change Login Password -->
          <div class="bank-card p-6 md:p-7 rounded-2xl space-y-4 shadow-2xs">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
              <i class="fa-solid fa-lock text-amber-500 text-lg"></i>
              <h3 class="text-base font-bold text-slate-900 font-serif">Change Login Password</h3>
            </div>
            <p class="text-xs text-slate-600">Ensure your account uses a strong password with letters, numbers, and special symbols.</p>

            <form (ngSubmit)="submitPasswordChange()" class="space-y-4 pt-1">
              <div>
                <label class="bank-label">Current Password *</label>
                <input [(ngModel)]="currentPassword" name="currPwd" required type="password" placeholder="••••••••••••" class="bank-input text-xs" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="bank-label">New Password *</label>
                  <input [(ngModel)]="newPassword" name="nPwd" required type="password" placeholder="Min 8 characters" class="bank-input text-xs" />
                </div>
                <div>
                  <label class="bank-label">Confirm New Password *</label>
                  <input [(ngModel)]="confirmPassword" name="cPwd" required type="password" placeholder="Min 8 characters" class="bank-input text-xs" />
                </div>
              </div>

              <button type="submit" [disabled]="!currentPassword || !newPassword || newPassword !== confirmPassword" class="bank-btn-secondary text-xs py-2 px-5 font-bold">
                Update Login Password →
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  `
})
export class ProfileSettingsComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  profile = signal<UserProfile | null>(null);

  newPin = '';
  confirmPin = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  ngOnInit() {
    this.authService.getCurrentUserProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) this.profile.set(res.data);
      }
    });
  }

  getInitials(): string {
    const name = this.profile()?.fullName || 'User';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  submitPinChange() {
    if (this.newPin !== this.confirmPin) return;
    this.authService.setOrChangePin({
      newPin: this.newPin,
      confirmPin: this.confirmPin
    }).subscribe({
      next: () => {
        this.toastService.success('Transaction PIN updated successfully!');
        this.newPin = '';
        this.confirmPin = '';
      }
    });
  }

  submitPasswordChange() {
    if (this.newPassword !== this.confirmPassword) return;
    this.authService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.toastService.success('Login password updated successfully!');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      }
    });
  }
}
