'use client';

import clsx from 'clsx';
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, Plus, Send, Trash2 } from 'lucide-react';
import { PendingActionCard } from '@/components/chat/pending-action-card';
import { PageHeader } from '@/components/layout/page-header';
import { ChatMessage, ChatConversation, PendingAction, confirmChatAction, createChatConversation, deleteChatConversation, getChatMessages, listChatConversations, rejectChatAction, streamChatMessage } from '@/lib/api/chat';

type LocalMessage = Pick<ChatMessage, 'role' | 'content' | 'is_streamed'> & { message_id: string; created_at?: string; pendingActions?: PendingAction[] };

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedActionIds, setConfirmedActionIds] = useState<Set<string>>(new Set());
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [input]);

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

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
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
      let rawAssistantContent = '';
      await streamChatMessage(conversationId, content, (chunk) => {
        rawAssistantContent += chunk;
        const parsed = parseAssistantStream(rawAssistantContent);
        setMessages((current) => current.map((message) => (
          message.message_id === assistantId ? { ...message, content: parsed.content, pendingActions: parsed.pendingActions } : message
        )));
      });
    } catch {
      setError('The assistant could not respond. Your message may not have been saved.');
      setMessages((current) => current.filter((message) => message.message_id !== assistantId));
    } finally {
      setStreaming(false);
    }
  }

  async function confirmAction(action: PendingAction) {
    try {
      await confirmChatAction(action.id);
      setConfirmedActionIds((current) => new Set(current).add(action.id));
    } catch {
      setError('Could not save the proposed action.');
    }
  }

  async function rejectAction(action: PendingAction) {
    try {
      await rejectChatAction(action.id);
      setMessages((current) => current.map((message) => ({
        ...message,
        pendingActions: message.pendingActions?.filter((pending) => pending.id !== action.id),
      })));
    } catch {
      setError('Could not cancel the proposed action.');
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

        <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-4">
          {loading ? <EmptyState text="Loading chat..." loading /> : null}
          {!loading && messages.length === 0 ? <EmptyState text="Ask anything, or start with: Plan my week around my trip goal." /> : null}
          {messages.map((message, i) => (
            <div key={message.message_id} className={clsx('flex items-end gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              {message.role === 'assistant' && (
                <span className="mb-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="flex max-w-[80%] flex-col gap-2 sm:max-w-[68%]">
                <div
                  className={clsx(
                    'whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-6',
                    message.role === 'user'
                      ? 'rounded-br-sm bg-emerald-500 text-white'
                      : 'rounded-bl-sm bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
                  )}
                >
                  {message.content
                    ? message.content
                    : message.role === 'assistant' && streaming && i === messages.length - 1
                      ? <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" /></span>
                      : null}
                </div>
                {message.pendingActions?.map((action) => (
                  <PendingActionCard
                    key={action.id}
                    action={action}
                    confirmed={confirmedActionIds.has(action.id)}
                    onConfirm={() => void confirmAction(action)}
                    onCancel={() => void rejectAction(action)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {error ? <p className="border-t border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}

        <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900 dark:focus-within:border-emerald-500">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message FixMe... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              disabled={streaming || loading}
            />
            <button type="submit" disabled={!input.trim() || streaming || loading} className="mb-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-slate-700" title="Send">
              {streaming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-400 dark:text-slate-600">Enter to send · Shift+Enter for new line</p>
        </form>
      </section>
    </div>
  );
}

function parseAssistantStream(content: string) {
  const pattern = /FIXME_PENDING_ACTIONS_JSON\s*([\s\S]*?)\s*END_FIXME_PENDING_ACTIONS_JSON/g;
  const pendingActions: PendingAction[] = [];
  let match = pattern.exec(content);
  while (match) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) pendingActions.push(...parsed);
    } catch {
      // Keep rendering the visible answer if the action metadata is incomplete while streaming.
    }
    match = pattern.exec(content);
  }

  return {
    content: stripPendingActionBlocks(content, pattern),
    pendingActions,
  };
}

function stripPendingActionBlocks(content: string, completeBlockPattern: RegExp) {
  const withoutCompleteBlocks = content.replace(completeBlockPattern, '');
  const marker = 'FIXME_PENDING_ACTIONS_JSON';
  const markerIndex = withoutCompleteBlocks.indexOf(marker);
  if (markerIndex >= 0) return withoutCompleteBlocks.slice(0, markerIndex).trimEnd();

  for (let length = marker.length - 1; length > 0; length -= 1) {
    if (withoutCompleteBlocks.endsWith(marker.slice(0, length))) {
      return withoutCompleteBlocks.slice(0, -length).trimEnd();
    }
  }

  return withoutCompleteBlocks.trimEnd();
}

function EmptyState({ text, loading = false }: { text: string; loading?: boolean }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-sm text-slate-500 dark:text-slate-400">
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MessageCircle className="h-5 w-5" />}
      <p>{text}</p>
    </div>
  );
}
