import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, ApiResponse, BalanceInfo, Beneficiary } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/accounts`;

  getMyAccounts(): Observable<ApiResponse<Account[]>> {
    return this.http.get<ApiResponse<Account[]>>(`${this.API_URL}/my-accounts`);
  }

  getAccountDetails(accountNumber: string): Observable<ApiResponse<Account>> {
    return this.http.get<ApiResponse<Account>>(`${this.API_URL}/${accountNumber}`);
  }

  getAccountBalance(accountNumber: string): Observable<ApiResponse<BalanceInfo>> {
    return this.http.get<ApiResponse<BalanceInfo>>(`${this.API_URL}/${accountNumber}/balance`);
  }

  getBeneficiaries(): Observable<ApiResponse<Beneficiary[]>> {
    return this.http.get<ApiResponse<Beneficiary[]>>(`${this.API_URL}/beneficiaries`);
  }

  addBeneficiary(payload: { beneficiaryName: string; accountNumber: string; ifscCode: string; bankName: string; maxLimit?: number }): Observable<ApiResponse<Beneficiary>> {
    return this.http.post<ApiResponse<Beneficiary>>(`${this.API_URL}/beneficiaries`, payload);
  }

  deleteBeneficiary(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.API_URL}/beneficiaries/${id}`);
  }
}
