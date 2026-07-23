'use client';

import { apiClient } from './client';

export async function getProfile() {
  const response = await apiClient.get('/users/profile');
  return response.data.data;
}

export async function updateProfile(payload: Record<string, unknown>) {
  const response = await apiClient.put('/users/profile', payload);
  return response.data.data;
}

export async function getAddictionLabel(): Promise<string> {
  const profile = await getProfile();
  return (profile.addiction_label as string | undefined) ?? 'addiction';
}

export async function updateGoals(payload: Record<string, unknown>) {
  const response = await apiClient.put('/users/goals', payload);
  return response.data.data;
}

export async function getDataCounts(): Promise<Record<string, number>> {
  const response = await apiClient.get('/users/data/counts');
  return response.data.data;
}

export async function deleteMyData(categories: string[]): Promise<{ deleted: Record<string, number> }> {
  const response = await apiClient.delete('/users/data', { data: { categories } });
  return response.data.data;
}
