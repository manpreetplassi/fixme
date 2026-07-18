'use client';

import { apiClient } from './client';

export async function getWeeklyAnalytics() {
  const response = await apiClient.get('/analytics/weekly');
  return response.data.data;
}

export async function getHabitAnalytics() {
  const response = await apiClient.get('/analytics/habits');
  return response.data.data;
}

export async function getBlockerAnalytics() {
  const response = await apiClient.get('/analytics/blockers');
  return response.data.data;
}
