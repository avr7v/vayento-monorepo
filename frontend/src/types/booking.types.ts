export interface BookingQuotePayload { propertyId: string; checkInDate: string; checkOutDate: string; guestsCount: number; }
export interface BookingQuoteResponse { propertyId: string; nights: number; currency: string; breakdown: { subtotal: string; cleaningFee: string; serviceFee: string; taxes: string; totalAmount: string; }; }
export interface CreateBookingPayload { propertyId: string; checkInDate: string; checkOutDate: string; guestsCount: number; firstName: string; lastName: string; email: string; phone?: string; country?: string; city?: string; specialRequests?: string; }
export interface CreatePaymentIntentPayload { bookingId: string; }

export interface CreatePaymentIntentResponse { clientSecret: string | null; paymentId: string; mode: 'stripe' | 'mock'; bookingId: string; }
