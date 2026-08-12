import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pin-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div class="bank-card p-6 rounded-2xl max-w-xs w-full shadow-2xl text-center space-y-4">
        <!-- Header -->
        <div>
          <div class="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2 text-amber-600 text-base shadow-2xs">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h3 class="text-base font-bold text-slate-900 font-serif">{{ title }}</h3>
          <p class="text-xs text-slate-500 mt-0.5">{{ subtitle || 'Enter 4-digit PIN to authorize' }}</p>
        </div>

        <!-- PIN Dots Display -->
        <div class="flex justify-center gap-3 py-1">
          <div *ngFor="let i of [0, 1, 2, 3]" 
               class="w-3.5 h-3.5 rounded-full border transition-all"
               [ngClass]="pin().length > i ? 'bg-amber-500 border-amber-500 shadow-2xs scale-110' : 'border-slate-300 bg-slate-100'">
          </div>
        </div>

        <!-- Virtual Keypad -->
        <div class="grid grid-cols-3 gap-2 max-w-[210px] mx-auto">
          <button *ngFor="let num of [1,2,3,4,5,6,7,8,9]" 
                  (click)="appendDigit(num.toString())"
                  class="h-10 rounded-xl bg-slate-50 hover:bg-amber-50 active:bg-amber-500 active:text-slate-950 border border-slate-200 text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-2xs">
            {{ num }}
          </button>
          <button (click)="clearPin()" 
                  class="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 transition-all cursor-pointer">
            CLR
          </button>
          <button (click)="appendDigit('0')" 
                  class="h-10 rounded-xl bg-slate-50 hover:bg-amber-50 active:bg-amber-500 active:text-slate-950 border border-slate-200 text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-2xs">
            0
          </button>
          <button (click)="deleteDigit()" 
                  class="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all flex items-center justify-center text-xs cursor-pointer">
            <i class="fa-solid fa-delete-left"></i>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 pt-2 border-t border-slate-100">
          <button (click)="cancel.emit()" 
                  class="bank-btn-secondary flex-1 py-2 text-xs font-semibold">
            Cancel
          </button>
          <button (click)="submitPin()" 
                  [disabled]="pin().length !== 4"
                  class="bank-btn-primary flex-1 py-2 text-xs font-bold">
            Authorize →
          </button>
        </div>
      </div>
    </div>
  `
})
export class PinModalComponent {
  @Input() title: string = 'Security PIN Verification';
  @Input() subtitle: string = '';
  @Output() confirmed = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  pin = signal<string>('');

  appendDigit(digit: string) {
    if (this.pin().length < 4) {
      this.pin.update(p => p + digit);
      if (this.pin().length === 4) {
        // Automatically submit or wait for button
      }
    }
  }

  deleteDigit() {
    this.pin.update(p => p.slice(0, -1));
  }

  clearPin() {
    this.pin.set('');
  }

  submitPin() {
    if (this.pin().length === 4) {
      this.confirmed.emit(this.pin());
    }
  }
}
