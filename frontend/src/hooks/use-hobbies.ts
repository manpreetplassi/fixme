'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createHobby, createHobbyLog, deleteHobby, deleteHobbyLog, getHobbies, getHobbyLogs, updateHobby, updateHobbyLog } from '@/lib/api/hobbies';

export function useHobbies() {
  return useQuery({ queryKey: ['hobbies'], queryFn: getHobbies });
}

export function useHobbyLogs() {
  return useQuery({ queryKey: ['hobby-logs'], queryFn: getHobbyLogs });
}

function useInvalidateHobbies() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['hobbies'] });
    void queryClient.invalidateQueries({ queryKey: ['hobby-logs'] });
    void queryClient.invalidateQueries({ queryKey: ['analytics'] });
  };
}

export function useCreateHobby() {
  const invalidate = useInvalidateHobbies();
  return useMutation({ mutationFn: createHobby, onSuccess: invalidate });
}

export function useUpdateHobby() {
  const invalidate = useInvalidateHobbies();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateHobby(id, payload), onSuccess: invalidate });
}

export function useDeleteHobby() {
  const invalidate = useInvalidateHobbies();
  return useMutation({ mutationFn: deleteHobby, onSuccess: invalidate });
}

export function useCreateHobbyLog() {
  const invalidate = useInvalidateHobbies();
  return useMutation({ mutationFn: createHobbyLog, onSuccess: invalidate });
}

export function useUpdateHobbyLog() {
  const invalidate = useInvalidateHobbies();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateHobbyLog(id, payload), onSuccess: invalidate });
}

export function useDeleteHobbyLog() {
  const invalidate = useInvalidateHobbies();
  return useMutation({ mutationFn: deleteHobbyLog, onSuccess: invalidate });
}
