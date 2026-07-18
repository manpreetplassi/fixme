'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLearningLog, deleteLearningLog, getLearningLogs, updateLearningLog } from '@/lib/api/learning-logs';

export function useLearningLogs() {
  return useQuery({ queryKey: ['learning-logs'], queryFn: getLearningLogs });
}

export function useCreateLearningLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLearningLog,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['learning-logs'] });
    },
  });
}

export function useUpdateLearningLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateLearningLog(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['learning-logs'] });
    },
  });
}

export function useDeleteLearningLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLearningLog,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['learning-logs'] });
    },
  });
}
