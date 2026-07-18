'use client';

import { apiClient } from './client';

export async function getMoneyEntries() {
  const response = await apiClient.get('/money-tracker');
  return response.data.data;
}

export async function createMoneyEntry(payload: Record<string, unknown>) {
  const response = await apiClient.post('/money-tracker', payload);
  return response.data.data;
}

export async function updateMoneyEntry(id: string, payload: Record<string, unknown>) {
  const response = await apiClient.patch(`/money-tracker/${id}`, payload);
  return response.data.data;
}

export async function deleteMoneyEntry(id: string) {
  const response = await apiClient.delete(`/money-tracker/${id}`);
  return response.data.data;
}
