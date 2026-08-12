import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-white border-t border-slate-200 py-5 px-4 md:px-8 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-slate-600 font-medium">
          <i class="fa-solid fa-shield-halved text-amber-500 text-sm"></i>
          <span>256-Bit SSL Encrypted & RBI Guidelines Compliant</span>
        </div>
        <div class="text-slate-400 text-[11px]">
          © 2026 Godavari Bank Online Management System.
        </div>
        <div class="flex gap-4 text-slate-500 font-medium text-xs">
          <span class="hover:text-slate-900 cursor-pointer"><i class="fa-solid fa-phone text-xs text-amber-500"></i> 1800-425-2233</span>
          <span class="hover:text-slate-900 cursor-pointer"><i class="fa-solid fa-envelope text-xs text-amber-500"></i> support&#64;godavaribank.in</span>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
