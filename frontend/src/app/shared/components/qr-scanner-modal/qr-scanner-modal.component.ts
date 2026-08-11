import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VASService } from '../../../core/services/vas.service';
import { Merchant } from '../../../core/models/models';

@Component({
  selector: 'app-qr-scanner-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div class="bank-glass p-6 md:p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-sky-500/30 text-center">
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-qrcode text-sky-400 text-xl"></i>
            <h3 class="text-lg font-bold text-white">Scan & Pay QR Code</h3>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-white transition-colors">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Simulated Camera Viewfinder -->
        <div class="relative w-full aspect-square max-w-[280px] mx-auto mb-5 rounded-2xl overflow-hidden bg-slate-950 border-2 border-dashed border-sky-500/50 flex flex-col items-center justify-center">
          <div class="absolute inset-4 border-2 border-sky-400 rounded-lg pointer-events-none opacity-80 animate-pulse"></div>
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-bounce"></div>
          
          <i class="fa-solid fa-camera text-slate-600 text-4xl mb-2"></i>
          <p class="text-xs text-slate-400 px-4">Align QR code within the frame or select a verified merchant below</p>
        </div>

        <!-- Select Verified Merchant List -->
        <div class="text-left mb-6">
          <label class="bank-label text-xs uppercase tracking-wider mb-2">Or Choose from Verified Merchants</label>
          <div class="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            <div *ngFor="let m of merchants()" 
                 (click)="selectMerchant(m)"
                 class="p-3 rounded-xl bg-slate-800/60 hover:bg-sky-950/60 border border-slate-700/60 hover:border-sky-500/50 cursor-pointer flex items-center justify-between transition-all">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center text-sm font-bold">
                  <i class="fa-solid fa-store"></i>
                </div>
                <div>
                  <div class="text-sm font-semibold text-white">{{ m.businessName }}</div>
                  <div class="text-xs text-slate-400">{{ m.category }} • {{ m.merchantCode }}</div>
                </div>
              </div>
              <span class="badge badge-success text-[10px]"><i class="fa-solid fa-circle-check"></i> Verified</span>
            </div>
          </div>
        </div>

        <button (click)="close.emit()" class="bank-btn-secondary w-full">
          Cancel Scan
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
