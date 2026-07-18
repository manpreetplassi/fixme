'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, login, logout, register } from '@/lib/api/auth';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('fixme_token', data.accessToken);
      }
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('fixme_token', data.accessToken);
      }
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('fixme_token');
      }
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}
