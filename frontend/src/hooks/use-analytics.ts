'use client';

import { useQuery } from '@tanstack/react-query';
import { getBlockerAnalytics, getHabitAnalytics, getWeeklyAnalytics } from '@/lib/api/analytics';

export function useWeeklyAnalytics() {
  return useQuery({ queryKey: ['analytics', 'weekly'], queryFn: getWeeklyAnalytics });
}

export function useHabitAnalytics() {
  return useQuery({ queryKey: ['analytics', 'habits'], queryFn: getHabitAnalytics });
}

export function useBlockerAnalytics() {
  return useQuery({ queryKey: ['analytics', 'blockers'], queryFn: getBlockerAnalytics });
}
