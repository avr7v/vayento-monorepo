'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAdminSupportInbox } from '@/hooks/use-conversations';
import { ConversationWorkspace } from '@/components/support/conversation-workspace';
import { useAuthStore } from '@/store/auth.store';

function getParticipantNames(conversation: any) {
  return (conversation.participants ?? [])
    .map((participant: any) => {
      const firstName = participant.user?.firstName ?? '';
      const lastName = participant.user?.lastName ?? '';

      return `${firstName} ${lastName}`.trim();
    })
    .filter(Boolean)
    .join(', ');
}

function getUnreadCount(conversation: any, currentUserId?: string) {
  if (typeof conversation.unreadCount === 'number') {
    return conversation.unreadCount;
  }

  return (conversation.messages ?? []).filter((message: any) => {
    const senderId = message.senderUser?.id ?? message.senderUserId;

    return !message.readAt && senderId !== currentUserId;
  }).length;
}

function hasUnreadMessages(conversation: any, currentUserId?: string) {
  return getUnreadCount(conversation, currentUserId) > 0;
}

export default function AdminSupportPage() {
  const currentUser = useAuthStore((state) => state.user);

  const {
    data,
    isLoading,
    isError,
  } = useAdminSupportInbox();

  const conversations = useMemo(() => data ?? [], [data]);

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation: any) => conversation.id === selectedConversationId,
      ),
    [conversations, selectedConversationId],
  );

  const totalUnread = useMemo(() => {
    return conversations.reduce((total: number, conversation: any) => {
      return total + getUnreadCount(conversation, currentUser?.id);
    }, 0);
  }, [conversations, currentUser?.id]);

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] sm:p-10">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Admin support
          </div>

          <h1 className="mt-3 font-serif text-5xl text-[#1F2328]">
            Support inbox
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5F5A53]">
            Open support conversations, read user messages and reply directly
            from the admin workspace.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex rounded-full border border-[#1F2328] px-4 py-2 text-sm transition hover:bg-[#1F2328] hover:text-white"
            >
              Back to admin dashboard
            </Link>

            <div className="inline-flex rounded-full bg-[#1F2328] px-4 py-2 text-sm text-white">
              {totalUnread > 0
                ? `${totalUnread} unread message${totalUnread === 1 ? '' : 's'}`
                : 'No unread messages'}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 text-sm text-[#6B645C]">
              Loading support inbox...
            </div>
          ) : null}

          {isError ? (
            <div className="mt-8 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
              Failed to load support inbox.
            </div>
          ) : null}
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="rounded-[34px] border border-[#E8DED0] bg-white p-6 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[#1F2328]">
                Threads
              </h2>

              <span className="rounded-full bg-[#FCFBF9] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#8A7660]">
                {conversations.length}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {conversations.map((conversation: any) => {
                const latestMessage = conversation.messages?.[0];
                const isSelected = conversation.id === selectedConversationId;
                const unread = hasUnreadMessages(
                  conversation,
                  currentUser?.id,
                );
                const unreadCount = getUnreadCount(
                  conversation,
                  currentUser?.id,
                );

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={`w-full rounded-[22px] border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(31,35,40,0.08)] ${
                      isSelected
                        ? 'border-[#1F2328] bg-[#1F2328] text-white'
                        : unread
                          ? 'border-red-200 bg-red-50'
                          : 'border-[#E8DED0] bg-[#FCFBF9]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div
                          className={`text-sm font-semibold ${
                            isSelected ? 'text-white' : 'text-[#1F2328]'
                          }`}
                        >
                          Support thread
                        </div>

                        <div
                          className={`mt-2 text-xs leading-5 ${
                            isSelected ? 'text-white/70' : 'text-[#6B645C]'
                          }`}
                        >
                          {getParticipantNames(conversation) ||
                            'No participants'}
                        </div>
                      </div>

                      {unread ? (
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                            isSelected
                              ? 'bg-white text-[#1F2328]'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {unreadCount} new
                        </span>
                      ) : (
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                            isSelected
                              ? 'bg-white/10 text-white/70'
                              : 'bg-white text-[#8A7660]'
                          }`}
                        >
                          {conversation.type}
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-4 max-h-14 overflow-hidden text-sm leading-7 ${
                        isSelected ? 'text-white/75' : 'text-[#5F5A53]'
                      }`}
                    >
                      {latestMessage?.body ?? 'No message preview available.'}
                    </p>
                  </button>
                );
              })}

              {!isLoading && conversations.length === 0 ? (
                <div className="rounded-[22px] border border-[#E8DED0] bg-[#FCFBF9] p-5 text-sm text-[#5F5A53]">
                  No support messages yet.
                </div>
              ) : null}
            </div>
          </aside>

          <main>
            {selectedConversationId ? (
              <ConversationWorkspace conversationId={selectedConversationId} />
            ) : (
              <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 text-sm text-[#5F5A53] shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
                Select a support thread to read and reply.
              </div>
            )}

            {selectedConversation ? (
              <div className="mt-5 rounded-[24px] border border-[#E8DED0] bg-[#FCFBF9] p-5 text-sm leading-7 text-[#5F5A53]">
                <div className="font-semibold text-[#1F2328]">
                  Conversation details
                </div>

                <div className="mt-2">
                  Participants: {getParticipantNames(selectedConversation)}
                </div>

                <div>Type: {selectedConversation.type}</div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}