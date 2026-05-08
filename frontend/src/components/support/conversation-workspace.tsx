'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useConversationMessages,
  useSendMessage,
} from '@/hooks/use-conversations';
import { useAuthStore } from '@/store/auth.store';

export function ConversationWorkspace({
  conversationId,
}: {
  conversationId: string;
}) {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
  } = useConversationMessages(conversationId);

  const sendMutation = useSendMessage(conversationId);

  const [body, setBody] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!data) return;

    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    queryClient.invalidateQueries({ queryKey: ['admin-support-inbox'] });
    queryClient.invalidateQueries({ queryKey: ['admin-support'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
  }, [data, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!body.trim()) return;

    await sendMutation.mutateAsync({
      body: body.trim(),
    });

    setBody('');
  };

  return (
    <div className="rounded-[28px] border border-[#E8DED0] bg-white p-6 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">
            Conversation
          </div>

          <h2 className="mt-2 text-2xl font-semibold text-[#1F2328]">
            Messages
          </h2>
        </div>

        <div className="rounded-full bg-[#FCFBF9] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#8A7660]">
          Live thread
        </div>
      </div>

      <div className="mt-6 max-h-[520px] space-y-4 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-sm text-[#6B645C]">Loading messages...</div>
        ) : null}

        {isError ? (
          <div className="rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load messages.
          </div>
        ) : null}

        {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
          <div className="rounded-[18px] border border-[#E8DED0] bg-[#FCFBF9] px-4 py-3 text-sm text-[#6B645C]">
            No messages in this conversation yet.
          </div>
        ) : null}

        {(data ?? []).map((message: any) => {
          const isMine = message.senderUser?.id === currentUser?.id;

          return (
            <div
              key={message.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] rounded-[22px] border px-4 py-4 ${
                  isMine
                    ? 'border-[#1F2328] bg-[#1F2328] text-white'
                    : 'border-[#E8DED0] bg-[#FCFBF9] text-[#1F2328]'
                }`}
              >
                <div
                  className={`text-sm font-semibold ${
                    isMine ? 'text-white' : 'text-[#1F2328]'
                  }`}
                >
                  {message.senderUser?.firstName}{' '}
                  {message.senderUser?.lastName}
                </div>

                <div
                  className={`mt-1 text-xs ${
                    isMine ? 'text-white/60' : 'text-[#8A7660]'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleString()}
                </div>

                <p
                  className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${
                    isMine ? 'text-white/85' : 'text-[#5F5A53]'
                  }`}
                >
                  {message.body}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write your message"
          className="min-h-[120px] w-full rounded-[18px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-3 outline-none"
        />

        <button
          type="submit"
          disabled={sendMutation.isPending || !body.trim()}
          className="rounded-full bg-[#1F2328] px-5 py-3 text-sm text-white disabled:opacity-60"
        >
          {sendMutation.isPending ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </div>
  );
}