import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, EmiCalculationResult, Loan, LoanRepayment, LoanType, Transaction } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/loans';

  getLoanTypes(): Observable<ApiResponse<LoanType[]>> {
    return this.http.get<ApiResponse<LoanType[]>>(`${this.API_URL}/types`);
  }

  calculateEmi(principal: number, annualInterestRate: number, tenureMonths: number): Observable<ApiResponse<EmiCalculationResult>> {
    return this.http.post<ApiResponse<EmiCalculationResult>>(`${this.API_URL}/calculate-emi`, {
      principal,
      annualInterestRate,
      tenureMonths
    });
  }

  applyLoan(payload: any): Observable<ApiResponse<Loan>> {
    return this.http.post<ApiResponse<Loan>>(`${this.API_URL}/apply`, payload);
  }

  getMyLoans(): Observable<ApiResponse<Loan[]>> {
    return this.http.get<ApiResponse<Loan[]>>(`${this.API_URL}/my-loans`);
  }

  getRepayments(loanId: number): Observable<ApiResponse<LoanRepayment[]>> {
    return this.http.get<ApiResponse<LoanRepayment[]>>(`${this.API_URL}/${loanId}/repayments`);
  }

  payEmi(loanId: number, payload: { accountNumber: string; transactionPin: string }): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/${loanId}/pay-emi`, payload);
  }

  payAllEmis(loanId: number, payload: { accountNumber: string; transactionPin: string }): Observable<ApiResponse<Transaction>> {
    return this.http.post<ApiResponse<Transaction>>(`${this.API_URL}/${loanId}/pay-all-emis`, payload);
  }

  getPendingLoans(): Observable<ApiResponse<Loan[]>> {
    return this.http.get<ApiResponse<Loan[]>>(`${this.API_URL}/pending`);
  }

  reviewByOfficer(loanId: number, payload: { recommendation: string; notes?: string }): Observable<ApiResponse<Loan>> {
    return this.http.put<ApiResponse<Loan>>(`${this.API_URL}/${loanId}/review`, payload);
  }

  decideByManager(loanId: number, payload: { decision: string; approvedAmount?: number; remarks?: string }): Observable<ApiResponse<Loan>> {
    return this.http.put<ApiResponse<Loan>>(`${this.API_URL}/${loanId}/decision`, payload);
  }
}
