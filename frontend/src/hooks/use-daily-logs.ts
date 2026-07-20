'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createDailyLog, createDailyTask, deleteDailyLog, deleteDailyTask, getDailyLogs, getDailyTasks, getTodayScore, updateDailyLog, updateDailyTask } from '@/lib/api/daily-logs';

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

function invalidateTracker(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['daily-tasks'] });
  void queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
  void queryClient.invalidateQueries({ queryKey: ['today-score'] });
}

export function useCreateDailyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDailyTask,
    onSuccess: () => invalidateTracker(queryClient),
  });
}

export function useUpdateDailyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateDailyTask(id, payload),
    onSuccess: () => invalidateTracker(queryClient),
  });
}

export function useDeleteDailyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDailyTask,
    onSuccess: () => invalidateTracker(queryClient),
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
