import 'reflect-metadata';
import * as assert from 'node:assert/strict';
import { AnalyticsService } from '../src/analytics/analytics.service';

type FakeRepository<T> = {
  find: () => Promise<T[]>;
};

function repo<T>(items: T[]): FakeRepository<T> {
  return {
    find: async () => items,
  };
}

async function testWeeklyAnalytics(): Promise<void> {
  const logs = [
    { log_date: '2026-07-17', points_earned: 10, status: 'completed' },
    { log_date: '2026-07-17', points_earned: 5, status: 'completed' },
    { log_date: '2026-07-16', points_earned: 2, status: 'failed' },
    { log_date: '2026-07-15', points_earned: 8, status: 'cheated' },
  ];
  const reflections = [
    { reflection_date: '2026-07-17', masturbation_happened: true, primary_blocker: 'stress' },
    { reflection_date: '2026-07-16', masturbation_happened: false, primary_blocker: null },
  ];
  const money = [{ amount: '4.50' }, { amount: 5 }];
  const streaks = [{ is_active: true, current_count: 4, best_count: 6 }, { is_active: false, current_count: 1, best_count: 2 }];

  const service = new AnalyticsService(repo(logs) as never, repo(reflections) as never, repo(money) as never, repo(streaks) as never);
  const result = await service.weekly('user-1');

  assert.equal(result.weekStart, '2026-07-15');
  assert.equal(result.weekEnd, '2026-07-17');
  assert.equal(result.totalScore, 25);
  assert.equal(result.avgScore, 25 / 3);
  assert.equal(result.completedTasks, 2);
  assert.equal(result.failedTasks, 2);
  assert.equal(result.streaksActive, 1);
  assert.equal(result.moneySaved, 9.5);
  assert.equal(result.masturbationDays, 1);
  assert.deepEqual(result.bestDay, { date: '2026-07-17', score: 15 });
  assert.deepEqual(result.worstDay, { date: '2026-07-16', score: 2 });
  assert.equal(result.taskCompletionRate, 0.5);
}

async function testBlockerCounts(): Promise<void> {
  const reflections = [
    { primary_blocker: 'stress' },
    { primary_blocker: 'stress' },
    { primary_blocker: null },
  ];
  const service = new AnalyticsService(repo([]) as never, repo(reflections) as never, repo([]) as never, repo([]) as never);
  const result = await service.blockers('user-1');

  assert.deepEqual(result.thisWeek, { stress: 2, other: 1 });
  assert.deepEqual(result.thisMonth, { stress: 2, other: 1 });
  assert.deepEqual(result.trend, [
    { blocker: 'stress', count: 2 },
    { blocker: 'other', count: 1 },
  ]);
}

async function run(): Promise<void> {
  await testWeeklyAnalytics();
  await testBlockerCounts();
  console.log('analytics.service tests passed');
}

void run();
