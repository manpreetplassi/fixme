'use client';

import { apiClient } from './client';

export type TodayRoutineItem = {
  id: string;
  type: 'routine' | 'screen_checkin' | 'lifestyle_activity' | 'learning_log';
  title: string;
  category: string;
  parent_tag: string | null;
  sub_tag: string | null;
  time_block: string | null;
  priority: 'urgent' | 'important' | 'low';
  repeat_rule: string;
  scheduled_date: string | null;
  item_type: 'simple' | 'measurable' | string;
  target_value: number | null;
  target_unit: string | null;
  tolerance_value: number | null;
  reminder_enabled: boolean;
  reminder_trigger_type: 'time' | 'after_item' | 'check_in' | string;
  reminder_trigger_item_id: string | null;
  time_tracking_enabled: boolean;
  status: 'not_started' | 'done' | 'completed' | 'failed' | 'skipped' | string;
  points: number;
  source?: string;
  plan_id?: string | null;
  icon?: string | null;
  points_earned: number;
  score: number | null;
  duration_minutes: number | null;
  timer_started_at: string | null;
  actual_value: number | null;
  linked_money_entry_id: string | null;
  is_done: boolean;
  overdue: boolean;
  period?: string;
  check_in?: ScreenCheckIn | null;
  note?: string | null;
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
  reminders: {
    configured: boolean;
    missing: string[];
    override_recipient_configured: boolean;
  };
};

export type TodayScoreResponse = {
  date: string;
  dailyScore: number;
  tasksCompleted: number;
  tasksFailed: number;
  streakUpdate: unknown[];
};

export async function getToday(date?: string): Promise<TodayResponse> {
  const response = await apiClient.get('/today', { params: date ? { date } : undefined });
  return response.data.data;
}

export async function getTodayScore(date?: string): Promise<TodayScoreResponse> {
  const response = await apiClient.get('/today/score/today', { params: date ? { date } : undefined });
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

export async function setRoutineDone(id: string, payload: { is_done?: boolean; status?: string; date?: string; note?: string; points_earned?: number; duration_minutes?: number | null; actual_value?: number | null; score?: number | null; rating?: number | null; linked_money_entry_id?: string | null }) {
  const response = await apiClient.post(`/today/items/${id}/done`, payload);
  return response.data.data;
}

export async function startRoutineTimer(id: string, date?: string) {
  const response = await apiClient.post(`/today/items/${id}/timer/start`, { date });
  return response.data.data;
}

export async function stopRoutineTimer(id: string, date?: string) {
  const response = await apiClient.post(`/today/items/${id}/timer/stop`, { date });
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

export async function getReminderStatus(): Promise<TodayResponse['reminders']> {
  const response = await apiClient.get('/today/reminders/status');
  return response.data.data;
}
