'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLifestyleActivity, createMeal, createMealTemplate, deleteLifestyleActivity, deleteMeal, getLifestyleAnalytics, getLifestyleToday, getMealTemplates, searchLifestyle, updateLifestyleDay, useMealTemplate } from '@/lib/api/lifestyle';

function useLifestyleInvalidation() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['lifestyle'] });
    void queryClient.invalidateQueries({ queryKey: ['lifestyle-analytics'] });
  };
}

export function useLifestyleToday(date?: string) {
  return useQuery({ queryKey: ['lifestyle', 'today', date], queryFn: () => getLifestyleToday(date) });
}

export function useMealTemplates() {
  return useQuery({ queryKey: ['lifestyle', 'templates'], queryFn: getMealTemplates });
}

export function useLifestyleAnalytics(range: 'week' | 'month' = 'week') {
  return useQuery({ queryKey: ['lifestyle-analytics', range], queryFn: () => getLifestyleAnalytics(range) });
}

export function useLifestyleSearch(query: string) {
  return useQuery({ queryKey: ['lifestyle-search', query], queryFn: () => searchLifestyle(query), enabled: query.trim().length > 1 });
}

export function useUpdateLifestyleDay() {
  const invalidate = useLifestyleInvalidation();
  return useMutation({ mutationFn: updateLifestyleDay, onSuccess: invalidate });
}

export function useCreateMeal() {
  const invalidate = useLifestyleInvalidation();
  return useMutation({ mutationFn: createMeal, onSuccess: invalidate });
}

export function useDeleteMeal() {
  const invalidate = useLifestyleInvalidation();
  return useMutation({ mutationFn: deleteMeal, onSuccess: invalidate });
}

export function useCreateMealTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMealTemplate,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['lifestyle', 'templates'] }),
  });
}

export function useUseMealTemplate() {
  const invalidate = useLifestyleInvalidation();
  return useMutation({ mutationFn: useMealTemplate, onSuccess: invalidate });
}

export function useCreateLifestyleActivity() {
  const invalidate = useLifestyleInvalidation();
  return useMutation({ mutationFn: createLifestyleActivity, onSuccess: invalidate });
}

export function useDeleteLifestyleActivity() {
  const invalidate = useLifestyleInvalidation();
  return useMutation({ mutationFn: deleteLifestyleActivity, onSuccess: invalidate });
}
