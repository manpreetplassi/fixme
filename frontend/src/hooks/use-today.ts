'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRoutineItem, deleteRoutineItem, getScreenSummary, getToday, saveScreenCheckIn, sendReminderDigest, setRoutineDone, updateRoutineItem } from '@/lib/api/today';

export function useToday(date?: string) {
  return useQuery({
    queryKey: ['today', date],
    queryFn: () => getToday(date),
  });
}

export function useScreenSummary(date?: string) {
  return useQuery({
    queryKey: ['screen-summary', date],
    queryFn: () => getScreenSummary(date),
  });
}

export function useCreateRoutineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoutineItem,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['today'] }),
  });
}

export function useUpdateRoutineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateRoutineItem(id, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['today'] }),
  });
}

export function useDeleteRoutineItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRoutineItem,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['today'] }),
  });
}

export function useSetRoutineDone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { is_done: boolean; date?: string; note?: string } }) => setRoutineDone(id, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['today'] }),
  });
}

export function useSaveScreenCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveScreenCheckIn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['today'] });
      void queryClient.invalidateQueries({ queryKey: ['screen-summary'] });
    },
  });
}

export function useSendReminderDigest() {
  return useMutation({ mutationFn: sendReminderDigest });
}
