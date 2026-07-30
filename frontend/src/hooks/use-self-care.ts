'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateCareTask,
  createCareArea,
  createCareTask,
  deleteCareArea,
  deleteCareTask,
  deactivateCareTask,
  getCareAreas,
  getCareTasks,
  updateCareArea,
  updateCareTask,
} from '@/lib/api/self-care';

export function useCareAreas() {
  return useQuery({ queryKey: ['self-care', 'areas'], queryFn: getCareAreas });
}

export function useCareTasks(areaId?: string) {
  return useQuery({
    queryKey: ['self-care', 'tasks', areaId],
    queryFn: () => getCareTasks(areaId as string),
    enabled: Boolean(areaId),
  });
}

function useInvalidateSelfCare(areaId?: string) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['self-care', 'areas'] });
    if (areaId) void queryClient.invalidateQueries({ queryKey: ['self-care', 'tasks', areaId] });
    void queryClient.invalidateQueries({ queryKey: ['today'] });
  };
}

export function useCreateCareArea() {
  const invalidate = useInvalidateSelfCare();
  return useMutation({ mutationFn: createCareArea, onSuccess: invalidate });
}

export function useUpdateCareArea() {
  const invalidate = useInvalidateSelfCare();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateCareArea(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCareArea() {
  const invalidate = useInvalidateSelfCare();
  return useMutation({ mutationFn: deleteCareArea, onSuccess: invalidate });
}

export function useCreateCareTask(areaId?: string) {
  const invalidate = useInvalidateSelfCare(areaId);
  return useMutation({
    mutationFn: ({ targetAreaId, payload }: { targetAreaId: string; payload: Record<string, unknown> }) => createCareTask(targetAreaId, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateCareTask(areaId?: string) {
  const invalidate = useInvalidateSelfCare(areaId);
  return useMutation({
    mutationFn: ({ targetAreaId, taskId, payload }: { targetAreaId: string; taskId: string; payload: Record<string, unknown> }) =>
      updateCareTask(targetAreaId, taskId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCareTask(areaId?: string) {
  const invalidate = useInvalidateSelfCare(areaId);
  return useMutation({
    mutationFn: ({ targetAreaId, taskId }: { targetAreaId: string; taskId: string }) => deleteCareTask(targetAreaId, taskId),
    onSuccess: invalidate,
  });
}

export function useActivateCareTask(areaId?: string) {
  const invalidate = useInvalidateSelfCare(areaId);
  return useMutation({
    mutationFn: ({ targetAreaId, taskId }: { targetAreaId: string; taskId: string }) => activateCareTask(targetAreaId, taskId),
    onSuccess: invalidate,
  });
}

export function useDeactivateCareTask(areaId?: string) {
  const invalidate = useInvalidateSelfCare(areaId);
  return useMutation({
    mutationFn: ({ targetAreaId, taskId }: { targetAreaId: string; taskId: string }) => deactivateCareTask(targetAreaId, taskId),
    onSuccess: invalidate,
  });
}
