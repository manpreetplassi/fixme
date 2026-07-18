'use client';

import { apiClient } from './client';

export async function getReflectionWeek() {
  const response = await apiClient.get('/reflections/week');
  return response.data.data;
}

export async function createReflection(payload: Record<string, unknown>) {
  const response = await apiClient.post('/reflections', payload);
  return response.data.data;
}

export async function updateReflection(id: string, payload: Record<string, unknown>) {
  const response = await apiClient.patch(`/reflections/${id}`, payload);
  return response.data.data;
}

export async function deleteReflection(id: string) {
  const response = await apiClient.delete(`/reflections/${id}`);
  return response.data.data;
}
