'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/hooks/use-auth';
import { CountrySelect } from '@/components/forms/country-select';

const inputClass = 'w-full rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none transition-all duration-300 focus:border-[#C8B193]';

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Greece',
    city: '',
    addressLine: '',
    postalCode: '',
    preferredLanguage: 'en',
    password: '',
    termsAccepted: false,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passwordChecks = useMemo(() => [
    { label: 'At least 10 characters', ok: form.password.length >= 10 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(form.password) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(form.password) },
    { label: 'One number', ok: /\d/.test(form.password) },
    { label: 'One symbol, e.g. ! @ #', ok: /[^A-Za-z0-9]/.test(form.password) },
  ], [form.password]);

  const isPasswordStrong = passwordChecks.every((item) => item.ok);

  const handleChange = (key: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong || !form.termsAccepted) return;

    try {
      const result = await registerMutation.mutateAsync(form);
      if (result.verificationRequired) {
        setSuccessMessage(result.message ?? 'Account created. Please verify your email before signing in.');
        return;
      }
      router.push('/dashboard');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.08)] sm:p-10"
      >
        <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Create account</div>
        <h1 className="mt-3 font-serif text-4xl text-[#1F2328]">Join Vayento</h1>
        <p className="mt-4 text-sm leading-8 text-[#5F5A53]">
          Create a complete guest profile so bookings, invoices, support and account security can be handled consistently across the platform.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <input value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} className={inputClass} placeholder="First name" required />
            <input value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} className={inputClass} placeholder="Last name" required />
            <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={`${inputClass} sm:col-span-2`} placeholder="Email address" required />
            <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className={inputClass} placeholder="Phone number" />
            <CountrySelect value={form.country} onChange={(value) => handleChange('country', value)} className={inputClass} required />
            <input value={form.city} onChange={(e) => handleChange('city', e.target.value)} className={inputClass} placeholder="City" />
            <input value={form.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} className={inputClass} placeholder="Postal code" />
            <input value={form.addressLine} onChange={(e) => handleChange('addressLine', e.target.value)} className={`${inputClass} sm:col-span-2`} placeholder="Address line" />
            <select value={form.preferredLanguage} onChange={(e) => handleChange('preferredLanguage', e.target.value)} className={inputClass}>
              <option value="en">English</option>
              <option value="el">Greek</option>
              <option value="it">Italian</option>
            </select>
          </div>

          <div>
            <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} className={inputClass} placeholder="Password" required />
            <div className="mt-3 rounded-[20px] border border-[#E8DED0] bg-white p-4">
              <div className="text-sm font-medium text-[#1F2328]">Password requirements</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {passwordChecks.map((item) => (
                  <div key={item.label} className={`text-sm ${item.ok ? 'text-green-700' : 'text-[#7A726A]'}`}>
                    {item.ok ? '✓' : '•'} {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-[20px] border border-[#E8DED0] bg-white p-4 text-sm leading-7 text-[#5F5A53]">
            <input type="checkbox" checked={form.termsAccepted} onChange={(e) => handleChange('termsAccepted', e.target.checked)} className="mt-1" />
            <span>
              I accept the <Link href="/terms" className="underline">Terms and Conditions</Link>, <Link href="/privacy" className="underline">Privacy Policy</Link> and <Link href="/cookies" className="underline">Cookie Policy</Link>.
            </span>
          </label>

          {successMessage ? <div className="rounded-[18px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div> : null}
          {registerMutation.isError ? <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{(registerMutation.error as any)?.response?.data?.message ?? 'Registration failed. Please review your details and try again.'}</div> : null}

          <button type="submit" disabled={registerMutation.isPending || !isPasswordStrong || !form.termsAccepted} className="w-full rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(31,35,40,0.18)] disabled:opacity-60">
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-sm text-[#6D655D]">Already have an account? <Link href="/login" className="text-[#1F2328] underline underline-offset-4">Sign in</Link></div>
      </motion.div>
    </div>
  );
}
