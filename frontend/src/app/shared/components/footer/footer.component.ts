import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-[#0b1329] border-t border-white/10 py-6 px-4 md:px-8 text-center text-xs text-slate-400">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-shield-halved text-sky-400 text-sm"></i>
          <span>256-Bit SSL Encrypted & RBI Guidelines Compliant (Simulation)</span>
        </div>
        <div class="text-slate-500">
          © 2026 Godavari Bank Online Management System. Developed with Angular & Spring Boot.
        </div>
        <div class="flex gap-4 text-slate-400">
          <span class="hover:text-white cursor-pointer"><i class="fa-solid fa-phone text-xs"></i> 1800-425-2233</span>
          <span class="hover:text-white cursor-pointer"><i class="fa-solid fa-envelope text-xs"></i> support&#64;godavaribank.in</span>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
