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
    <div class="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      
      <!-- Dark Top Bar (Matching Reference Header) -->
      <header class="h-16 bg-[#111827] border-b border-slate-800 px-4 md:px-8 flex items-center justify-between shadow-xs">
        <a routerLink="/" class="flex items-center gap-2.5 no-underline">
          <div class="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-bold shadow-xs">
            <i class="fa-solid fa-building-columns"></i>
          </div>
          <span class="text-base font-extrabold text-white tracking-tight font-display">Godavari Bank</span>
        </a>

        <div class="flex items-center gap-2">
          <a routerLink="/auth/login" class="text-xs text-slate-300 hover:text-white font-medium px-3 py-1.5 rounded-full hover:bg-slate-800 transition-colors">
            Already have an account? <strong class="text-amber-400 ml-1">Sign In</strong>
          </a>
        </div>
      </header>

      <!-- Main Registration Container -->
      <main class="flex-1 flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in max-w-2xl mx-auto w-full">
        
        <!-- Hero Header with Banner Pill -->
        <div class="text-center mb-5 space-y-2">
          <div class="banner-pill">
            <i class="fa-solid fa-user-plus"></i> Instant Online Account Opening
          </div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
            Open Your Bank Account
          </h1>
          <p class="text-xs md:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Paperless digital onboarding with instant account generation, debit card issuance, and 4-digit PIN setup.
          </p>
        </div>

        <div class="w-full bank-card p-6 md:p-8 space-y-5">
          
          <!-- Header Actions -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="text-xs font-bold text-slate-800">
              Step {{ step() }} of 4: 
              <span class="text-amber-600">
                {{ step() === 1 ? 'Personal Profile' : step() === 2 ? 'Identity & Address' : step() === 3 ? 'Account Type' : 'PIN & Deposit' }}
              </span>
            </div>
            <button type="button" (click)="fillDemoData()" class="px-3 py-1 rounded-full bg-slate-50 hover:bg-amber-50 hover:border-amber-400 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer shadow-2xs transition-all flex items-center gap-1">
              <i class="fa-solid fa-wand-magic-sparkles text-amber-500"></i> Auto-Fill Demo
            </button>
          </div>

          <!-- Step Progress Tracker -->
          <div class="grid grid-cols-4 gap-2 text-center text-xs">
            <div *ngFor="let s of [1,2,3,4]; let i = index" class="flex flex-col items-center gap-1">
              <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all"
                   [ngClass]="step() > s ? 'bg-emerald-600 text-white' : step() === s ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-400 border border-slate-200'">
                <i *ngIf="step() > s" class="fa-solid fa-check text-[10px]"></i>
                <span *ngIf="step() <= s">{{ s }}</span>
              </div>
              <span class="text-[10px] font-semibold" [ngClass]="step() >= s ? 'text-slate-900' : 'text-slate-400'">
                {{ i === 0 ? 'Personal' : i === 1 ? 'KYC' : i === 2 ? 'Account' : 'PIN' }}
              </span>
            </div>
          </div>

          <!-- Form Body -->
          <form (ngSubmit)="onSubmit()">
            
            <!-- STEP 1: Personal Info -->
            <div *ngIf="step() === 1" class="space-y-3.5 animate-fade-in text-xs">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="bank-label">First Name *</label>
                  <input [(ngModel)]="form.firstName" name="firstName" required type="text" class="bank-input text-xs" placeholder="e.g. Ramesh" />
                </div>
                <div>
                  <label class="bank-label">Last Name *</label>
                  <input [(ngModel)]="form.lastName" name="lastName" required type="text" class="bank-input text-xs" placeholder="e.g. Patel" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="bank-label">Gender *</label>
                  <select [(ngModel)]="form.gender" name="gender" class="bank-input text-xs">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label class="bank-label">Date of Birth *</label>
                  <input [(ngModel)]="form.dateOfBirth" name="dateOfBirth" required type="date" class="bank-input text-xs" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="bank-label">Email Address *</label>
                  <input [(ngModel)]="form.email" name="email" required type="email" class="bank-input text-xs" placeholder="ramesh@example.com" />
                </div>
                <div>
                  <label class="bank-label">Mobile Number *</label>
                  <input [(ngModel)]="form.mobile" name="mobile" required maxlength="10" type="text" class="bank-input text-xs" placeholder="10-digit mobile" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="bank-label">Username *</label>
                  <input [(ngModel)]="form.username" name="username" required type="text" class="bank-input text-xs" placeholder="ramesh_sbi" />
                </div>
                <div>
                  <label class="bank-label">Password *</label>
                  <input [(ngModel)]="form.password" name="password" required type="password" class="bank-input text-xs" placeholder="Min 6 characters" />
                </div>
              </div>

              <div class="flex justify-end pt-3 border-t border-slate-100">
                <button type="button" (click)="nextStep()" 
                        [disabled]="!form.firstName || !form.lastName || !form.email || !form.mobile || !form.username || !form.password"
                        class="bank-btn-primary px-6 text-xs font-bold">
                  Next: KYC Info <i class="fa-solid fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>

            <!-- STEP 2: KYC & Address -->
            <div *ngIf="step() === 2" class="space-y-3.5 animate-fade-in text-xs">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="bank-label">PAN Number *</label>
                  <input [(ngModel)]="form.panNumber" name="panNumber" required maxlength="10" type="text" class="bank-input uppercase text-xs" placeholder="ABCDE1234F" />
                </div>
                <div>
                  <label class="bank-label">Aadhaar Number *</label>
                  <input [(ngModel)]="form.aadhaarNumber" name="aadhaarNumber" required maxlength="12" type="text" class="bank-input text-xs" placeholder="12-digit Aadhaar" />
                </div>
              </div>

              <div>
                <label class="bank-label">Residential Address *</label>
                <textarea [(ngModel)]="form.address" name="address" rows="2" required class="bank-input text-xs" placeholder="Street, Area, Landmark"></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label class="bank-label">City *</label>
                  <input [(ngModel)]="form.city" name="city" required type="text" class="bank-input text-xs" placeholder="Mumbai" />
                </div>
                <div>
                  <label class="bank-label">State *</label>
                  <input [(ngModel)]="form.state" name="state" required type="text" class="bank-input text-xs" placeholder="Maharashtra" />
                </div>
                <div>
                  <label class="bank-label">Pincode *</label>
                  <input [(ngModel)]="form.pincode" name="pincode" required maxlength="6" type="text" class="bank-input text-xs" placeholder="400001" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="bank-label">Occupation</label>
                  <input [(ngModel)]="form.occupation" name="occupation" required type="text" class="bank-input text-xs" placeholder="e.g. Salaried" />
                </div>
                <div>
                  <label class="bank-label">Annual Income (₹)</label>
                  <input [(ngModel)]="form.annualIncome" name="annualIncome" required type="number" class="bank-input text-xs" placeholder="850000" />
                </div>
              </div>

              <div class="flex justify-between pt-3 border-t border-slate-100">
                <button type="button" (click)="prevStep()" class="bank-btn-secondary text-xs">
                  <i class="fa-solid fa-arrow-left mr-1"></i> Back
                </button>
                <button type="button" (click)="nextStep()" 
                        [disabled]="!form.panNumber || !form.aadhaarNumber || !form.address || !form.city || !form.pincode"
                        class="bank-btn-primary px-6 text-xs font-bold">
                  Next: Account Setup <i class="fa-solid fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>

            <!-- STEP 3: Account Options & Nominee -->
            <div *ngIf="step() === 3" class="space-y-3.5 animate-fade-in text-xs">
              <div>
                <label class="bank-label">Select Account Type *</label>
                <div class="grid grid-cols-3 gap-2.5">
                  <div (click)="setAccountType('SAVINGS')" 
                       class="p-3 rounded-xl border cursor-pointer transition-all text-center"
                       [ngClass]="form.accountType === 'SAVINGS' ? 'bg-amber-50/70 border-amber-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'">
                    <div class="font-bold text-xs mb-0.5" [ngClass]="form.accountType === 'SAVINGS' ? 'text-amber-950' : 'text-slate-800'">Savings</div>
                    <div class="text-[10px] text-slate-500">Min ₹3,000</div>
                  </div>

                  <div (click)="setAccountType('CURRENT')" 
                       class="p-3 rounded-xl border cursor-pointer transition-all text-center"
                       [ngClass]="form.accountType === 'CURRENT' ? 'bg-amber-50/70 border-amber-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'">
                    <div class="font-bold text-xs mb-0.5" [ngClass]="form.accountType === 'CURRENT' ? 'text-amber-950' : 'text-slate-800'">Current</div>
                    <div class="text-[10px] text-slate-500">Min ₹10,000</div>
                  </div>

                  <div (click)="setAccountType('SALARY')" 
                       class="p-3 rounded-xl border cursor-pointer transition-all text-center"
                       [ngClass]="form.accountType === 'SALARY' ? 'bg-amber-50/70 border-amber-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'">
                    <div class="font-bold text-xs mb-0.5" [ngClass]="form.accountType === 'SALARY' ? 'text-amber-950' : 'text-slate-800'">Salary</div>
                    <div class="text-[10px] text-slate-500">Zero Balance</div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div>
                  <label class="bank-label">Nominee Name (Optional)</label>
                  <input [(ngModel)]="form.nomineeName" name="nomineeName" type="text" class="bank-input text-xs" placeholder="e.g. Priya Patel" />
                </div>
                <div>
                  <label class="bank-label">Nominee Relationship</label>
                  <input [(ngModel)]="form.nomineeRelation" name="nomineeRelation" type="text" class="bank-input text-xs" placeholder="e.g. Spouse" />
                </div>
              </div>

              <div class="flex justify-between pt-3 border-t border-slate-100">
                <button type="button" (click)="prevStep()" class="bank-btn-secondary text-xs">
                  <i class="fa-solid fa-arrow-left mr-1"></i> Back
                </button>
                <button type="button" (click)="nextStep()" class="bank-btn-primary px-6 text-xs font-bold">
                  Next: Security PIN <i class="fa-solid fa-arrow-right ml-1"></i>
                </button>
              </div>
            </div>

            <!-- STEP 4: Initial Deposit & 4-Digit PIN -->
            <div *ngIf="step() === 4" class="space-y-4 animate-fade-in text-xs">
              <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div class="text-xs font-bold text-slate-900">Initial Opening Deposit</div>
                  <div class="text-[10px] text-slate-500">Credited to your new account balance</div>
                </div>
                <div class="w-36">
                  <input [(ngModel)]="form.initialDeposit" name="initialDeposit" type="number" min="500" class="bank-input text-right font-bold text-emerald-600 text-xs" />
                </div>
              </div>

              <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <div>
                  <h4 class="text-sm font-bold text-slate-900 font-serif">Set 4-Digit Transaction PIN</h4>
                  <p class="text-[10px] text-slate-500">Used for authorizing fund transfers & debit transactions</p>
                </div>
                
                <div class="max-w-[180px] mx-auto">
                  <input [(ngModel)]="form.transactionPin" name="transactionPin" maxlength="4" type="password" 
                         placeholder="••••"
                         class="bank-input text-center text-xl tracking-[0.4em] font-bold" />
                </div>

                <!-- Quick PIN Pad Buttons -->
                <div class="grid grid-cols-3 gap-1.5 max-w-[180px] mx-auto">
                  <button *ngFor="let num of [1,2,3,4,5,6,7,8,9]" type="button" 
                          (click)="appendPin(num)"
                          class="p-2 rounded-lg bg-white hover:bg-amber-50 text-slate-800 font-bold text-xs border border-slate-200 transition-all cursor-pointer shadow-2xs">
                    {{ num }}
                  </button>
                  <button type="button" (click)="clearPin()" class="p-2 rounded-lg bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-slate-200 cursor-pointer shadow-2xs">
                    C
                  </button>
                  <button type="button" (click)="appendPin(0)" class="p-2 rounded-lg bg-white hover:bg-amber-50 text-slate-800 font-bold text-xs border border-slate-200 cursor-pointer shadow-2xs">
                    0
                  </button>
                  <button type="button" (click)="backspacePin()" class="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200 cursor-pointer shadow-2xs">
                    ⌫
                  </button>
                </div>
              </div>

              <div class="flex justify-between pt-3 border-t border-slate-100">
                <button type="button" (click)="prevStep()" class="bank-btn-secondary text-xs">
                  <i class="fa-solid fa-arrow-left mr-1"></i> Back
                </button>
                <button type="submit" [disabled]="loading() || !form.transactionPin || form.transactionPin.length !== 4" 
                        class="bank-btn-primary px-8 text-xs font-bold">
                  <i *ngIf="loading()" class="fa-solid fa-circle-notch fa-spin mr-1"></i>
                  <span *ngIf="!loading()">Open Account →</span>
                </button>
              </div>
            </div>

          </form>

        </div>
      </main>

      <footer class="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Godavari Bank Online Management System. 256-Bit Encrypted.
      </footer>
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
