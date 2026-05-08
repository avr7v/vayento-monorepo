'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersService } from '@/lib/api/users.service';
import { useAuthStore } from '@/store/auth.store';
import { setStoredUser } from '@/lib/auth/auth-storage';
import { CountrySelect } from '@/components/forms/country-select';

const inputClass = 'rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none';

export default function DashboardSettingsPage() {
  const storeUser = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  const {
    data: profile,
    isLoading: isProfileLoading,
  } = useQuery({
    queryKey: ['me-profile'],
    queryFn: usersService.getProfile,
  });

  const user = profile ?? storeUser;

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    city: '',
    addressLine: '',
    postalCode: '',
    bio: '',
    preferredLanguage: 'en',
  });

  const [email, setEmail] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [deleteForm, setDeleteForm] = useState({
    password: '',
    reason: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: user.phone ?? '',
      country: (user as any).profile?.country ?? '',
      city: (user as any).profile?.city ?? '',
      addressLine: (user as any).profile?.addressLine ?? '',
      postalCode: (user as any).profile?.postalCode ?? '',
      bio: (user as any).profile?.bio ?? '',
      preferredLanguage: (user as any).profile?.preferredLanguage ?? 'en',
    });

    setEmail(user.email ?? '');
  }, [user]);

  const runAction = async (
    action: string,
    callback: () => Promise<any>,
    success: string,
  ) => {
    setLoading(action);
    setError('');
    setMessage('');

    try {
      const result = await callback();

      if (result?.id) {
        setStoredUser(result);
        setAuth({ user: result });
      }

      setMessage(success);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ??
          'The action failed. Please check your input and try again.',
      );
    } finally {
      setLoading(null);
    }
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();

    return runAction(
      'profile',
      () => usersService.updateProfile({ ...profileForm }),
      'Profile updated successfully.',
    );
  };

  const saveEmail = (event: FormEvent) => {
    event.preventDefault();

    return runAction(
      'email',
      () => usersService.updateEmail({ email }),
      'Email updated. Verification may be required before sensitive actions.',
    );
  };

  const savePassword = (event: FormEvent) => {
    event.preventDefault();

    if (
      passwordForm.newPassword.length < 10 ||
      !/[A-Z]/.test(passwordForm.newPassword) ||
      !/[a-z]/.test(passwordForm.newPassword) ||
      !/\d/.test(passwordForm.newPassword) ||
      !/[^A-Za-z0-9]/.test(passwordForm.newPassword)
    ) {
      setError(
        'New password must have at least 10 characters, uppercase, lowercase, number and symbol.',
      );
      return;
    }

    return runAction(
      'password',
      () => usersService.changePassword(passwordForm),
      'Password changed successfully. Please sign in again.',
    );
  };

  const deactivate = async (event: FormEvent) => {
    event.preventDefault();

    if (!confirm('This will deactivate your account. Continue?')) return;

    await runAction(
      'delete',
      () => usersService.deactivateAccount(deleteForm),
      'Account deactivated.',
    );

    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Account settings
          </div>

          <h1 className="mt-3 text-5xl font-semibold text-[#1F2328]">
            Manage your profile
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-[#5F5A53]">
            Your current account data is preloaded below, so you can clearly see
            what you are changing before saving.
          </p>

          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-full border border-[#1F2328] px-4 py-2 text-sm"
          >
            Back to dashboard
          </Link>

          {isProfileLoading ? (
            <div className="mt-6 text-sm text-[#8A7660]">
              Loading saved profile data...
            </div>
          ) : null}

          {message ? (
            <div className="mt-6 rounded-[18px] bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>

        <form
          onSubmit={saveProfile}
          className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10"
        >
          <h2 className="text-3xl font-semibold text-[#1F2328]">
            Profile information
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              value={profileForm.firstName}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              placeholder="First name"
              className={inputClass}
            />

            <input
              value={profileForm.lastName}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
              placeholder="Last name"
              className={inputClass}
            />

            <input
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="Phone"
              className={inputClass}
            />

            <CountrySelect
              value={profileForm.country}
              onChange={(value) =>
                setProfileForm((prev) => ({
                  ...prev,
                  country: value,
                }))
              }
              className={inputClass}
            />

            <input
              value={profileForm.city}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  city: e.target.value,
                }))
              }
              placeholder="City"
              className={inputClass}
            />

            <input
              value={profileForm.postalCode}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  postalCode: e.target.value,
                }))
              }
              placeholder="Postal code"
              className={inputClass}
            />

            <input
              value={profileForm.addressLine}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  addressLine: e.target.value,
                }))
              }
              placeholder="Address line"
              className={`${inputClass} md:col-span-2`}
            />

            <select
              value={profileForm.preferredLanguage}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  preferredLanguage: e.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="en">English</option>
              <option value="el">Greek</option>
              <option value="it">Italian</option>
            </select>

            <textarea
              value={profileForm.bio}
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  bio: e.target.value,
                }))
              }
              placeholder="Short bio / preferences"
              className="min-h-[120px] rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none md:col-span-2"
            />
          </div>

          <button
            disabled={loading === 'profile'}
            className="mt-6 rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading === 'profile' ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <div className="grid gap-8 lg:grid-cols-2">
          <form
            onSubmit={saveEmail}
            className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]"
          >
            <h2 className="text-2xl font-semibold">Email</h2>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-5 w-full ${inputClass}`}
            />

            <button
              disabled={loading === 'email'}
              className="mt-5 rounded-full bg-[#1F2328] px-5 py-3 text-sm text-white disabled:opacity-60"
            >
              {loading === 'email' ? 'Updating...' : 'Update email'}
            </button>
          </form>

          <form
            onSubmit={savePassword}
            className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]"
          >
            <h2 className="text-2xl font-semibold">Password</h2>

            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              placeholder="Current password"
              className={`mt-5 w-full ${inputClass}`}
            />

            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              placeholder="New password"
              className={`mt-4 w-full ${inputClass}`}
            />

            <p className="mt-3 text-xs leading-6 text-[#7A726A]">
              Use 10+ characters with uppercase, lowercase, number and symbol.
            </p>

            <button
              disabled={loading === 'password'}
              className="mt-5 rounded-full bg-[#1F2328] px-5 py-3 text-sm text-white disabled:opacity-60"
            >
              {loading === 'password' ? 'Changing...' : 'Change password'}
            </button>
          </form>
        </div>

        <form
          onSubmit={deactivate}
          className="rounded-[34px] border border-red-200 bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]"
        >
          <h2 className="text-2xl font-semibold text-red-700">
            Deactivate account
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#5F5A53]">
            This disables login and access while keeping historical bookings for
            accounting and audit integrity.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              type="password"
              value={deleteForm.password}
              onChange={(e) =>
                setDeleteForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              placeholder="Confirm password"
              className={inputClass}
            />

            <input
              value={deleteForm.reason}
              onChange={(e) =>
                setDeleteForm((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              placeholder="Reason (optional)"
              className={inputClass}
            />
          </div>

          <button
            disabled={loading === 'delete'}
            className="mt-5 rounded-full bg-red-700 px-5 py-3 text-sm text-white disabled:opacity-60"
          >
            {loading === 'delete' ? 'Deactivating...' : 'Deactivate account'}
          </button>
        </form>
      </div>
    </div>
  );
}