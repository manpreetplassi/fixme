'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReflection, deleteReflection, getReflectionWeek, updateReflection } from '@/lib/api/reflections';

export function useReflectionWeek() {
  return useQuery({ queryKey: ['reflections', 'week'], queryFn: getReflectionWeek });
}

export function useCreateReflection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReflection,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reflections'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateReflection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateReflection(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reflections'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteReflection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReflection,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reflections'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
