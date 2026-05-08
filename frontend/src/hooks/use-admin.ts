'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/lib/api/admin.service';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getUsers,
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useUpdateAdminUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useAdminProperties() {
  return useQuery({
    queryKey: ['admin-properties'],
    queryFn: adminService.getProperties,
  });
}

export function useUpdateAdminPropertyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminService.updatePropertyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin-bookings'],
    queryFn: adminService.getBookings,
  });
}

export function useAdminPayments() {
  return useQuery({
    queryKey: ['admin-payments'],
    queryFn: adminService.getPayments,
  });
}

export function useAdminPages() {
  return useQuery({
    queryKey: ['admin-pages'],
    queryFn: adminService.getPages,
  });
}

export function useUpdateAdminPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      adminService.updatePage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
    },
  });
}

export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: adminService.getBlogPosts,
  });
}

export function useCreateAdminBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.createBlogPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useUpdateAdminBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      adminService.updateBlogPost(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useDeleteAdminBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteBlogPost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useAdminSupportInbox() {
  return useQuery({
    queryKey: ['admin-support'],
    queryFn: adminService.getSupportInbox,
  });
}

export function useAdminAuditLogs() {
  return useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: adminService.getAuditLogs,
  });
}

export function useAdminReviews() {
  return useQuery({
    queryKey: ['admin-reviews'],
    queryFn: adminService.getReviews,
  });
}

export function useUpdateAdminReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminService.updateReviewStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useAdminHostLeads() {
  return useQuery({
    queryKey: ['admin-host-leads'],
    queryFn: adminService.getHostLeads,
  });
}