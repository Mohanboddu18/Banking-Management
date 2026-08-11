import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pin-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div class="bank-glass p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl border border-sky-500/20 text-center">
        <!-- Header -->
        <div class="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-4 text-sky-400 text-2xl">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-1">{{ title }}</h3>
        <p class="text-xs text-slate-400 mb-6">{{ subtitle || 'Enter your 4-digit Transaction PIN to authorize this transfer.' }}</p>

        <!-- PIN Dots Display -->
        <div class="flex justify-center gap-4 mb-6">
          <div *ngFor="let i of [0, 1, 2, 3]" 
               class="w-5 h-5 rounded-full border-2 transition-all duration-200"
               [ngClass]="pin().length > i ? 'bg-sky-400 border-sky-400 scale-110 shadow-lg shadow-sky-500/50' : 'border-slate-600 bg-slate-800/50'">
          </div>
        </div>

        <!-- Virtual Keypad -->
        <div class="grid grid-cols-3 gap-3 mb-6 max-w-[260px] mx-auto">
          <button *ngFor="let num of [1,2,3,4,5,6,7,8,9]" 
                  (click)="appendDigit(num.toString())"
                  class="h-12 rounded-xl bg-slate-800/80 hover:bg-sky-600/30 active:bg-sky-600 border border-slate-700 hover:border-sky-500/50 text-lg font-bold text-white transition-all">
            {{ num }}
          </button>
          <button (click)="clearPin()" 
                  class="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-700 text-xs font-semibold text-slate-400 transition-all">
            CLEAR
          </button>
          <button (click)="appendDigit('0')" 
                  class="h-12 rounded-xl bg-slate-800/80 hover:bg-sky-600/30 border border-slate-700 hover:border-sky-500/50 text-lg font-bold text-white transition-all">
            0
          </button>
          <button (click)="deleteDigit()" 
                  class="h-12 rounded-xl bg-slate-800/40 hover:bg-rose-500/20 text-rose-400 transition-all flex items-center justify-center">
            <i class="fa-solid fa-delete-left"></i>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <button (click)="cancel.emit()" 
                  class="bank-btn-secondary flex-1">
            Cancel
          </button>
          <button (click)="submitPin()" 
                  [disabled]="pin().length !== 4"
                  class="bank-btn-primary flex-1">
            <i class="fa-solid fa-lock text-xs"></i> Authorize
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
