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
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
          <i class="fa-solid fa-user-gear text-slate-400"></i> Profile & Security Settings
        </h1>
        <p class="text-xs text-slate-400">Manage your verified KYC profile, change transaction PIN, and update login password</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <!-- Left: KYC Profile Summary Card (1 Col) -->
        <div class="bank-glass p-6 rounded-3xl space-y-4">
          <div class="text-center pb-4 border-b border-white/10">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-3 shadow-lg">
              {{ getInitials() }}
            </div>
            <h3 class="text-base font-bold text-white">{{ profile()?.fullName }}</h3>
            <p class="text-xs text-sky-400 font-mono">{{ profile()?.customerId || profile()?.employeeId }}</p>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <span class="text-slate-500 block text-[10px] uppercase">Email</span>
              <span class="text-slate-200 font-medium">{{ profile()?.email }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[10px] uppercase">Mobile</span>
              <span class="text-slate-200 font-mono">+91 {{ profile()?.mobile }}</span>
            </div>
            <div *ngIf="profile()?.panNumber">
              <span class="text-slate-500 block text-[10px] uppercase">PAN Number</span>
              <span class="text-slate-200 font-mono">{{ profile()?.panNumber }}</span>
            </div>
            <div *ngIf="profile()?.maskedAadhaar">
              <span class="text-slate-500 block text-[10px] uppercase">Aadhaar</span>
              <span class="text-slate-200 font-mono">{{ profile()?.maskedAadhaar }}</span>
            </div>
            <div *ngIf="profile()?.nomineeName">
              <span class="text-slate-500 block text-[10px] uppercase">Nominee</span>
              <span class="text-slate-200">{{ profile()?.nomineeName }} ({{ profile()?.nomineeRelation }})</span>
            </div>
          </div>
        </div>

        <!-- Right: Security Forms (2 Cols) -->
        <div class="md:col-span-2 space-y-6">
          
          <!-- Set / Change Transaction PIN -->
          <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-shield-keyhole text-sky-400"></i>
              <h3 class="text-base font-bold text-white">Update 4-Digit Transaction PIN</h3>
            </div>
            <p class="text-xs text-slate-400">Change your financial authorization PIN used for transfers, withdrawals, and VAS payments.</p>

            <form (ngSubmit)="submitPinChange()" class="space-y-4 pt-2">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="bank-label">New 4-Digit PIN *</label>
                  <input [(ngModel)]="newPin" name="nPin" required maxlength="4" type="password" placeholder="••••" class="bank-input text-center text-lg font-bold" />
                </div>
                <div>
                  <label class="bank-label">Confirm New PIN *</label>
                  <input [(ngModel)]="confirmPin" name="cPin" required maxlength="4" type="password" placeholder="••••" class="bank-input text-center text-lg font-bold" />
                </div>
              </div>

              <button type="submit" [disabled]="!newPin || newPin.length !== 4 || newPin !== confirmPin" class="bank-btn-primary text-xs">
                Update Transaction PIN
              </button>
            </form>
          </div>

          <!-- Change Login Password -->
          <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-lock text-indigo-400"></i>
              <h3 class="text-base font-bold text-white">Change Login Password</h3>
            </div>

            <form (ngSubmit)="submitPasswordChange()" class="space-y-4 pt-2">
              <div>
                <label class="bank-label">Current Password *</label>
                <input [(ngModel)]="currentPassword" name="currPwd" required type="password" placeholder="••••••••••••" class="bank-input" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="bank-label">New Password *</label>
                  <input [(ngModel)]="newPassword" name="nPwd" required type="password" placeholder="Min 8 characters" class="bank-input" />
                </div>
                <div>
                  <label class="bank-label">Confirm New Password *</label>
                  <input [(ngModel)]="confirmPassword" name="cPwd" required type="password" placeholder="Min 8 characters" class="bank-input" />
                </div>
              </div>

              <button type="submit" [disabled]="!currentPassword || !newPassword || newPassword !== confirmPassword" class="bank-btn-secondary text-xs">
                Change Password
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
