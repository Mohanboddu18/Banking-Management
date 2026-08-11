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
    <div class="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2.5">
            <i class="fa-solid fa-sliders text-amber-400"></i> Bank Charges & Penalty Rule Engine
          </h1>
          <p class="text-xs text-slate-400">Configure minimum balance non-maintenance penalty amounts, SMS alerts, and run batch audits</p>
        </div>

        <button (click)="triggerScheduler()" [disabled]="triggering()" class="bank-btn-primary text-xs bg-amber-600 hover:bg-amber-700">
          <i *ngIf="triggering()" class="fa-solid fa-circle-notch fa-spin"></i>
          <i *ngIf="!triggering()" class="fa-solid fa-bolt"></i> Run Penalty Deduction Job Now
        </button>
      </div>

      <!-- Bank Charges Table -->
      <div class="bank-glass p-6 md:p-8 rounded-3xl space-y-4">
        <h3 class="text-base font-bold text-white">Configured Bank Fee Rules ({{ charges().length }})</h3>

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
                <td class="font-bold text-white text-xs">{{ c.chargeName }}</td>
                <td>
                  <span class="badge badge-info text-[10px]">{{ c.chargeType }}</span>
                </td>
                <td class="font-mono text-xs font-bold text-amber-400">{{ c.amount | inrCurrency }}</td>
                <td class="font-mono text-xs text-slate-300">
                  {{ c.minBalanceThreshold ? (c.minBalanceThreshold | inrCurrency) : 'N/A' }}
                </td>
                <td class="text-xs text-slate-400">{{ c.frequency }}</td>
                <td>
                  <span class="badge" [ngClass]="c.active ? 'badge-success' : 'badge-danger'">
                    {{ c.active ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td>
                  <button (click)="openEditModal(c)" class="bank-btn-secondary text-xs py-1 px-3">
                    <i class="fa-solid fa-pen text-sky-400"></i> Edit Rule
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Charge Modal -->
      <div *ngIf="selectedCharge()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bank-glass p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-amber-500/30">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-white">Edit Bank Charge Rule</h3>
            <button (click)="selectedCharge.set(null)" class="text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <form (ngSubmit)="saveCharge()" class="space-y-4">
            <div>
              <label class="bank-label">Charge Name *</label>
              <input [(ngModel)]="selectedCharge()!.chargeName" name="name" required class="bank-input" />
            </div>

            <div>
              <label class="bank-label">Charge Amount (₹) *</label>
              <input [(ngModel)]="selectedCharge()!.amount" name="amt" required type="number" class="bank-input font-bold text-amber-400" />
            </div>

            <div *ngIf="selectedCharge()!.minBalanceThreshold">
              <label class="bank-label">Minimum Balance Requirement Threshold (₹)</label>
              <input [(ngModel)]="selectedCharge()!.minBalanceThreshold" name="thresh" type="number" class="bank-input" />
            </div>

            <div class="flex items-center gap-2 pt-2">
              <input [(ngModel)]="selectedCharge()!.active" name="act" type="checkbox" id="activeCheckbox" class="rounded bg-slate-800 border-slate-700 text-sky-500" />
              <label for="activeCheckbox" class="text-xs text-slate-300 font-semibold cursor-pointer">Enable Charge Rule</label>
            </div>

            <div class="flex gap-3 pt-3">
              <button type="button" (click)="selectedCharge.set(null)" class="bank-btn-secondary flex-1">Cancel</button>
              <button type="submit" class="bank-btn-primary flex-1 bg-amber-600 hover:bg-amber-700">
                Save Rule
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
