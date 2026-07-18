'use client';

import { apiClient } from './client';

export async function login(payload: { email: string; password: string }) {
  const response = await apiClient.post('/auth/login', payload);
  return response.data.data;
}

export async function register(payload: { email: string; password: string; name: string }) {
  const response = await apiClient.post('/auth/register', payload);
  return response.data.data;
}

export async function getMe() {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
}

export async function logout() {
  const response = await apiClient.post('/auth/logout');
  return response.data.data;
}
