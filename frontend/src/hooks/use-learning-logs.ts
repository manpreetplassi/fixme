'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLearningLog, getLearningLogs } from '@/lib/api/learning-logs';

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
