'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationsService } from '@/lib/api/conversations.service';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: conversationsService.getMine,
  });
}

export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: () => conversationsService.getMessages(conversationId),
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: conversationsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
    },
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { body: string }) =>
      conversationsService.sendMessage(conversationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['conversation-messages', conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useMarkConversationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationsService.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });
}

export function useAdminSupportInbox() {
  return useQuery({
    queryKey: ['admin-support-inbox'],
    queryFn: conversationsService.getAdminSupportInbox,
  });
}