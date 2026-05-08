export interface JwtPayload {
  sub: string;
  email: string;
  role: 'USER' | 'HOST' | 'ADMIN';
}
