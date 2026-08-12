import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VASService } from '../../../core/services/vas.service';
import { Merchant } from '../../../core/models/models';

@Component({
  selector: 'app-qr-scanner-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div class="bank-card p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
        <!-- Header -->
        <div class="flex justify-between items-center pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-qrcode text-amber-500 text-base"></i>
            <h3 class="text-base font-bold text-slate-900 font-serif">Scan BharatQR Code</h3>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-slate-700 cursor-pointer">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <!-- Simulated Camera Viewfinder -->
        <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center p-4">
          <div class="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-2 text-amber-400">
            <i class="fa-solid fa-camera text-xl"></i>
          </div>
          <p class="text-xs text-slate-300 font-semibold">Camera Viewfinder Active</p>
          <p class="text-[10px] text-slate-500 mt-0.5">Position QR code or select verified merchant below</p>
        </div>

        <!-- Select Verified Merchant List -->
        <div class="text-left space-y-2">
          <label class="bank-label">Select Verified Merchant</label>
          <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            <div *ngFor="let m of merchants()" 
                 (click)="selectMerchant(m)"
                 class="p-2.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 cursor-pointer flex items-center justify-between transition-all group">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                  <i class="fa-solid fa-shop"></i>
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-900 group-hover:text-amber-950">{{ m.businessName }}</div>
                  <div class="text-[10px] text-slate-500 font-mono">{{ m.category }} • {{ m.merchantCode }}</div>
                </div>
              </div>
              <span class="pill-dark text-[9px] py-0 px-2 group-hover:bg-amber-500 group-hover:text-slate-950">Select</span>
            </div>
          </div>
        </div>

        <button (click)="close.emit()" class="bank-btn-secondary w-full py-2 text-xs font-semibold">
          Cancel
        </button>
      </div>
    </div>
  `
})
export class QrScannerModalComponent {
  @Output() merchantSelected = new EventEmitter<{ qrPayload: string; merchantName: string }>();
  @Output() close = new EventEmitter<void>();

  private vasService = inject(VASService);
  merchants = signal<Merchant[]>([]);

  ngOnInit() {
    this.vasService.getMerchants().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.merchants.set(res.data);
        }
      }
    });
  }

  selectMerchant(m: Merchant) {
    this.merchantSelected.emit({
      qrPayload: m.merchantCode,
      merchantName: m.businessName
    });
  }
}
