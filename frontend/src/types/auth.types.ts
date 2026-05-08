export type UserRole = 'USER' | 'HOST' | 'ADMIN';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  isEmailVerified?: boolean;
  profile?: {
    country?: string | null;
    city?: string | null;
    addressLine?: string | null;
    postalCode?: string | null;
    bio?: string | null;
    preferredLanguage?: string | null;
  } | null;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  verificationRequired?: boolean;
  message?: string;
  user: AuthUser;
}

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  country?: string;
  city?: string;
  addressLine?: string;
  postalCode?: string;
  preferredLanguage?: string;
  termsAccepted: boolean;
}
export interface ForgotPasswordPayload { email: string; }
export interface ResetPasswordPayload { token: string; password: string; }
export interface ResendVerificationPayload { email: string; }
