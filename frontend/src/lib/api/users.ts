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

export async function updateGoals(payload: Record<string, unknown>) {
  const response = await apiClient.put('/users/goals', payload);
  return response.data.data;
}
