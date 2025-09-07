export interface User {
  id: string;
  role: 'owner' | 'manager';
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  currentBusinessId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
