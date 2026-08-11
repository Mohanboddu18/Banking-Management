import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationItem } from '../../../core/models/models';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  template: `
    <header class="h-16 bg-[#0b1329]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      <!-- Left: Logo & Sidebar Toggle -->
      <div class="flex items-center gap-4">
        <button (click)="toggleSidebar.emit()" class="lg:hidden text-slate-400 hover:text-white p-2">
          <i class="fa-solid fa-bars text-lg"></i>
        </button>

        <a routerLink="/" class="flex items-center gap-3 no-underline group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
            <i class="fa-solid fa-building-columns text-lg"></i>
          </div>
          <div>
            <div class="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 font-['Outfit']">
              <span>GODAVARI BANK</span>
              <span class="text-xs px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30">ONLINE</span>
            </div>
            <div class="text-[10px] text-slate-400 font-medium tracking-wider">SECURE DIGITAL BANKING</div>
          </div>
        </a>
      </div>

      <!-- Right: Role Switcher Demo Bar, Notifications, User Menu -->
      <div class="flex items-center gap-3">
        <!-- Role Badge -->
        <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
          <span class="w-2 h-2 rounded-full" [ngClass]="{
            'bg-emerald-400 animate-ping': authService.isCustomer(),
            'bg-purple-400': authService.isManager(),
            'bg-amber-400': authService.isEmployee() && !authService.isManager()
          }"></span>
          <span class="font-semibold text-slate-300">{{ getDisplayRole() }}</span>
        </div>

        <!-- Notifications Dropdown -->
        <div class="relative" *ngIf="authService.isCustomer()">
          <button (click)="toggleNotifications()" 
                  class="relative p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors">
            <i class="fa-regular fa-bell text-base"></i>
            <span *ngIf="notificationService.unreadCount() > 0" 
                  class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0b1329]">
              {{ notificationService.unreadCount() }}
            </span>
          </button>

          <!-- Notification Menu -->
          <div *ngIf="showNotifications()" 
               class="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#131f3d] border border-white/10 shadow-2xl p-4 z-50 animate-fade-in">
            <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span class="text-sm font-bold text-white flex items-center gap-2">
                <i class="fa-solid fa-bell text-sky-400"></i> Notifications
              </span>
              <button (click)="markAllRead()" class="text-xs text-sky-400 hover:underline">Mark all read</button>
            </div>

            <div class="max-h-72 overflow-y-auto flex flex-col gap-2.5 pr-1">
              <div *ngIf="notifications().length === 0" class="py-6 text-center text-xs text-slate-400">
                No new notifications
              </div>
              <div *ngFor="let n of notifications()" 
                   (click)="markAsRead(n)"
                   class="p-2.5 rounded-xl transition-all cursor-pointer border"
                   [ngClass]="n.isRead ? 'bg-slate-800/30 border-transparent opacity-70' : 'bg-sky-950/40 border-sky-500/30 hover:bg-sky-900/40'">
                <div class="flex items-start justify-between gap-2 mb-1">
                  <span class="text-xs font-semibold text-white">{{ n.title }}</span>
                  <span class="text-[10px] text-slate-400 whitespace-nowrap">{{ n.createdAt | timeAgo }}</span>
                </div>
                <p class="text-xs text-slate-300 leading-snug">{{ n.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile Dropdown -->
        <div class="flex items-center gap-3 pl-2 border-l border-white/10">
          <div class="hidden md:block text-right">
            <div class="text-xs font-bold text-white">{{ authService.currentUser()?.fullName }}</div>
            <div class="text-[10px] text-slate-400">{{ authService.currentUser()?.email }}</div>
          </div>

          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow">
            {{ getInitials() }}
          </div>

          <button (click)="authService.logout()" 
                  title="Logout"
                  class="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
            <i class="fa-solid fa-arrow-right-from-bracket text-base"></i>
          </button>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  private router = inject(Router);

  showNotifications = signal<boolean>(false);
  notifications = signal<NotificationItem[]>([]);

  ngOnInit() {
    if (this.authService.isCustomer()) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.notificationService.getNotifications().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.notifications.set(res.data);
        }
      }
    });
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) {
      this.loadNotifications();
    }
  }

  markAsRead(n: NotificationItem) {
    if (!n.isRead) {
      this.notificationService.markAsRead(n.id).subscribe();
      n.isRead = true;
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.update(list => list.map(item => ({ ...item, isRead: true })));
    });
  }

  getDisplayRole(): string {
    if (this.authService.isManager()) return 'Branch Manager';
    if (this.authService.isEmployee()) return 'Bank Officer';
    return 'Retail Customer';
  }

  getInitials(): string {
    const name = this.authService.currentUser()?.fullName || 'User';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
