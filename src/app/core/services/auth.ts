import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { tap } from 'rxjs'
import { API_BASE_URL } from '../constants/api.constants'
import { AuthResponse, ConfirmEmailRequest, CurrentUserResponse, LoginRequest, RefreshTokenResponse, RegisterRequest, ResendConfirmationEmailRequest, UserRole} from '../models/auth.models'
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
    return this.http.post<AuthResponse>(`${API_BASE_URL}/Auth/Register`, request)
  }

  refreshToken(refreshToken: string) {
    return this.http.post<RefreshTokenResponse>(`${API_BASE_URL}/Auth/refresh-token`, {
      refreshToken
    })
  }

  getMe() {
    return this.http
      .get<CurrentUserResponse>(`${API_BASE_URL}/Auth/me`)
      .pipe(
        tap(user => {
          this.tokenStorage.saveCurrentUser(user)
        })
      )
  }

  confirmEmail(request: ConfirmEmailRequest) {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/Auth/confirm-email`, request)
  }

  resendConfirmationEmail(request: ResendConfirmationEmailRequest) {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/Auth/resend-confirmation-email`, request)
  }

  logout(): void {
    const refreshToken = this.tokenStorage.getRefreshToken()

    this.tokenStorage.clear()

    if (!refreshToken) {
      return
    }

    this.http.post(`${API_BASE_URL}/Auth/logout`, { refreshToken }).subscribe({
      next: () => {},
      error: () => {}
    })
  }

  getDashboardRoute(role: UserRole | null): string {
    if (role === 'customer') {
      return '/dashboard'
    }

    if (role === 'provider') {
      return '/provider-dashboard'
    }

    if (role === 'admin' || role === 'employee') {
      return '/admin'
    }

    return '/'
  }
}