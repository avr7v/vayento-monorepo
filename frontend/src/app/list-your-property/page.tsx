'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { http } from '@/lib/api/http';
import { CountrySelect } from '@/components/forms/country-select';

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const inputClass =
  'rounded-[20px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-4 outline-none transition-all duration-300 focus:border-[#CDB89C]';

const selectClass =
  'rounded-[20px] border border-[#E7DED1] bg-white px-4 py-4 outline-none transition-all duration-300 focus:border-[#CDB89C]';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  preferredContactMethod: '',
  propertyName: '',
  propertyCity: '',
  propertyCountry: 'Greece',
  propertyRegion: '',
  propertyAddress: '',
  propertyType: '',
  bedrooms: '',
  bathrooms: '',
  maxGuests: '',
  estimatedNightlyRate: '',
  availabilityStatus: '',
  currentListingUrl: '',
  message: '',
};

const benefits = [
  {
    title: 'Elevated presentation',
    body: 'Position your property through a refined visual identity designed to support premium hospitality standards.',
  },
  {
    title: 'Operational clarity',
    body: 'Manage listing details, availability, reservations and guest activity through a cleaner digital workflow.',
  },
  {
    title: 'Conversion-focused journeys',
    body: 'Turn attention into bookings with clear guest flows, polished trust signals and elegant booking experiences.',
  },
];

type HostLeadForm = typeof initialForm;

export default function ListYourPropertyPage() {
  const [form, setForm] = useState<HostLeadForm>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof HostLeadForm, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (key: keyof HostLeadForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof HostLeadForm, string>> = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = 'First name is required.';
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = 'Last name is required.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!form.propertyName.trim()) {
      nextErrors.propertyName = 'Property name is required.';
    }

    if (!form.propertyType.trim()) {
      nextErrors.propertyType = 'Property type is required.';
    }

    if (!form.propertyCountry.trim()) {
      nextErrors.propertyCountry = 'Country is required.';
    }

    if (!form.propertyCity.trim()) {
      nextErrors.propertyCity = 'City is required.';
    }

    if (!form.message.trim()) {
      nextErrors.message = 'Please add a short message.';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitted(false);
    setSubmitError(null);

    if (!validate()) {
      setSubmitError('Please fix the highlighted fields and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      await http.post('/host-leads', {
        ...form,
        email: form.email.trim().toLowerCase(),
      });

      setIsSubmitted(true);
      setForm(initialForm);
      setErrors({});
    } catch (error: any) {
      const message = error?.response?.data?.message;

      setSubmitError(
        Array.isArray(message)
          ? message.join(' ')
          : message ?? 'Submission failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldError = (key: keyof HostLeadForm) =>
    errors[key] ? (
      <p className="mt-2 text-xs leading-5 text-red-600">{errors[key]}</p>
    ) : null;

  return (
    <main className="bg-white text-[#1F2328]">
      <section className="relative overflow-hidden border-b border-[#E8DED0] bg-[linear-gradient(135deg,#efe4d2_0%,#f7f4ee_46%,#e2cfb3_100%)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-10%] top-[-15%] h-[26rem] w-[26rem] rounded-full bg-white/45 blur-3xl" />
          <div className="absolute bottom-[-15%] right-[-5%] h-[22rem] w-[22rem] rounded-full bg-[#dac6aa]/45 blur-3xl" />
        </div>

        <div className="mx-auto grid min-h-[76vh] max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative z-10"
          >
            <motion.div
              variants={fadeUp}
              className="text-xs uppercase tracking-[0.32em] text-[#8A7660]"
            >
              Owner partnerships · Premium positioning · Modern hosting
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-5 max-w-4xl font-serif text-5xl leading-[1.03] text-[#1F2328] md:text-7xl"
            >
              Present your property with the elegance today’s guests expect.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-8 text-[#5F5A53]"
            >
              Vayento helps owners and hospitality professionals showcase premium
              stays through elevated presentation, smoother booking journeys and
              practical host-side control.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <a
                href="#host-interest-form"
                className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,35,40,0.18)]"
              >
                Submit your property
              </a>

              <Link
                href="/properties"
                className="rounded-full border border-[#1F2328] bg-white/60 px-6 py-4 text-sm font-medium text-[#1F2328] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1F2328] hover:text-white"
              >
                View the platform
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.985, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{
              duration: 0.85,
              delay: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10"
          >
            <div className="rounded-[34px] border border-[#E8DED0] bg-white/80 p-8 shadow-[0_22px_60px_rgba(31,35,40,0.08)] backdrop-blur-md sm:p-10">
              <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                Why owners choose Vayento
              </div>

              <h2 className="mt-4 font-serif text-3xl leading-tight text-[#1F2328] sm:text-4xl">
                A refined digital presence for high-quality stays.
              </h2>

              <p className="mt-5 text-sm leading-8 text-[#5F5A53] sm:text-[15px]">
                We combine premium brand presentation with practical host tools,
                giving your property a stronger online identity while keeping
                day-to-day management clear and efficient.
              </p>

              <div className="mt-7 space-y-4">
                <div className="rounded-[22px] border border-[#EFE5D7] bg-[#FCFBF9] p-5">
                  <div className="text-sm font-semibold text-[#1F2328]">
                    Stronger first impressions
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[#5F5A53]">
                    Elegant property presentation helps guests understand value
                    faster and engage with more confidence.
                  </p>
                </div>

                <div className="rounded-[22px] border border-[#EFE5D7] bg-[#FCFBF9] p-5">
                  <div className="text-sm font-semibold text-[#1F2328]">
                    Better operational visibility
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[#5F5A53]">
                    Listing information, reservation flow and host-side actions
                    stay organised inside a clear management surface.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.14 }}
        >
          <motion.div variants={fadeUp} className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.26em] text-[#8A7660]">
              Host benefits
            </div>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#1F2328]">
              Built for owners who want both presentation and control.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {benefits.map((item) => (
              <motion.article
                key={item.title}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                className="rounded-[30px] border border-[#E8DED0] bg-white p-8 shadow-[0_10px_30px_rgba(31,35,40,0.03)] transition-all duration-300 hover:shadow-[0_22px_46px_rgba(31,35,40,0.08)]"
              >
                <div className="text-xs uppercase tracking-[0.22em] text-[#8A7660]">
                  Benefit
                </div>
                <h3 className="mt-4 font-serif text-2xl leading-tight text-[#1F2328]">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-8 text-[#5F5A53]">
                  {item.body}
                </p>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="border-y border-[#E8DED0] bg-[#FBFAF7]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[32px] border border-[#E8DED0] bg-[linear-gradient(180deg,#f2e8da_0%,#efe4d2_100%)] p-8 shadow-[0_16px_40px_rgba(31,35,40,0.05)]"
          >
            <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
              Operational support
            </div>
            <div className="mt-4 font-serif text-4xl leading-tight text-[#1F2328]">
              From listing presentation to reservation oversight, every step
              feels more intentional.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{
              duration: 0.65,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="max-w-3xl text-base leading-9 text-[#5F5A53]">
              Vayento supports owners with listing control, availability
              handling, reservation visibility, earnings awareness and a booking
              experience that feels trustworthy from first click to confirmation.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[#E8DED0] bg-white p-5">
                <div className="text-sm font-semibold text-[#1F2328]">
                  Listing quality
                </div>
                <p className="mt-2 text-sm leading-7 text-[#5F5A53]">
                  Present your stay through a cleaner, more premium digital
                  frame.
                </p>
              </div>

              <div className="rounded-[24px] border border-[#E8DED0] bg-white p-5">
                <div className="text-sm font-semibold text-[#1F2328]">
                  Reservation clarity
                </div>
                <p className="mt-2 text-sm leading-7 text-[#5F5A53]">
                  Keep visibility over guest flows, status changes and hosting
                  operations.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="host-interest-form"
        className="mx-auto max-w-7xl px-4 py-16 md:py-20"
      >
        <div className="grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10"
          >
            <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
              Host interest
            </div>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#1F2328]">
              Tell us about your property.
            </h2>

            <p className="mt-5 text-sm leading-8 text-[#5F5A53]">
              Share your contact details, property profile and commercial
              expectations so the admin team can review your application.
            </p>

            <div className="mt-8 rounded-[24px] border border-[#EFE5D7] bg-[#FCFBF9] p-6">
              <div className="text-sm font-semibold text-[#1F2328]">
                What happens next
              </div>

              <ul className="mt-4 space-y-3 text-sm leading-7 text-[#5F5A53]">
                <li>• We review your submission and property positioning.</li>
                <li>• We assess fit for premium hospitality presentation.</li>
                <li>• We contact you with the next onboarding step.</li>
              </ul>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.14 }}
            transition={{
              duration: 0.65,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            onSubmit={handleSubmit}
            noValidate
            className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10"
          >
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                Owner details
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <input
                    value={form.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="First name *"
                    className={`${inputClass} w-full ${
                      errors.firstName ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {fieldError('firstName')}
                </div>

                <div>
                  <input
                    value={form.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Last name *"
                    className={`${inputClass} w-full ${
                      errors.lastName ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {fieldError('lastName')}
                </div>

                <div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="Email *"
                    className={`${inputClass} w-full ${
                      errors.email ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {fieldError('email')}
                </div>

                <input
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Phone"
                  className={inputClass}
                />

                <select
                  value={form.preferredContactMethod}
                  onChange={(e) =>
                    handleChange('preferredContactMethod', e.target.value)
                  }
                  className={selectClass}
                >
                  <option value="">Preferred contact method</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                Property details
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <input
                    value={form.propertyName}
                    onChange={(e) => handleChange('propertyName', e.target.value)}
                    placeholder="Property name *"
                    className={`${inputClass} w-full ${
                      errors.propertyName ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {fieldError('propertyName')}
                </div>

                <div>
                  <select
                    value={form.propertyType}
                    onChange={(e) => handleChange('propertyType', e.target.value)}
                    className={`${selectClass} w-full ${
                      errors.propertyType ? 'border-red-300 bg-red-50' : ''
                    }`}
                  >
                    <option value="">Property type *</option>
                    <option value="Villa">Villa</option>
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Suite">Suite</option>
                    <option value="Maisonette">Maisonette</option>
                    <option value="Estate">Estate</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldError('propertyType')}
                </div>

                <div>
                  <CountrySelect
                    value={form.propertyCountry}
                    onChange={(value) => handleChange('propertyCountry', value)}
                    className={`${selectClass} w-full ${
                      errors.propertyCountry ? 'border-red-300 bg-red-50' : ''
                    }`}
                    placeholder="Property country *"
                    required
                  />
                  {fieldError('propertyCountry')}
                </div>

                <input
                  value={form.propertyRegion}
                  onChange={(e) => handleChange('propertyRegion', e.target.value)}
                  placeholder="Region / island"
                  className={inputClass}
                />

                <div>
                  <input
                    value={form.propertyCity}
                    onChange={(e) => handleChange('propertyCity', e.target.value)}
                    placeholder="Property city *"
                    className={`${inputClass} w-full ${
                      errors.propertyCity ? 'border-red-300 bg-red-50' : ''
                    }`}
                  />
                  {fieldError('propertyCity')}
                </div>

                <input
                  value={form.propertyAddress}
                  onChange={(e) => handleChange('propertyAddress', e.target.value)}
                  placeholder="Property address"
                  className={`${inputClass} sm:col-span-2`}
                />
              </div>
            </div>

            <div className="mt-8">
              <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
                Capacity and commercial info
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(e) => handleChange('bedrooms', e.target.value)}
                  placeholder="Bedrooms"
                  className={inputClass}
                />

                <input
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={(e) => handleChange('bathrooms', e.target.value)}
                  placeholder="Bathrooms"
                  className={inputClass}
                />

                <input
                  type="number"
                  min="1"
                  value={form.maxGuests}
                  onChange={(e) => handleChange('maxGuests', e.target.value)}
                  placeholder="Max guests"
                  className={inputClass}
                />

                <input
                  type="number"
                  min="0"
                  value={form.estimatedNightlyRate}
                  onChange={(e) =>
                    handleChange('estimatedNightlyRate', e.target.value)
                  }
                  placeholder="Nightly rate €"
                  className={inputClass}
                />

                <select
                  value={form.availabilityStatus}
                  onChange={(e) =>
                    handleChange('availabilityStatus', e.target.value)
                  }
                  className={`${selectClass} lg:col-span-2`}
                >
                  <option value="">Availability status</option>
                  <option value="Available soon">Available soon</option>
                  <option value="Already operating">Already operating</option>
                  <option value="Needs onboarding">Needs onboarding</option>
                  <option value="Seasonal availability">Seasonal availability</option>
                </select>

                <input
                  value={form.currentListingUrl}
                  onChange={(e) =>
                    handleChange('currentListingUrl', e.target.value)
                  }
                  placeholder="Current listing URL"
                  className={`${inputClass} lg:col-span-2`}
                />
              </div>
            </div>

            <div className="mt-8">
              <div>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Short message *"
                  className={`min-h-[150px] w-full rounded-[20px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-4 outline-none transition-all duration-300 focus:border-[#CDB89C] ${
                    errors.message ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {fieldError('message')}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,35,40,0.18)] disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit interest'}
              </button>

              <span className="text-sm text-[#7A726A]">
                Required fields are marked with *.
              </span>
            </div>

            {submitError ? (
              <div className="mt-6 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm leading-7 text-red-700">
                {submitError}
              </div>
            ) : null}

            {isSubmitted ? (
              <div className="mt-6 rounded-[20px] border border-[#E8DED0] bg-[#F8F4EE] px-5 py-4 text-sm leading-7 text-[#5F5A53]">
                Thank you for your interest. Your details were submitted
                successfully and the admin team has been notified.
              </div>
            ) : null}
          </motion.form>
        </div>
      </section>

      <section className="border-y border-[#E8DED0] bg-[#FBFAF7]">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10"
          >
            <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
              Trust
            </div>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#1F2328]">
              A platform approach shaped by hospitality standards, not shortcuts.
            </h2>

            <p className="mt-5 max-w-4xl text-base leading-9 text-[#5F5A53]">
              Vayento is built around clarity, premium presentation and smoother
              guest-host journeys. Our goal is not simply visibility, but a more
              considered experience for owners who want their property positioned
              with confidence and professionalism.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[36px] border border-[#E8DED0] bg-[linear-gradient(135deg,#efe4d2_0%,#f7f4ee_50%,#e5d4bc_100%)] p-8 shadow-[0_20px_50px_rgba(31,35,40,0.06)] sm:p-12"
        >
          <div className="max-w-4xl">
            <div className="text-xs uppercase tracking-[0.28em] text-[#8A7660]">
              Closing invitation
            </div>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#1F2328] sm:text-5xl">
              Bring your property into a more polished hospitality environment.
            </h2>

            <p className="mt-5 text-base leading-9 text-[#5F5A53]">
              If your property deserves a stronger digital presentation and a
              more intentional hosting workflow, Vayento is built to support the
              next step.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#host-interest-form"
                className="rounded-full bg-[#1F2328] px-6 py-4 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,35,40,0.18)]"
              >
                Start application
              </a>

              <Link
                href="/properties"
                className="rounded-full border border-[#1F2328] bg-white/60 px-6 py-4 text-sm font-medium text-[#1F2328] transition-all duration-300 hover:-translate-y-1 hover:bg-[#1F2328] hover:text-white"
              >
                Explore stays
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}