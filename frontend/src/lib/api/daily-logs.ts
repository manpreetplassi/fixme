'use client';

import { apiClient } from './client';

export async function getDailyTasks(dayType?: string) {
  const response = await apiClient.get('/daily-tasks', { params: dayType ? { day_type: dayType } : undefined });
  return response.data.data;
}

export async function getDailyLogs(date?: string) {
  const response = await apiClient.get('/daily-logs', { params: date ? { date } : undefined });
  return response.data.data;
}

export async function createDailyLog(payload: Record<string, unknown>) {
  const response = await apiClient.post('/daily-logs', payload);
  return response.data.data;
}

export async function updateDailyLog(id: string, payload: Record<string, unknown>) {
  const response = await apiClient.patch(`/daily-logs/${id}`, payload);
  return response.data.data;
}

export async function deleteDailyLog(id: string) {
  const response = await apiClient.delete(`/daily-logs/${id}`);
  return response.data.data;
}

export async function getTodayScore(date?: string) {
  const response = await apiClient.get('/daily-logs/score/today', { params: date ? { date } : undefined });
  return response.data.data;
}
