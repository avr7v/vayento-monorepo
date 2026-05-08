export const SAFE_USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  role: true,
  isEmailVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const SAFE_USER_WITH_PROFILE_SELECT = {
  ...SAFE_USER_SELECT,
  profile: true,
} as const;

export function toSafeUser<T extends Record<string, any> | null | undefined>(user: T) {
  if (!user) return user;
  const {
    passwordHash,
    emailVerificationTokenHash,
    emailVerificationExpiresAt,
    passwordResetTokenHash,
    passwordResetExpiresAt,
    refreshTokenHash,
    refreshTokenExpiresAt,
    failedLoginCount,
    lockedUntil,
    ...safe
  } = user as Record<string, any>;
  return safe;
}
