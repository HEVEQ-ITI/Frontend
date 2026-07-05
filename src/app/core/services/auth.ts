import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { tap } from 'rxjs'
import { API_BASE_URL } from '../constants/api.constants'
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models'
import { TokenStorage } from './token-storage'

@Injectable({
  providedIn: 'root'
})
export class Auth {
  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage
  ) {}

  login(request: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/Auth/Login`, request)
      .pipe(
        tap(response => {
          if (response.isAuthenticated) {
            this.tokenStorage.saveAuth(response)
          }
        })
      )
  }

  register(request: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/Auth/Register`, request)
      .pipe(
        tap(response => {
          if (response.isAuthenticated) {
            this.tokenStorage.saveAuth(response)
          }
        })
      )
  }

  refreshToken(refreshToken: string) {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/Auth/refresh-token`, {
      refreshToken
    })
  }

  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken()

    this.tokenStorage.clear()
    if (!refreshToken)
      return

    this.http.post(`${API_BASE_URL}/Auth/logout`, { refreshToken }).subscribe({
      next: () => {},
      error: () => {}
    })
  }
}