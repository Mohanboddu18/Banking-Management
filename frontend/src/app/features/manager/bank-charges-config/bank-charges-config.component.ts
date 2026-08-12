import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../../../core/services/manager.service';
import { ToastService } from '../../../core/services/toast.service';
import { BankChargeItem } from '../../../core/models/models';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

@Component({
  selector: 'app-bank-charges-config',
  standalone: true,
  imports: [CommonModule, FormsModule, InrCurrencyPipe],
  template: `
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in py-2">
      
      <!-- Top Banner Pill & Serif Header -->
      <div class="text-center space-y-2">
        <div class="banner-pill">
          <i class="fa-solid fa-sliders"></i> Fee Schedules & Automated Maintenance Surcharges
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
          Bank Charges & Tariff Config
        </h1>
        <p class="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Configure penalty rates, minimum balance thresholds, and execute scheduled batch maintenance deduction jobs.
        </p>
      </div>

      <!-- Action Sub-Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <h2 class="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
          <i class="fa-solid fa-file-invoice-dollar text-amber-500"></i> Active Charge Rules
        </h2>

        <button (click)="triggerScheduler()" [disabled]="triggering()" class="bank-btn-primary text-xs py-1.5 px-4 font-bold shadow-xs">
          <i *ngIf="triggering()" class="fa-solid fa-circle-notch fa-spin mr-1"></i>
          <i *ngIf="!triggering()" class="fa-solid fa-bolt mr-1"></i> Run Automated Deductions Now
        </button>
      </div>

      <!-- Bank Charges Table -->
      <div class="bank-card p-6 space-y-4">
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 font-serif">Fee Schedule Rules</h3>
          <span class="pill-dark text-[9px] py-0 px-2.5">{{ charges().length }} Active Rules</span>
        </div>

        <div class="overflow-x-auto">
          <table class="bank-table">
            <thead>
              <tr>
                <th>Charge Name</th>
                <th>Type</th>
                <th>Fee Amount</th>
                <th>Min. Threshold</th>
                <th>Frequency</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of charges()">
                <td class="font-bold text-slate-900 text-xs">{{ c.chargeName }}</td>
                <td>
                  <span class="badge badge-info text-[9px]">{{ c.chargeType }}</span>
                </td>
                <td class="font-mono text-xs font-extrabold text-amber-700">{{ c.amount | inrCurrency }}</td>
                <td class="font-mono text-xs font-bold text-slate-700">
                  {{ c.minBalanceThreshold ? (c.minBalanceThreshold | inrCurrency) : '—' }}
                </td>
                <td class="text-xs text-slate-500 font-semibold">{{ c.frequency }}</td>
                <td>
                  <span class="badge" [ngClass]="c.active ? 'badge-success' : 'badge-danger'">
                    {{ c.active ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td>
                  <button (click)="openEditModal(c)" class="bank-btn-secondary text-xs py-1 px-3 font-semibold">
                    <i class="fa-solid fa-pen mr-1 text-amber-600"></i> Edit Rule
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Charge Modal -->
      <div *ngIf="selectedCharge()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
        <div class="bank-card p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <div class="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900 font-serif">Edit Tariff Rule</h3>
            <button (click)="selectedCharge.set(null)" class="text-slate-400 hover:text-slate-700 cursor-pointer">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="saveCharge()" class="space-y-3 text-xs">
            <div>
              <label class="bank-label">Charge Name *</label>
              <input [(ngModel)]="selectedCharge()!.chargeName" name="name" required class="bank-input text-xs font-semibold" />
            </div>

            <div>
              <label class="bank-label">Amount (₹) *</label>
              <input [(ngModel)]="selectedCharge()!.amount" name="amt" required type="number" class="bank-input font-bold text-amber-700 text-xs" />
            </div>

            <div *ngIf="selectedCharge()!.minBalanceThreshold">
              <label class="bank-label">Minimum Balance Requirement (₹)</label>
              <input [(ngModel)]="selectedCharge()!.minBalanceThreshold" name="thresh" type="number" class="bank-input text-xs font-semibold" />
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input [(ngModel)]="selectedCharge()!.active" name="act" type="checkbox" id="activeCheckbox" class="rounded text-amber-600 focus:ring-amber-500" />
              <label for="activeCheckbox" class="text-xs text-slate-700 font-bold cursor-pointer">Enable Charge Rule</label>
            </div>

            <div class="flex gap-2.5 pt-2 border-t border-slate-100">
              <button type="button" (click)="selectedCharge.set(null)" class="bank-btn-secondary flex-1 py-2 text-xs">Cancel</button>
              <button type="submit" class="bank-btn-primary flex-1 py-2 text-xs font-bold">
                Save Rule →
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class BankChargesConfigComponent {
  private managerService = inject(ManagerService);
  private toastService = inject(ToastService);

  charges = signal<BankChargeItem[]>([]);
  selectedCharge = signal<BankChargeItem | null>(null);
  triggering = signal<boolean>(false);

  ngOnInit() {
    this.loadCharges();
  }

  loadCharges() {
    this.managerService.getBankCharges().subscribe({
      next: (res) => {
        if (res.success && res.data) this.charges.set(res.data);
      }
    });
  }

  openEditModal(c: BankChargeItem) {
    this.selectedCharge.set({ ...c });
  }

  saveCharge() {
    const charge = this.selectedCharge();
    if (!charge) return;

    this.managerService.updateBankCharge(charge.id, charge).subscribe({
      next: () => {
        this.toastService.success('Bank charge rule updated successfully!');
        this.selectedCharge.set(null);
        this.loadCharges();
      }
    });
  }

  triggerScheduler() {
    this.triggering.set(true);
    this.managerService.triggerChargesScheduler().subscribe({
      next: () => {
        this.triggering.set(false);
        this.toastService.success('Monthly bank charges & minimum balance penalty job executed successfully!');
      },
      error: () => this.triggering.set(false)
    });
  }
}
