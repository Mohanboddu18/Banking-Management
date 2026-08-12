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
    <header class="h-16 bg-[#111827] border-b border-slate-800 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between shadow-sm">
      <!-- Left: Logo & Sidebar Toggle -->
      <div class="flex items-center gap-4">
        <button (click)="toggleSidebar.emit()" class="lg:hidden text-slate-400 hover:text-white p-1.5 cursor-pointer">
          <i class="fa-solid fa-bars text-lg"></i>
        </button>

        <a routerLink="/" class="flex items-center gap-2.5 no-underline group">
          <div class="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm font-bold shadow-xs">
            <i class="fa-solid fa-building-columns"></i>
          </div>
          <div>
            <div class="text-base font-extrabold text-white tracking-tight flex items-center gap-2 font-display">
              <span>Godavari Bank</span>
              <span class="text-[10px] px-2 py-0.5 bg-slate-800 text-amber-400 rounded-full border border-slate-700 font-bold uppercase tracking-wider">Online</span>
            </div>
          </div>
        </a>
      </div>

      <!-- Right: Role Switcher Demo Bar, Notifications, User Menu -->
      <div class="flex items-center gap-3">
        <!-- Role Badge -->
        <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
          <span class="w-2 h-2 rounded-full" [ngClass]="{
            'bg-emerald-400': authService.isCustomer(),
            'bg-purple-400': authService.isManager(),
            'bg-amber-400': authService.isEmployee() && !authService.isManager()
          }"></span>
          <span class="font-bold text-slate-200 text-[11px]">{{ getDisplayRole() }}</span>
        </div>

        <!-- Notifications Dropdown -->
        <div class="relative" *ngIf="authService.isCustomer()">
          <button (click)="toggleNotifications()" 
                  class="relative p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer">
            <i class="fa-regular fa-bell text-xs"></i>
            <span *ngIf="notificationService.unreadCount() > 0" 
                  class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {{ notificationService.unreadCount() }}
            </span>
          </button>

          <!-- Notification Menu -->
          <div *ngIf="showNotifications()" 
               class="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 z-50 animate-fade-in text-slate-800">
            <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <i class="fa-solid fa-bell text-amber-500"></i> Notifications
              </span>
              <button (click)="markAllRead()" class="text-[11px] text-amber-600 font-semibold hover:underline cursor-pointer">Mark all read</button>
            </div>

            <div class="max-h-64 overflow-y-auto flex flex-col gap-2 pr-1">
              <div *ngIf="notifications().length === 0" class="py-4 text-center text-xs text-slate-400">
                No new notifications
              </div>
              <div *ngFor="let n of notifications()" 
                   (click)="markAsRead(n)"
                   class="p-2.5 rounded-xl transition-all cursor-pointer border"
                   [ngClass]="n.isRead ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'">
                <div class="flex items-start justify-between gap-2 mb-0.5">
                  <span class="text-xs font-semibold text-slate-900">{{ n.title }}</span>
                  <span class="text-[10px] text-slate-400">{{ n.createdAt | timeAgo }}</span>
                </div>
                <p class="text-[11px] text-slate-600 leading-snug">{{ n.message }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile Dropdown -->
        <div class="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div class="hidden md:block text-right">
            <div class="text-xs font-bold text-white">{{ authService.currentUser()?.fullName }}</div>
            <div class="text-[10px] text-slate-400">{{ authService.currentUser()?.email }}</div>
          </div>

          <div class="w-8 h-8 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center justify-center shadow-xs">
            {{ getInitials() }}
          </div>

          <button (click)="authService.logout()" 
                  title="Logout"
                  class="px-3 py-1 rounded-full bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
            <i class="fa-solid fa-arrow-right-from-bracket text-[11px]"></i>
            <span class="hidden sm:inline">Logout</span>
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
