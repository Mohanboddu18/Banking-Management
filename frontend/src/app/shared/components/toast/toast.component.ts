import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <div *ngFor="let t of toastService.toasts()" 
           class="pointer-events-auto p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all duration-300 animate-fade-in"
           [ngClass]="{
             'bg-emerald-950/90 border-emerald-500/50 text-emerald-100': t.type === 'success',
             'bg-rose-950/90 border-rose-500/50 text-rose-100': t.type === 'error',
             'bg-amber-950/90 border-amber-500/50 text-amber-100': t.type === 'warning',
             'bg-sky-950/90 border-sky-500/50 text-sky-100': t.type === 'info'
           }">
        <div class="text-xl">
          <i class="fa-solid" [ngClass]="{
            'fa-circle-check text-emerald-400': t.type === 'success',
            'fa-circle-xmark text-rose-400': t.type === 'error',
            'fa-triangle-exclamation text-amber-400': t.type === 'warning',
            'fa-circle-info text-sky-400': t.type === 'info'
          }"></i>
        </div>
        <div class="flex-1 text-sm font-medium">{{ t.message }}</div>
        <button (click)="toastService.remove(t.id)" class="text-slate-400 hover:text-white transition-colors">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
