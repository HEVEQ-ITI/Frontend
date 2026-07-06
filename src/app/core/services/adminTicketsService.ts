import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_BASE_URL } from '../constants/api.constants';
import { AdminTicket, AdminTicketDetails, AdminTicketMessage, PaginatedResponse } from '../models/admin.models';

export interface ResolveTicketRequest {
  resolutionNote: string;
}

export interface AddMessageRequest {
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminTicketsService {
  constructor(private http: HttpClient) {}

  getTickets(page: number = 1, pageSize: number = 10, status?: string, priority?: string) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);

    return this.http.get<PaginatedResponse<AdminTicket>>(`${API_BASE_URL}/admin/tickets`, { params });
  }

  getTicketDetails(id: string) {
    return this.http.get<AdminTicketDetails>(`${API_BASE_URL}/admin/tickets/${id}`);
  }

  addMessage(id: string, request: AddMessageRequest) {
    return this.http.post<AdminTicketMessage>(`${API_BASE_URL}/admin/tickets/${id}/messages`, request);
  }

  resolveTicket(id: string, request: ResolveTicketRequest) {
    return this.http.post(`${API_BASE_URL}/admin/tickets/${id}/resolve`, request);
  }
}
