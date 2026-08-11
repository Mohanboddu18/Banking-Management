import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Complaint } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/complaints`;

  raiseComplaint(payload: { category: string; subject: string; description: string; priority?: string }): Observable<ApiResponse<Complaint>> {
    return this.http.post<ApiResponse<Complaint>>(`${this.API_URL}`, payload);
  }

  getMyComplaints(): Observable<ApiResponse<Complaint[]>> {
    return this.http.get<ApiResponse<Complaint[]>>(`${this.API_URL}/my-complaints`);
  }

  getAllComplaints(): Observable<ApiResponse<Complaint[]>> {
    return this.http.get<ApiResponse<Complaint[]>>(`${this.API_URL}`);
  }

  updateComplaintStatus(id: number, payload: { status: string; assignedEmployeeId?: number; resolutionNotes?: string }): Observable<ApiResponse<Complaint>> {
    return this.http.put<ApiResponse<Complaint>>(`${this.API_URL}/${id}/status`, payload);
  }
}
