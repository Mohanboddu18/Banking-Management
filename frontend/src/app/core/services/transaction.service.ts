import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResponse, StatementSummary, Transaction } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/transactions`;

  deposit(payload: {
    accountNumber: string;
    amount: number;
    description?: string;
    depositMethod?: string;
    cardNumber?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvv?: string;
    atmPin?: string;
  }): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/deposit`, payload);
  }

  withdraw(payload: {
    accountNumber: string;
    amount: number;
    transactionPin?: string;
    atmPin?: string;
    cardNumber?: string;
    withdrawMethod?: string;
    description?: string;
  }): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/withdraw`, payload);
  }

  transfer(payload: { senderAccountNumber: string; receiverAccountNumber: string; receiverIfscCode: string; amount: number; description?: string; transactionPin: string }): Observable<ApiResponse<Transaction>> {
    const idempotencyKey = 'IDEM-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
    return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/transfer`, payload, { headers });
  }

  getRecentTransactions(accountNumber: string): Observable<ApiResponse<Transaction[]>> {
    return this.http.get<ApiResponse<Transaction[]>>(`${this.API_URL}/recent?accountNumber=${accountNumber}`);
  }

  getFilteredHistory(filter: any): Observable<ApiResponse<PagedResponse<Transaction>>> {
    return this.http.post<ApiResponse<PagedResponse<Transaction>>>(`${this.API_URL}/history`, filter);
  }

  getStatementData(accountNumber: string, timeframe: string = '6_MONTHS', startDate?: string, endDate?: string): Observable<ApiResponse<StatementSummary>> {
    let params = new HttpParams()
      .set('accountNumber', accountNumber)
      .set('timeframe', timeframe);

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<StatementSummary>>(`${this.API_URL}/statement/data`, { params });
  }

  downloadStatementPdf(accountNumber: string, timeframe: string = '6_MONTHS', startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams()
      .set('accountNumber', accountNumber)
      .set('timeframe', timeframe);

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get(`${this.API_URL}/statement/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  downloadStatementCsv(accountNumber: string, timeframe: string = '6_MONTHS', startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams()
      .set('accountNumber', accountNumber)
      .set('timeframe', timeframe);

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get(`${this.API_URL}/statement/csv`, {
      params,
      responseType: 'blob'
    });
  }
}
