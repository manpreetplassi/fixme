'use client';

import { apiClient } from './client';

export async function getHobbies() {
  const response = await apiClient.get('/hobbies');
  return response.data.data;
}

export async function createHobby(payload: Record<string, unknown>) {
  const response = await apiClient.post('/hobbies', payload);
  return response.data.data;
}

export async function updateHobby(id: string, payload: Record<string, unknown>) {
  const response = await apiClient.patch(`/hobbies/${id}`, payload);
  return response.data.data;
}

export async function deleteHobby(id: string) {
  const response = await apiClient.delete(`/hobbies/${id}`);
  return response.data.data;
}

export async function getHobbyLogs() {
  const response = await apiClient.get('/hobbies/logs');
  return response.data.data;
}

export async function createHobbyLog(payload: Record<string, unknown>) {
  const response = await apiClient.post('/hobbies/log', payload);
  return response.data.data;
}

export async function updateHobbyLog(id: string, payload: Record<string, unknown>) {
  const response = await apiClient.patch(`/hobbies/logs/${id}`, payload);
  return response.data.data;
}

export async function deleteHobbyLog(id: string) {
  const response = await apiClient.delete(`/hobbies/logs/${id}`);
  return response.data.data;
}
