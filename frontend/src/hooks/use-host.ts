'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hostService } from '@/lib/api/host.service';

export function useHostDashboard() { return useQuery({ queryKey: ['host-dashboard'], queryFn: hostService.getDashboard }); }
export function useHostProperties() { return useQuery({ queryKey: ['host-properties'], queryFn: hostService.getProperties }); }
export function useHostProperty(propertyId: string) { return useQuery({ queryKey: ['host-property', propertyId], queryFn: () => hostService.getProperty(propertyId), enabled: !!propertyId }); }
export function useCreateHostProperty() { const qc = useQueryClient(); return useMutation({ mutationFn: hostService.createProperty, onSuccess: () => { qc.invalidateQueries({ queryKey: ['host-properties'] }); qc.invalidateQueries({ queryKey: ['host-dashboard'] }); } }); }
export function useUpdateHostProperty() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: unknown }) => hostService.updateProperty(id, payload), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: ['host-properties'] }); qc.invalidateQueries({ queryKey: ['host-property', variables.id] }); qc.invalidateQueries({ queryKey: ['host-dashboard'] }); } }); }
export function useSubmitHostPropertyForReview() { const qc = useQueryClient(); return useMutation({ mutationFn: hostService.submitPropertyForReview, onSuccess: (_data, propertyId) => { qc.invalidateQueries({ queryKey: ['host-properties'] }); qc.invalidateQueries({ queryKey: ['host-property', propertyId] }); qc.invalidateQueries({ queryKey: ['host-dashboard'] }); } }); }
export function useDeleteHostProperty() { const qc = useQueryClient(); return useMutation({ mutationFn: hostService.deleteProperty, onSuccess: () => { qc.invalidateQueries({ queryKey: ['host-properties'] }); qc.invalidateQueries({ queryKey: ['host-dashboard'] }); } }); }
export function useHostAvailability(propertyId: string) { return useQuery({ queryKey: ['host-availability', propertyId], queryFn: () => hostService.getAvailability(propertyId), enabled: !!propertyId }); }
export function useUpdateHostAvailability(propertyId: string) { const qc = useQueryClient(); return useMutation({ mutationFn: (payload: unknown) => hostService.updateAvailability(propertyId, payload), onSuccess: () => { qc.invalidateQueries({ queryKey: ['host-availability', propertyId] }); } }); }
export function useHostBookings() { return useQuery({ queryKey: ['host-bookings'], queryFn: hostService.getBookings }); }
export function useHostBooking(bookingId: string) { return useQuery({ queryKey: ['host-booking', bookingId], queryFn: () => hostService.getBooking(bookingId), enabled: !!bookingId }); }
export function useUpdateHostBookingStatus() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => hostService.updateBookingStatus(id, { status }), onSuccess: (_data, variables) => { qc.invalidateQueries({ queryKey: ['host-bookings'] }); qc.invalidateQueries({ queryKey: ['host-booking', variables.id] }); qc.invalidateQueries({ queryKey: ['host-dashboard'] }); qc.invalidateQueries({ queryKey: ['host-earnings-summary'] }); qc.invalidateQueries({ queryKey: ['host-earnings-bookings'] }); } }); }
export function useHostEarningsSummary() { return useQuery({ queryKey: ['host-earnings-summary'], queryFn: hostService.getEarningsSummary }); }
export function useHostEarningsBookings() { return useQuery({ queryKey: ['host-earnings-bookings'], queryFn: hostService.getEarningsBookings }); }
