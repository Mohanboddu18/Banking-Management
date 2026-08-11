import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, LocationItem, Merchant, MobileOperator, MobileRecharge, MobileRechargePlan, Movie, MovieBooking, SeatLayout, ShowItem } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VASService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/vas`;

  // QR Code Payments
  getMerchants(): Observable<ApiResponse<Merchant[]>> {
    return this.http.get<ApiResponse<Merchant[]>>(`${this.API_URL}/qr/merchants`);
  }

  payQR(payload: { accountNumber: string; qrPayload: string; amount: number; note?: string; transactionPin: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/qr/pay`, payload);
  }

  // Telecom Recharge
  getOperators(): Observable<ApiResponse<MobileOperator[]>> {
    return this.http.get<ApiResponse<MobileOperator[]>>(`${this.API_URL}/recharge/operators`);
  }

  getPlans(operatorId: number): Observable<ApiResponse<MobileRechargePlan[]>> {
    return this.http.get<ApiResponse<MobileRechargePlan[]>>(`${this.API_URL}/recharge/plans/${operatorId}`);
  }

  rechargeMobile(payload: { accountNumber: string; mobileNumber: string; operatorId: number; planName: string; amount: number; transactionPin: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.API_URL}/recharge/pay`, payload);
  }

  getRechargeHistory(): Observable<ApiResponse<MobileRecharge[]>> {
    return this.http.get<ApiResponse<MobileRecharge[]>>(`${this.API_URL}/recharge/history`);
  }

  // Movie Ticket Booking
  getLocations(): Observable<ApiResponse<LocationItem[]>> {
    return this.http.get<ApiResponse<LocationItem[]>>(`${this.API_URL}/movies/locations`);
  }

  getMovies(): Observable<ApiResponse<Movie[]>> {
    return this.http.get<ApiResponse<Movie[]>>(`${this.API_URL}/movies`);
  }

  getShows(movieId: number): Observable<ApiResponse<ShowItem[]>> {
    return this.http.get<ApiResponse<ShowItem[]>>(`${this.API_URL}/movies/${movieId}/shows`);
  }

  getSeatLayout(showId: number): Observable<ApiResponse<SeatLayout>> {
    return this.http.get<ApiResponse<SeatLayout>>(`${this.API_URL}/movies/shows/${showId}/seats`);
  }

  bookMovie(payload: { showId: number; accountNumber: string; seatIds: number[]; transactionPin: string }): Observable<ApiResponse<MovieBooking>> {
    return this.http.post<ApiResponse<MovieBooking>>(`${this.API_URL}/movies/book`, payload);
  }

  getMyBookings(): Observable<ApiResponse<MovieBooking[]>> {
    return this.http.get<ApiResponse<MovieBooking[]>>(`${this.API_URL}/movies/my-bookings`);
  }
}
