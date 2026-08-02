'use client';

import clsx from 'clsx';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, Plus, Send, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { ChatMessage, ChatConversation, createChatConversation, deleteChatConversation, getChatMessages, listChatConversations, streamChatMessage } from '@/lib/api/chat';

type LocalMessage = Pick<ChatMessage, 'role' | 'content' | 'is_streamed'> & { message_id: string; created_at?: string };

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    async function boot() {
      setLoading(true);
      setError(null);
      try {
        const conversations = await listChatConversations();
        const conversation = conversations[0] ?? await createChatConversation();
        const history = await getChatMessages(conversation.conversation_id);
        if (!active) return;
        setConversations(conversations.length ? conversations : [conversation]);
        setConversationId(conversation.conversation_id);
        setMessages(history);
      } catch {
        if (active) setError('Could not load chat.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void boot();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streaming]);

  async function newConversation() {
    setLoading(true);
    setError(null);
    try {
      const conversation = await createChatConversation();
      setConversations((prev) => [conversation, ...prev]);
      setConversationId(conversation.conversation_id);
      setMessages([]);
    } catch {
      setError('Could not start a new chat.');
    } finally {
      setLoading(false);
    }
  }

  async function switchConversation(id: string) {
    if (id === conversationId || streaming) return;
    setLoading(true);
    setError(null);
    try {
      const history = await getChatMessages(id);
      setConversationId(id);
      setMessages(history);
    } catch {
      setError('Could not load conversation.');
    } finally {
      setLoading(false);
    }
  }

  async function deleteConversation(id: string) {
    try {
      await deleteChatConversation(id);
      const remaining = conversations.filter((c) => c.conversation_id !== id);
      if (id === conversationId) {
        const next = remaining[0] ?? await createChatConversation();
        const history = await getChatMessages(next.conversation_id);
        setConversationId(next.conversation_id);
        setMessages(history);
        setConversations(remaining.length ? remaining : [next]);
      } else {
        setConversations(remaining);
      }
    } catch {
      setError('Could not delete conversation.');
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || !conversationId || streaming) return;

    const assistantId = `assistant-${Date.now()}`;
    setInput('');
    setError(null);
    setStreaming(true);
    setMessages((current) => [
      ...current,
      { message_id: `user-${Date.now()}`, role: 'user', content, is_streamed: false },
      { message_id: assistantId, role: 'assistant', content: '', is_streamed: true },
    ]);

    try {
      await streamChatMessage(conversationId, content, (chunk) => {
        setMessages((current) => current.map((message) => (
          message.message_id === assistantId ? { ...message, content: message.content + chunk } : message
        )));
      });
    } catch {
      setError('The assistant could not respond. Your message may not have been saved.');
      setMessages((current) => current.filter((message) => message.message_id !== assistantId));
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col">
      <PageHeader title="Chat" subtitle="Talk through tasks, money, blockers, or trip plans. History stays with your account." />

      <section className="flex min-h-[34rem] flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 dark:border-slate-800 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <MessageCircle className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">FixMe Assistant</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{streaming ? 'Streaming...' : 'Ready'}</p>
            </div>
          </div>
          <button type="button" onClick={newConversation} className="tap-target inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-bold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900" title="New chat">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {conversations.length > 0 && (
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 py-1.5 dark:border-slate-800">
            {conversations.map((c) => (
              <div key={c.conversation_id} className={clsx('group flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs', c.conversation_id === conversationId ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700')}>
                <button type="button" onClick={() => switchConversation(c.conversation_id)} className="max-w-[8rem] truncate font-medium">
                  {c.title ?? 'New chat'}
                </button>
                <button type="button" onClick={() => deleteConversation(c.conversation_id)} className={clsx('ml-0.5 rounded p-0.5 opacity-0 transition group-hover:opacity-100', c.conversation_id === conversationId ? 'hover:bg-white/20' : 'hover:bg-slate-300 dark:hover:bg-slate-600')} title="Delete conversation">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-4">
          {loading ? <EmptyState text="Loading chat..." loading /> : null}
          {!loading && messages.length === 0 ? <EmptyState text="Ask anything, or start with: Plan my week around my trip goal." /> : null}
          {messages.map((message) => (
            <div key={message.message_id} className={clsx('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={clsx(
                  'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-6 sm:max-w-[72%]',
                  message.role === 'user'
                    ? 'bg-emerald-50 text-emerald-950 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-50 dark:ring-emerald-900'
                    : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950',
                )}
              >
                {message.content || (message.role === 'assistant' && streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : null)}
              </div>
            </div>
          ))}
        </div>

        {error ? <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}

        <form onSubmit={submit} className="border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-end gap-2 rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Message FixMe..."
              rows={1}
              className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
              disabled={streaming || loading}
            />
            <button type="submit" disabled={!input.trim() || streaming || loading} className="tap-target inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700" title="Send">
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function EmptyState({ text, loading = false }: { text: string; loading?: boolean }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-sm text-slate-500 dark:text-slate-400">
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
      <p>{text}</p>
    </div>
  );
}
