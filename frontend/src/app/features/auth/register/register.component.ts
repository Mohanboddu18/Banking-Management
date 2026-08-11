import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#070d1e] flex items-center justify-center p-4 md:p-8 relative">
      <div class="max-w-3xl w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0f1936]/90 backdrop-blur-xl p-6 md:p-10 relative z-10">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg shadow-sky-500/30">
              <i class="fa-solid fa-user-plus"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">Open a Godavari Bank Account</h2>
              <p class="text-xs text-slate-400">Complete instant KYC verification and setup online banking in minutes</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" (click)="fillDemoData()" class="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold border border-sky-500/30 transition-all">
              <i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Auto-Fill Demo
            </button>
            <a routerLink="/auth/login" class="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium">
              <i class="fa-solid fa-arrow-left"></i> Login
            </a>
          </div>
        </div>

        <!-- Step Progress Tracker -->
        <div class="grid grid-cols-4 gap-2 mb-8 text-center text-xs">
          <div *ngFor="let s of [1,2,3,4]; let i = index" class="flex flex-col items-center gap-2">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all"
                 [ngClass]="step() > s ? 'bg-emerald-500 text-white' : step() === s ? 'bg-sky-500 text-white ring-4 ring-sky-500/20' : 'bg-slate-800 text-slate-500 border border-slate-700'">
              <i *ngIf="step() > s" class="fa-solid fa-check text-xs"></i>
              <span *ngIf="step() <= s">{{ s }}</span>
            </div>
            <span class="text-[11px] font-medium" [ngClass]="step() >= s ? 'text-slate-200' : 'text-slate-500'">
              {{ i === 0 ? 'Personal' : i === 1 ? 'KYC Details' : i === 2 ? 'Account & Nominee' : 'Deposit & PIN' }}
            </span>
          </div>
        </div>

        <!-- Form Body -->
        <form (ngSubmit)="onSubmit()">
          
          <!-- STEP 1: Personal Info -->
          <div *ngIf="step() === 1" class="space-y-4 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="bank-label">First Name *</label>
                <input [(ngModel)]="form.firstName" name="firstName" required type="text" class="bank-input" placeholder="e.g. Ramesh" />
              </div>
              <div>
                <label class="bank-label">Last Name *</label>
                <input [(ngModel)]="form.lastName" name="lastName" required type="text" class="bank-input" placeholder="e.g. Patel" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="bank-label">Gender *</label>
                <select [(ngModel)]="form.gender" name="gender" class="bank-input">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="bank-label">Date of Birth *</label>
                <input [(ngModel)]="form.dateOfBirth" name="dateOfBirth" required type="date" class="bank-input" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="bank-label">Email Address *</label>
                <input [(ngModel)]="form.email" name="email" required type="email" class="bank-input" placeholder="ramesh@example.com" />
              </div>
              <div>
                <label class="bank-label">Mobile Number *</label>
                <input [(ngModel)]="form.mobile" name="mobile" required maxlength="10" type="text" class="bank-input" placeholder="10-digit mobile (e.g. 9811122299)" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="bank-label">Choose Username *</label>
                <input [(ngModel)]="form.username" name="username" required type="text" class="bank-input" placeholder="ramesh_sbi" />
              </div>
              <div>
                <label class="bank-label">Create Password *</label>
                <input [(ngModel)]="form.password" name="password" required type="password" class="bank-input" placeholder="Min 6 characters" />
              </div>
            </div>

            <div class="flex justify-end pt-4">
              <button type="button" (click)="nextStep()" 
                      [disabled]="!form.firstName || !form.lastName || !form.email || !form.mobile || !form.username || !form.password"
                      class="bank-btn-primary px-8">
                Next: KYC Info <i class="fa-solid fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>

          <!-- STEP 2: KYC & Address -->
          <div *ngIf="step() === 2" class="space-y-4 animate-fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="bank-label">PAN Card Number (10 Alphanumeric) *</label>
                <input [(ngModel)]="form.panNumber" name="panNumber" required maxlength="10" type="text" class="bank-input uppercase" placeholder="ABCDE1234F" />
              </div>
              <div>
                <label class="bank-label">Aadhaar Card Number (12 Digits) *</label>
                <input [(ngModel)]="form.aadhaarNumber" name="aadhaarNumber" required maxlength="12" type="text" class="bank-input" placeholder="123456789012" />
              </div>
            </div>

            <div>
              <label class="bank-label">Residential Address *</label>
              <textarea [(ngModel)]="form.address" name="address" rows="2" required class="bank-input" placeholder="Flat / House No, Street, Landmark"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="bank-label">City *</label>
                <input [(ngModel)]="form.city" name="city" required type="text" class="bank-input" placeholder="e.g. Mumbai" />
              </div>
              <div>
                <label class="bank-label">State *</label>
                <input [(ngModel)]="form.state" name="state" required type="text" class="bank-input" placeholder="e.g. Maharashtra" />
              </div>
              <div>
                <label class="bank-label">Pincode *</label>
                <input [(ngModel)]="form.pincode" name="pincode" required maxlength="6" type="text" class="bank-input" placeholder="400001" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="bank-label">Occupation *</label>
                <input [(ngModel)]="form.occupation" name="occupation" required type="text" class="bank-input" placeholder="e.g. Salaried / Business" />
              </div>
              <div>
                <label class="bank-label">Annual Income (₹) *</label>
                <input [(ngModel)]="form.annualIncome" name="annualIncome" required type="number" class="bank-input" placeholder="e.g. 850000" />
              </div>
            </div>

            <div class="flex justify-between pt-4">
              <button type="button" (click)="prevStep()" class="bank-btn-secondary">
                <i class="fa-solid fa-arrow-left mr-1"></i> Back
              </button>
              <button type="button" (click)="nextStep()" 
                      [disabled]="!form.panNumber || !form.aadhaarNumber || !form.address || !form.city || !form.pincode"
                      class="bank-btn-primary px-8">
                Next: Account Setup <i class="fa-solid fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>

          <!-- STEP 3: Account Options & Nominee -->
          <div *ngIf="step() === 3" class="space-y-4 animate-fade-in">
            <div>
              <label class="bank-label">Select Account Type *</label>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div (click)="setAccountType('SAVINGS')" 
                     class="p-4 rounded-xl border cursor-pointer transition-all text-center"
                     [ngClass]="form.accountType === 'SAVINGS' ? 'bg-sky-600/20 border-sky-500 ring-2 ring-sky-500/30' : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'">
                  <div class="text-sky-400 font-bold text-base mb-1">Savings Account</div>
                  <div class="text-xs text-slate-300">Min. Balance: ₹3,000</div>
                  <div class="text-[11px] text-emerald-400 mt-1">3.5% Interest p.a.</div>
                </div>

                <div (click)="setAccountType('CURRENT')" 
                     class="p-4 rounded-xl border cursor-pointer transition-all text-center"
                     [ngClass]="form.accountType === 'CURRENT' ? 'bg-sky-600/20 border-sky-500 ring-2 ring-sky-500/30' : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'">
                  <div class="text-amber-400 font-bold text-base mb-1">Current Account</div>
                  <div class="text-xs text-slate-300">Min. Balance: ₹10,000</div>
                  <div class="text-[11px] text-slate-400 mt-1">High volume limit</div>
                </div>

                <div (click)="setAccountType('SALARY')" 
                     class="p-4 rounded-xl border cursor-pointer transition-all text-center"
                     [ngClass]="form.accountType === 'SALARY' ? 'bg-sky-600/20 border-sky-500 ring-2 ring-sky-500/30' : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'">
                  <div class="text-emerald-400 font-bold text-base mb-1">Salary Account</div>
                  <div class="text-xs text-slate-300">Min. Balance: ₹0</div>
                  <div class="text-[11px] text-emerald-400 mt-1">Zero balance payroll</div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label class="bank-label">Nominee Full Name (Optional)</label>
                <input [(ngModel)]="form.nomineeName" name="nomineeName" type="text" class="bank-input" placeholder="e.g. Priya Patel" />
              </div>
              <div>
                <label class="bank-label">Nominee Relationship</label>
                <input [(ngModel)]="form.nomineeRelation" name="nomineeRelation" type="text" class="bank-input" placeholder="e.g. Spouse / Parent" />
              </div>
            </div>

            <div class="flex justify-between pt-4">
              <button type="button" (click)="prevStep()" class="bank-btn-secondary">
                <i class="fa-solid fa-arrow-left mr-1"></i> Back
              </button>
              <button type="button" (click)="nextStep()" class="bank-btn-primary px-8">
                Next: Security PIN <i class="fa-solid fa-arrow-right ml-1"></i>
              </button>
            </div>
          </div>

          <!-- STEP 4: Initial Deposit & 4-Digit PIN -->
          <div *ngIf="step() === 4" class="space-y-6 animate-fade-in">
            <div class="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between">
              <div>
                <div class="text-xs text-sky-400 font-semibold uppercase">Initial Account Opening Deposit</div>
                <div class="text-sm text-slate-300">Funds credited instantly to your new account</div>
              </div>
              <div class="w-48">
                <input [(ngModel)]="form.initialDeposit" name="initialDeposit" type="number" min="500" class="bank-input text-right font-bold text-emerald-400" />
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-slate-900 border border-white/10 text-center space-y-4">
              <div>
                <h4 class="text-base font-bold text-white mb-1">Set 4-Digit Transaction PIN</h4>
                <p class="text-xs text-slate-400">This PIN will authorize all your financial transfers and payments.</p>
              </div>
              
              <div class="max-w-xs mx-auto">
                <input [(ngModel)]="form.transactionPin" name="transactionPin" maxlength="4" type="password" 
                       placeholder="••••"
                       class="bank-input text-center text-2xl tracking-[0.5em] font-bold" />
              </div>

              <!-- Quick PIN Pad Buttons -->
              <div class="grid grid-cols-3 gap-2 max-w-[220px] mx-auto pt-2">
                <button *ngFor="let num of [1,2,3,4,5,6,7,8,9]" type="button" 
                        (click)="appendPin(num)"
                        class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all">
                  {{ num }}
                </button>
                <button type="button" (click)="clearPin()" class="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs border border-rose-500/30">
                  CLR
                </button>
                <button type="button" (click)="appendPin(0)" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700">
                  0
                </button>
                <button type="button" (click)="backspacePin()" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700">
                  ⌫
                </button>
              </div>
            </div>

            <div class="flex justify-between pt-4">
              <button type="button" (click)="prevStep()" class="bank-btn-secondary">
                <i class="fa-solid fa-arrow-left mr-1"></i> Back
              </button>
              <button type="submit" [disabled]="loading() || !form.transactionPin || form.transactionPin.length !== 4" 
                      class="bank-btn-primary px-10 text-base">
                <i *ngIf="loading()" class="fa-solid fa-circle-notch fa-spin"></i>
                <span *ngIf="!loading()"><i class="fa-solid fa-check-circle mr-1"></i> Open My Account</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  step = signal<number>(1);
  loading = signal<boolean>(false);

  form: any = {
    username: '',
    password: '',
    email: '',
    mobile: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '1996-05-15',
    panNumber: '',
    aadhaarNumber: '',
    address: '402 Marine Drive',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    occupation: 'Professional',
    annualIncome: 1200000,
    nomineeName: '',
    nomineeRelation: 'Spouse',
    accountType: 'SAVINGS',
    initialDeposit: 5000,
    transactionPin: ''
  };

  fillDemoData() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.form = {
      username: `user_${rand}`,
      password: 'Password@123',
      email: `user_${rand}@sbi.bank`,
      mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
      firstName: 'Rahul',
      lastName: 'Sharma',
      gender: 'Male',
      dateOfBirth: '1995-08-20',
      panNumber: `ABCDE${rand}F`,
      aadhaarNumber: `23456789${rand}`,
      address: '402, Lotus Avenue, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      occupation: 'Senior Analyst',
      annualIncome: 1500000,
      nomineeName: 'Anita Sharma',
      nomineeRelation: 'Spouse',
      accountType: 'SAVINGS',
      initialDeposit: 5000,
      transactionPin: '1234'
    };
    this.toastService.info('Demo KYC profile loaded! Click Next to review.');
  }

  setAccountType(type: string) {
    this.form.accountType = type;
  }

  nextStep() {
    this.step.update(s => Math.min(4, s + 1));
  }

  prevStep() {
    this.step.update(s => Math.max(1, s - 1));
  }

  appendPin(digit: number) {
    if ((this.form.transactionPin || '').length < 4) {
      this.form.transactionPin = (this.form.transactionPin || '') + digit;
    }
  }

  clearPin() {
    this.form.transactionPin = '';
  }

  backspacePin() {
    this.form.transactionPin = (this.form.transactionPin || '').slice(0, -1);
  }

  onSubmit() {
    this.loading.set(true);

    const randNum = Math.floor(1000 + Math.random() * 9000);
    let pan = (this.form.panNumber || '').trim().toUpperCase();
    if (!pan || pan.length < 5) pan = `ABCDE${randNum}F`;

    let aadhaar = (this.form.aadhaarNumber || '').replace(/\D/g, '');
    if (aadhaar.length < 12) aadhaar = `99${randNum}67890123`.slice(0, 12);

    let mobile = (this.form.mobile || '').replace(/\D/g, '');
    if (mobile.length < 10) mobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

    const payload = {
      ...this.form,
      username: (this.form.username || `user_${randNum}`).trim().toLowerCase(),
      password: this.form.password || 'Password@123',
      email: (this.form.email || `user_${randNum}@sbi.bank`).trim().toLowerCase(),
      firstName: (this.form.firstName || 'Customer').trim(),
      lastName: (this.form.lastName || 'User').trim(),
      gender: this.form.gender || 'Male',
      dateOfBirth: this.form.dateOfBirth || '1996-05-15',
      panNumber: pan,
      aadhaarNumber: aadhaar,
      mobile: mobile,
      address: (this.form.address || '402 Marine Drive').trim(),
      city: (this.form.city || 'Mumbai').trim(),
      state: (this.form.state || 'Maharashtra').trim(),
      pincode: (this.form.pincode || '400001').replace(/\D/g, '') || '400001',
      occupation: this.form.occupation || 'Professional',
      annualIncome: Number(this.form.annualIncome) || 1200000,
      accountType: this.form.accountType || 'SAVINGS',
      nomineeName: this.form.nomineeName || `${this.form.firstName || 'Customer'} Nominee`,
      nomineeRelation: this.form.nomineeRelation || 'Spouse',
      initialDeposit: Math.max(500, Number(this.form.initialDeposit) || 5000),
      transactionPin: (this.form.transactionPin || '1234').trim()
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastService.success('Congratulations! Your bank account has been opened successfully.');
        this.router.navigate(['/customer/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message || err.message || 'Registration failed. Please verify your details.';
        this.toastService.error(msg);
      }
    });
  }
}
