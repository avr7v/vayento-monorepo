'use client';

import { useMemo, useState } from 'react';
import { useConversations, useCreateConversation } from '@/hooks/use-conversations';
import { ConversationWorkspace } from '@/components/support/conversation-workspace';

export default function UserSupportPage() {
  const { data, isLoading, isError } = useConversations();
  const createMutation = useCreateConversation();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const supportConversations = useMemo(() => (data ?? []).filter((conversation: any) => conversation.type === 'SUPPORT'), [data]);

  const createSupportConversation = async () => {
    const created = await createMutation.mutateAsync({ type: 'SUPPORT', message });
    setMessage('');
    setActiveConversationId(created.id);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12">
      <div className="mx-auto max-w-7xl grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)]">
          <div className="text-xs uppercase tracking-[0.24em] text-[#8A7660]">Support inbox</div>
          <h1 className="mt-3 font-serif text-4xl text-[#1F2328]">Guest support</h1>
          <p className="mt-4 text-sm leading-8 text-[#5F5A53]">Open a support conversation or continue a previous one.</p>
          <div className="mt-6 space-y-4">
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe what you need help with" className="min-h-[140px] w-full rounded-[18px] border border-[#E7DED1] bg-[#FBFAF7] px-4 py-3 outline-none" />
            <button type="button" onClick={() => void createSupportConversation()} disabled={createMutation.isPending || !message.trim()} className="rounded-full bg-[#1F2328] px-5 py-3 text-sm text-white disabled:opacity-60">{createMutation.isPending ? 'Opening...' : 'Open support conversation'}</button>
          </div>

          <div className="mt-8 space-y-3">
            {isLoading ? <div className="text-sm text-[#6B645C]">Loading support conversations...</div> : null}
            {isError ? <div className="rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">Failed to load support conversations.</div> : null}
            {(supportConversations ?? []).map((conversation: any) => (
              <button key={conversation.id} type="button" onClick={() => setActiveConversationId(conversation.id)} className="block w-full rounded-[18px] border border-[#E8DED0] bg-[#FCFBF9] px-4 py-4 text-left transition-all duration-300 hover:-translate-y-0.5">
                <div className="text-sm font-semibold text-[#1F2328]">Support conversation</div>
                <div className="mt-1 text-xs text-[#8A7660]">{conversation.messages?.[0]?.body || 'Open thread'}</div>
              </button>
            ))}
          </div>
        </div>

        {activeConversationId ? <ConversationWorkspace conversationId={activeConversationId} /> : <div className="rounded-[34px] border border-[#E8DED0] bg-white p-8 shadow-[0_18px_50px_rgba(31,35,40,0.06)] text-sm text-[#6B645C]">Select a conversation to view messages.</div>}
      </div>
    </div>
  );
}
