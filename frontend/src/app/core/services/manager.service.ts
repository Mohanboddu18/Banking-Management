import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, AuditLogItem, BankChargeItem, Employee, ManagerStats } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/manager`;

  getDashboardStats(): Observable<ApiResponse<ManagerStats>> {
    return this.http.get<ApiResponse<ManagerStats>>(`${this.API_URL}/dashboard/stats`);
  }

  getAllEmployees(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.API_URL}/employees`);
  }

  createEmployee(payload: any): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(`${this.API_URL}/employees`, payload);
  }

  updateEmployee(id: number, payload: any): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.API_URL}/employees/${id}`, payload);
  }

  updateAccountStatus(accountId: number, status: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.API_URL}/accounts/${accountId}/status`, { status });
  }

  getBankCharges(): Observable<ApiResponse<BankChargeItem[]>> {
    return this.http.get<ApiResponse<BankChargeItem[]>>(`${this.API_URL}/bank-charges`);
  }

  updateBankCharge(id: number, payload: any): Observable<ApiResponse<BankChargeItem>> {
    return this.http.put<ApiResponse<BankChargeItem>>(`${this.API_URL}/bank-charges/${id}`, payload);
  }

  triggerChargesScheduler(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/bank-charges/trigger-scheduler`, {});
  }

  getAuditLogs(): Observable<ApiResponse<AuditLogItem[]>> {
    return this.http.get<ApiResponse<AuditLogItem[]>>(`${this.API_URL}/audit-logs`);
  }
}
