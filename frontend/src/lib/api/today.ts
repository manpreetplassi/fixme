'use client';

import { apiClient } from './client';

export type TodayRoutineItem = {
  id: string;
  type: 'routine' | 'screen_checkin';
  title: string;
  category: string;
  time_block: string | null;
  priority: 'urgent' | 'important' | 'low';
  repeat_rule: string;
  reminder_enabled: boolean;
  status: 'not_started' | 'done' | 'completed' | 'failed' | 'skipped' | string;
  points: number;
  points_earned: number;
  linked_money_entry_id: string | null;
  is_done: boolean;
  overdue: boolean;
  period?: string;
  check_in?: ScreenCheckIn | null;
};

export type ScreenCheckIn = {
  id: string;
  check_date: string;
  period: string;
  watched: boolean;
  content_type: string | null;
  title_note: string | null;
  stopped_watching_at: string | null;
};

export type ScreenSummaryDay = {
  date: string;
  check_in: ScreenCheckIn | null;
};

export type ScreenSummary = {
  week: ScreenSummaryDay[];
  streak: number;
};

export type TodayResponse = {
  date: string;
  items: TodayRoutineItem[];
  overdue: TodayRoutineItem[];
  screen: ScreenSummary;
};

export async function getToday(date?: string): Promise<TodayResponse> {
  const response = await apiClient.get('/today', { params: date ? { date } : undefined });
  return response.data.data;
}

export async function createRoutineItem(payload: Record<string, unknown>) {
  const response = await apiClient.post('/today/items', payload);
  return response.data.data;
}

export async function updateRoutineItem(id: string, payload: Record<string, unknown>) {
  const response = await apiClient.patch(`/today/items/${id}`, payload);
  return response.data.data;
}

export async function deleteRoutineItem(id: string) {
  const response = await apiClient.delete(`/today/items/${id}`);
  return response.data.data;
}

export async function setRoutineDone(id: string, payload: { is_done?: boolean; status?: string; date?: string; note?: string; points_earned?: number; duration_minutes?: number | null; rating?: number | null; linked_money_entry_id?: string | null }) {
  const response = await apiClient.post(`/today/items/${id}/done`, payload);
  return response.data.data;
}

export async function saveScreenCheckIn(payload: Record<string, unknown>) {
  const response = await apiClient.post('/today/screen-checkins', payload);
  return response.data.data;
}

export async function deleteScreenCheckIn(date?: string) {
  const response = await apiClient.delete('/today/screen-checkins', { params: date ? { date } : undefined });
  return response.data.data;
}

export async function getScreenSummary(date?: string): Promise<ScreenSummary> {
  const response = await apiClient.get('/today/screen-checkins/summary', { params: date ? { date } : undefined });
  return response.data.data;
}

export async function sendReminderDigest(date?: string) {
  const response = await apiClient.post('/today/reminders/digest', null, { params: date ? { date } : undefined });
  return response.data.data;
}
