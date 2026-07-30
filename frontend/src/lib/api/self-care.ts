'use client';

import { apiClient } from './client';

export type CareArea = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  task_count: number;
  active_in_routine: number;
};

export type CareTask = {
  id: string;
  title: string;
  notes: string | null;
  frequency: string;
  priority: string;
  is_active: boolean;
  routine_item_id: string | null;
  in_routine: boolean;
  display_order: number;
};

export async function getCareAreas(): Promise<CareArea[]> {
  const res = await apiClient.get('/self-care/areas');
  return res.data.data;
}

export async function createCareArea(payload: Record<string, unknown>): Promise<CareArea> {
  const res = await apiClient.post('/self-care/areas', payload);
  return res.data.data;
}

export async function updateCareArea(id: string, payload: Record<string, unknown>): Promise<CareArea> {
  const res = await apiClient.patch(`/self-care/areas/${id}`, payload);
  return res.data.data;
}

export async function deleteCareArea(id: string): Promise<void> {
  await apiClient.delete(`/self-care/areas/${id}`);
}

export async function getCareTasks(areaId: string): Promise<CareTask[]> {
  const res = await apiClient.get(`/self-care/areas/${areaId}/tasks`);
  return res.data.data;
}

export async function createCareTask(areaId: string, payload: Record<string, unknown>): Promise<CareTask> {
  const res = await apiClient.post(`/self-care/areas/${areaId}/tasks`, payload);
  return res.data.data;
}

export async function updateCareTask(areaId: string, taskId: string, payload: Record<string, unknown>): Promise<CareTask> {
  const res = await apiClient.patch(`/self-care/areas/${areaId}/tasks/${taskId}`, payload);
  return res.data.data;
}

export async function deleteCareTask(areaId: string, taskId: string): Promise<void> {
  await apiClient.delete(`/self-care/areas/${areaId}/tasks/${taskId}`);
}

export async function activateCareTask(areaId: string, taskId: string): Promise<CareTask> {
  const res = await apiClient.post(`/self-care/areas/${areaId}/tasks/${taskId}/activate`);
  return res.data.data;
}

export async function deactivateCareTask(areaId: string, taskId: string): Promise<CareTask> {
  const res = await apiClient.post(`/self-care/areas/${areaId}/tasks/${taskId}/deactivate`);
  return res.data.data;
}
