import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse, NotificationItem } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/notifications`;

  unreadCount = signal<number>(0);

  getNotifications(): Observable<ApiResponse<NotificationItem[]>> {
    return this.http.get<ApiResponse<NotificationItem[]>>(`${this.API_URL}`).pipe(
      tap(res => {
        if (res.success && res.data) {
          const unread = res.data.filter(n => !n.isRead).length;
          this.unreadCount.set(unread);
        }
      })
    );
  }

  fetchUnreadCount(): Observable<ApiResponse<{ unreadCount: number }>> {
    return this.http.get<ApiResponse<{ unreadCount: number }>>(`${this.API_URL}/unread-count`).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.unreadCount.set(res.data.unreadCount);
        }
      })
    );
  }

  markAsRead(id: number): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.API_URL}/${id}/read`, {}).pipe(
      tap(() => this.unreadCount.update(c => Math.max(0, c - 1)))
    );
  }

  markAllAsRead(): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.API_URL}/mark-all-read`, {}).pipe(
      tap(() => this.unreadCount.set(0))
    );
  }
}
