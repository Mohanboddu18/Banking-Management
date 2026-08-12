import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent, ToastComponent],
  template: `
    <div class="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      
      <!-- Toast Container -->
      <app-toast></app-toast>

      <!-- Authenticated Layout -->
      <ng-container *ngIf="authService.isAuthenticated() && !isAuthPage()">
        <app-navbar (toggleSidebar)="toggleSidebar()"></app-navbar>

        <div class="flex-1 flex w-full">
          <!-- Sidebar Navigation -->
          <app-sidebar [isOpen]="sidebarOpen()" (close)="sidebarOpen.set(false)"></app-sidebar>

          <!-- Main Dynamic Page Content Area -->
          <main class="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
            <router-outlet></router-outlet>
          </main>
        </div>

        <app-footer></app-footer>
      </ng-container>

      <!-- Full-screen Auth Pages (Login / Register) -->
      <ng-container *ngIf="!authService.isAuthenticated() || isAuthPage()">
        <main class="flex-1">
          <router-outlet></router-outlet>
        </main>
      </ng-container>

    </div>
  `
})
export class AppComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal<boolean>(false);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  isAuthPage(): boolean {
    const url = this.router.url;
    return url.includes('/auth/login') || url.includes('/auth/register');
  }
}
