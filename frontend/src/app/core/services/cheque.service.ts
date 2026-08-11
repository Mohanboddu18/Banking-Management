import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, ChequeRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChequeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/cheques`;

  requestChequeBook(payload: { accountNumber: string; numberOfLeaves: number }): Observable<ApiResponse<ChequeRequest>> {
    return this.http.post<ApiResponse<ChequeRequest>>(`${this.API_URL}/request`, payload);
  }

  getMyChequeRequests(): Observable<ApiResponse<ChequeRequest[]>> {
    return this.http.get<ApiResponse<ChequeRequest[]>>(`${this.API_URL}/my-requests`);
  }

  getPendingRequests(): Observable<ApiResponse<ChequeRequest[]>> {
    return this.http.get<ApiResponse<ChequeRequest[]>>(`${this.API_URL}/pending`);
  }

  processChequeRequest(requestId: number, payload: { action: string; remarks?: string }): Observable<ApiResponse<ChequeRequest>> {
    return this.http.put<ApiResponse<ChequeRequest>>(`${this.API_URL}/${requestId}/process`, payload);
  }
}
