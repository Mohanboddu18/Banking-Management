import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, ApiResponse, Transaction } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/employee';

  searchAccounts(query: string = ''): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(`${this.API_URL}/customers?query=${encodeURIComponent(query)}`);
  }

  cashierDeposit(payload: { accountNumber: string; amount: number; description?: string }): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/cashier/deposit`, payload);
  }

  cashierWithdraw(payload: { accountNumber: string; amount: number; description?: string; transactionPin?: string }): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/cashier/withdraw`, payload);
  }
}
