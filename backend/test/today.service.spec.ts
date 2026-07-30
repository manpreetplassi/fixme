import 'reflect-metadata';
import * as assert from 'node:assert/strict';
import { TodayService } from '../src/today/today.service';

function repo<T extends { id?: string }>(items: T[] = []) {
  return {
    count: async () => items.length,
    create: (data: Partial<T> | Array<Partial<T>>) => Array.isArray(data) ? data.map((entry) => ({ id: `id-${items.length + 1}`, ...entry })) : { id: data.id ?? `id-${items.length + 1}`, ...data },
    find: async () => items,
    findOne: async () => null,
    save: async (item: T | T[]) => {
      if (Array.isArray(item)) {
        items.push(...item);
        return item;
      }
      items.push(item);
      return item;
    },
  };
}

async function testTodayScoreContract(): Promise<void> {
  const completions = [
    {
      id: 'completion-1',
      completion_date: '2026-07-18',
      status: 'done',
      points_earned: 10,
      routine_item: { id: 'routine-1', title: 'Exercise 1 Hour', priority: 'urgent' },
    },
  ];
  const service = new TodayService(
    repo([{ id: 'routine-1' }]) as never,
    { ...repo(completions), find: async () => completions } as never,
    repo([]) as never,
    repo([]) as never,
    repo([]) as never,
    repo([]) as never,
    { sendDigest: async () => ({}), getDeliveryStatus: () => ({ configured: false, missing: [], override_recipient_configured: false }) } as never,
    { findAll: async () => [] } as never,
  );

  const score = await service.getTodayScore({ id: 'user-1' } as never, '2026-07-18');
  assert.equal(score.date, '2026-07-18');
  assert.equal(score.dailyScore, 20);
  assert.equal(score.tasksCompleted, 1);
  assert.equal(score.tasksFailed, 0);
  assert.deepEqual(score.streakUpdate, []);
}

export async function runTodayServiceTests(): Promise<void> {
  await testTodayScoreContract();
  console.log('today.service tests passed');
}

if (require.main === module) {
  void runTodayServiceTests();
}
