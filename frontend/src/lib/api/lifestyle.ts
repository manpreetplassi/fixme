'use client';

import { apiClient } from './client';

export type LifestyleDay = {
  id: string;
  log_date: string;
  wake_time: string | null;
  sleep_time: string | null;
  sleep_hours: number | null;
  sleep_quality: string | null;
  water_litres: number;
  mood: string | null;
  morning_energy: string | null;
  night_energy: string | null;
  screen_shutdown_time: string | null;
  notes: string | null;
};

export type MealEntry = {
  id: string;
  meal_date: string;
  meal_type: string;
  meal_time: string | null;
  meal_name: string | null;
  food_items: string[];
  homemade: boolean;
  outside_food: boolean;
  leftover_from_dinner: boolean;
  restaurant: string | null;
  sabzi_name: string | null;
  roti_count: number | null;
  rice: boolean;
  dal: boolean;
  salad: boolean;
  curd: boolean;
  fruits: boolean;
  tea: boolean;
  coffee: boolean;
  cost: number | null;
  outside_reason: string | null;
  quantity: string | null;
  notes: string | null;
};

export type LifestyleActivity = {
  id: string;
  activity_date: string;
  activity_type: 'exercise' | 'productivity';
  name: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  project_name: string | null;
  notes: string | null;
};

export type MealTemplate = {
  id: string;
  name: string;
  meal_type: string;
  food_items: string[];
  homemade: boolean;
  sabzi_name: string | null;
  roti_count: number | null;
  notes: string | null;
};

export async function getLifestyleToday(date?: string) {
  const response = await apiClient.get('/lifestyle/today', { params: date ? { date } : undefined });
  return response.data.data;
}

export async function updateLifestyleDay(payload: Record<string, unknown>) {
  const response = await apiClient.patch('/lifestyle/day', payload);
  return response.data.data;
}

export async function createMeal(payload: Record<string, unknown>) {
  const response = await apiClient.post('/lifestyle/meals', payload);
  return response.data.data;
}

export async function deleteMeal(id: string) {
  const response = await apiClient.delete(`/lifestyle/meals/${id}`);
  return response.data.data;
}

export async function getMealTemplates() {
  const response = await apiClient.get('/lifestyle/templates');
  return response.data.data;
}

export async function createMealTemplate(payload: Record<string, unknown>) {
  const response = await apiClient.post('/lifestyle/templates', payload);
  return response.data.data;
}

export async function useMealTemplate(id: string) {
  const response = await apiClient.post(`/lifestyle/templates/${id}/use`);
  return response.data.data;
}

export async function createLifestyleActivity(payload: Record<string, unknown>) {
  const response = await apiClient.post('/lifestyle/activities', payload);
  return response.data.data;
}

export async function deleteLifestyleActivity(id: string) {
  const response = await apiClient.delete(`/lifestyle/activities/${id}`);
  return response.data.data;
}

export async function getLifestyleAnalytics(range: 'week' | 'month' = 'week') {
  const response = await apiClient.get('/lifestyle/analytics', { params: { range } });
  return response.data.data;
}

export async function searchLifestyle(query: string) {
  const response = await apiClient.get('/lifestyle/search', { params: { q: query } });
  return response.data.data;
}
