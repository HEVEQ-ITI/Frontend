export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  userName: string
  email: string
  phoneNumber: string
  password: string
  role: 'Customer' | 'Provider'
}

export interface AuthResponse {
  succeeded: boolean
  profileCompleted: boolean
  displayName: string
  isAuthenticated: boolean
  isEmailConfirmed: boolean
  requiresEmailConfirmation: boolean
  emailConfirmationSent: boolean
  message: string
  accessToken: string
  refreshToken: string
  expiresAt: string
  userId: string
  userName: string
  email: string
  roles: string[]
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface CurrentUserResponse {
  id: string
  displayName: string
  email: string
  phoneNumber: string
  role: string
  isActive: boolean
  profileCompleted: boolean
  trustScore?: number | null
  dashboardUrl?: string | null
}

export interface ConfirmEmailRequest {
  userId: string
  token: string
}

export interface ResendConfirmationEmailRequest {
  email: string
}

export type UserRole = 'customer' | 'provider' | 'admin' | 'employee'