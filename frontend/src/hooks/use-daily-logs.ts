'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDailyLog, deleteDailyLog, getDailyLogs, getDailyTasks, getTodayScore, updateDailyLog } from '@/lib/api/daily-logs';

export function useDailyTasks(dayType?: string) {
  return useQuery({
    queryKey: ['daily-tasks', dayType],
    queryFn: () => getDailyTasks(dayType),
  });
}

export function useDailyLogs(date?: string) {
  return useQuery({
    queryKey: ['daily-logs', date],
    queryFn: () => getDailyLogs(date),
  });
}

export function useTodayScore(date?: string) {
  return useQuery({
    queryKey: ['today-score', date],
    queryFn: () => getTodayScore(date),
  });
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDailyLog,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
      void queryClient.invalidateQueries({ queryKey: ['today-score'] });
    },
  });
}

export function useUpdateDailyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateDailyLog(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
      void queryClient.invalidateQueries({ queryKey: ['today-score'] });
    },
  });
}

export function useDeleteDailyLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDailyLog,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
      void queryClient.invalidateQueries({ queryKey: ['today-score'] });
    },
  });
}
