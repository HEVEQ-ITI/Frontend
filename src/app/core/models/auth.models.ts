export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  isAuthenticated: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  userName: string;
  email: string;
  roles: string[];
}

export type UserRole = 'customer' | 'provider' | 'admin' | 'employee';
