'use client';

import { apiClient } from './client';

export async function getLearningLogs() {
  const response = await apiClient.get('/learning-logs');
  return response.data.data;
}

export async function createLearningLog(payload: Record<string, unknown>) {
  const response = await apiClient.post('/learning-logs', payload);
  return response.data.data;
}

export async function updateLearningLog(id: string, payload: Record<string, unknown>) {
  const response = await apiClient.patch(`/learning-logs/${id}`, payload);
  return response.data.data;
}

export async function deleteLearningLog(id: string) {
  const response = await apiClient.delete(`/learning-logs/${id}`);
  return response.data.data;
}
