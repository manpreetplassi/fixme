'use client';

import { apiClient } from './client';

export async function getReels() {
  const response = await apiClient.get('/reels-vault');
  return response.data.data;
}

export async function saveReel(payload: Record<string, unknown>) {
  const response = await apiClient.post('/reels-vault', payload);
  return response.data.data;
}
