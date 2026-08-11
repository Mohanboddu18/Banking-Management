import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiResponse, UserAuth, UserProfile } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly STORAGE_KEY = 'bank_auth_user';

  currentUser = signal<UserAuth | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.currentUser());
  isCustomer = computed(() => this.currentUser()?.userType === 'CUSTOMER');
  isEmployee = computed(() => this.currentUser()?.userType === 'EMPLOYEE');
  isManager = computed(() => this.currentUser()?.roles.includes('ROLE_MANAGER') || this.currentUser()?.roles.includes('ROLE_ADMIN'));

  isCashier = computed(() => this.hasAnyRole(['ROLE_EMPLOYEE_CASHIER', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN']));
  isLoanOfficer = computed(() => this.hasAnyRole(['ROLE_EMPLOYEE_LOAN_OFFICER', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN']));
  isChequeOfficer = computed(() => this.hasAnyRole(['ROLE_EMPLOYEE_OPERATIONS', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN']));
  isSupportOfficer = computed(() => this.hasAnyRole(['ROLE_EMPLOYEE_CUSTOMER_SERVICE', 'ROLE_EMPLOYEE_ASST_MANAGER', 'ROLE_MANAGER', 'ROLE_ADMIN']));

  login(credentials: { username: string; password: string }): Observable<ApiResponse<UserAuth>> {
    return this.http.post<ApiResponse<UserAuth>>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  register(payload: any): Observable<ApiResponse<UserAuth>> {
    return this.http.post<ApiResponse<UserAuth>>(`${this.API_URL}/register`, payload).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  getCurrentUserProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.API_URL}/me`);
  }

  setOrChangePin(payload: { currentPin?: string; newPin: string; confirmPin: string }): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/set-pin`, payload);
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/change-password`, payload);
  }

  forgotPassword(payload: { identifier: string; newPassword: string; verificationKey?: string }): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/forgot-password`, payload);
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.currentUser()?.token || null;
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.roles.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.currentUser()?.roles || [];
    return roles.some(r => userRoles.includes(r));
  }

  private setSession(authData: UserAuth) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
    this.currentUser.set(authData);
  }

  private getStoredUser(): UserAuth | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
}
