export function getBookingSearchParams(searchParams: { propertyId?: string; checkInDate?: string; checkOutDate?: string; guestsCount?: string; }) {
  return {
    propertyId: searchParams.propertyId || '',
    checkInDate: searchParams.checkInDate || '',
    checkOutDate: searchParams.checkOutDate || '',
    guestsCount: Number(searchParams.guestsCount || 1),
  };
}
