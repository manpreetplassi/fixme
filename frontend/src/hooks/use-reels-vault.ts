'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getReels, saveReel } from '@/lib/api/reels-vault';

export function useReels() {
  return useQuery({ queryKey: ['reels'], queryFn: getReels });
}

export function useSaveReel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveReel,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
  });
}
