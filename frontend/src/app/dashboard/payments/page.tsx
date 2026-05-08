'use client';

import { motion } from 'framer-motion';
import { useMyPayments } from '@/hooks/use-payments';

export default function DashboardPaymentsPage() {
  const { data, isLoading, isError } = useMyPayments();

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Payments history</div>
          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">Transactions</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5F5A53]">Review payment activity linked to your stays and booking confirmations.</p>

          {isLoading ? (
            <div className="mt-8 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-[22px] bg-[#F6F1EA]" />)}
            </div>
          ) : null}

          {isError ? <div className="mt-8 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load payments.</div> : null}

          {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
            <div className="mt-8 rounded-[22px] border border-[#E8DED0] bg-[#FCFBF9] px-5 py-6 text-sm text-[#6B645C]">No payments are available yet.</div>
          ) : null}

          <div className="mt-8 space-y-4">
            {(data ?? []).map((payment: any) => (
              <div key={payment.id} className="rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(31,35,40,0.06)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[#1F2328]">{payment.booking?.property?.title || 'Property booking'}</div>
                    <div className="mt-2 text-sm text-[#6B645C]">Booking reference: {payment.bookingId}</div>
                    <div className="mt-1 text-sm text-[#6B645C]">Payment reference: {payment.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-3xl text-[#1F2328]">€{Number(payment.amount).toFixed(2)}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8A7660]">{payment.paymentStatus}</div>
                    <div className="mt-2 text-sm text-[#6B645C]">{payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
