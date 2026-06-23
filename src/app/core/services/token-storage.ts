import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { AuthResponse, UserRole } from '../models/auth.models'

const AUTH_KEY = 'sharegear_auth'

@Injectable({
  providedIn: 'root'
})
export class TokenStorage {
  private authSubject = new BehaviorSubject<AuthResponse | null>(this.getAuthFromStorage())

  authState$ = this.authSubject.asObservable()

  saveAuth(auth: AuthResponse): void {
    this.clearOldKeys()
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
    this.authSubject.next(auth)
  }

  getAuth(): AuthResponse | null {
    return this.authSubject.value
  }

  private getAuthFromStorage(): AuthResponse | null {
    const value = localStorage.getItem(AUTH_KEY)

    if (!value) {
      return null
    }

    return JSON.parse(value) as AuthResponse
  }

  getAccessToken(): string | null {
    return this.getAuth()?.accessToken ?? null
  }

  getRefreshToken(): string | null {
    return this.getAuth()?.refreshToken ?? null
  }

  getUserName(): string {
    return this.getAuth()?.userName ?? ''
  }

  getRole(): UserRole | null {
    const role = this.getAuth()?.roles?.[0]

    if (!role) {
      return null
    }

    return role.toLowerCase() as UserRole
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken()
  }

  clear(): void {
    localStorage.removeItem(AUTH_KEY)
    this.clearOldKeys()
    this.authSubject.next(null)
  }

  private clearOldKeys(): void {
    localStorage.removeItem('gp_access_token')
    localStorage.removeItem('gp_refresh_token')
    localStorage.removeItem('role')
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('isLoggedIn')
  }
}