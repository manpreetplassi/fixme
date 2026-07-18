'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createMoneyEntry, deleteMoneyEntry, getMoneyEntries, updateMoneyEntry } from '@/lib/api/money-tracker';

export function useMoneyEntries() {
  return useQuery({ queryKey: ['money-tracker'], queryFn: getMoneyEntries });
}

export function useCreateMoneyEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMoneyEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['money-tracker'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateMoneyEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateMoneyEntry(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['money-tracker'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteMoneyEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMoneyEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['money-tracker'] });
      void queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
