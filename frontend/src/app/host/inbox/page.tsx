'use client';

import { useMemo, useState } from 'react';
import { useConversations } from '@/hooks/use-conversations';
import { ConversationWorkspace } from '@/components/support/conversation-workspace';

export default function HostInboxPage() {
  const { data, isLoading, isError } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const conversations = useMemo(() => data ?? [], [data]);

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Host inbox</div>
          <h1 className="mt-3 font-serif text-4xl text-[#1F2328]">Guest conversations</h1>
          <p className="mt-4 text-sm leading-8 text-[#5F5A53]">Respond to inquiries, booking threads and support messages from a single space.</p>
          <div className="mt-8 space-y-3">
            {isLoading ? <div className="text-sm text-[#6B645C]">Loading conversations...</div> : null}
            {isError ? <div className="rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load inbox.</div> : null}
            {(conversations ?? []).map((conversation: any) => (
              <button key={conversation.id} type="button" onClick={() => setActiveConversationId(conversation.id)} className="block w-full rounded-[18px] border border-[#E8DED0] bg-[#FCFBF9] px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-sm font-semibold text-[#1F2328]">{conversation.property?.title || 'Conversation'}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8A7660]">{conversation.type}</div>
                <div className="mt-2 text-sm text-[#6B645C]">{conversation.messages?.[0]?.body || 'Open thread'}</div>
              </button>
            ))}
          </div>
        </div>

        {activeConversationId ? <ConversationWorkspace conversationId={activeConversationId} /> : <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] text-sm text-[#6B645C]">Select a conversation to view messages.</div>}
      </div>
    </div>
  );
}
