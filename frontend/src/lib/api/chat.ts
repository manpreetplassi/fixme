'use client';

import { apiClient } from './client';
import { getApiBaseUrl } from './client';

export type ChatConversation = {
  conversation_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  is_streamed: boolean;
  created_at: string;
};

export type PendingAction = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  requires_confirmation: true;
};

export type PendingActionResponse = {
  confirmation_required: true;
  pending_action: PendingAction;
};

export async function callChatFunction(name: string, args: Record<string, unknown> = {}) {
  const response = await apiClient.post('/chat/functions/call', { name, arguments: args });
  return response.data.data;
}

export async function confirmChatAction(id: string) {
  const response = await apiClient.post(`/chat/actions/${id}/confirm`);
  return response.data.data;
}

export async function rejectChatAction(id: string) {
  const response = await apiClient.post(`/chat/actions/${id}/reject`);
  return response.data.data;
}

export async function getChatActionHistory() {
  const response = await apiClient.get('/chat/actions/history');
  return response.data.data;
}

export async function createChatConversation() {
  const response = await apiClient.post('/chat/conversations');
  return response.data.data as ChatConversation;
}

export async function listChatConversations() {
  const response = await apiClient.get('/chat/conversations');
  return response.data.data as ChatConversation[];
}

export async function getChatMessages(conversationId: string) {
  const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
  return response.data.data as ChatMessage[];
}

export async function streamChatMessage(conversationId: string, content: string, onChunk: (chunk: string) => void) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('fixme_token') : null;
  const response = await fetch(`${getApiBaseUrl()}/chat/conversations/${conversationId}/message`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok || !response.body) {
    throw new Error('Chat request failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
  const final = decoder.decode();
  if (final) onChunk(final);
}
