import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, CreditCard, DebitCard } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/cards';

  getDebitCards(): Observable<ApiResponse<DebitCard[]>> {
    return this.http.get<ApiResponse<DebitCard[]>>(`${this.API_URL}/debit`);
  }

  requestDebitCard(payload: { accountNumber: string; cardType: string; nameOnCard?: string }): Observable<ApiResponse<DebitCard>> {
    return this.http.post<ApiResponse<DebitCard>>(`${this.API_URL}/debit/request`, payload);
  }

  toggleDebitCard(cardId: number): Observable<ApiResponse<DebitCard>> {
    return this.http.put<ApiResponse<DebitCard>>(`${this.API_URL}/debit/${cardId}/toggle-status`, {});
  }

  setCardPin(cardId: number, payload: { newPin: string; confirmPin: string }): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/debit/${cardId}/pin`, payload);
  }

  getCreditCards(): Observable<ApiResponse<CreditCard[]>> {
    return this.http.get<ApiResponse<CreditCard[]>>(`${this.API_URL}/credit`);
  }

  applyCreditCard(payload: { cardType: string; nameOnCard?: string }): Observable<ApiResponse<CreditCard>> {
    return this.http.post<ApiResponse<CreditCard>>(`${this.API_URL}/credit/apply`, payload);
  }
}
