import 'reflect-metadata';
import * as assert from 'node:assert/strict';
import { NotFoundException } from '@nestjs/common';
import { DailyLogsService } from '../src/daily-logs/daily-logs.service';

function repo<T extends { id?: string }>(items: T[] = []) {
  return {
    create: (data: Partial<T>) => ({ id: data.id ?? `id-${items.length + 1}`, ...data }),
    find: async () => items,
    findOne: async ({ where }: { where: { id?: string } }) => items.find((item) => item.id === where.id) ?? null,
    remove: async (item: T) => {
      const index = items.indexOf(item);
      if (index >= 0) items.splice(index, 1);
      return item;
    },
    save: async (item: T) => {
      const existingIndex = items.findIndex((existing) => existing.id === item.id);
      if (existingIndex >= 0) items[existingIndex] = item;
      else items.push(item);
      return item;
    },
  };
}

async function testCreateAndScore(): Promise<void> {
  const task = { id: 'task-1', name: 'Exercise 1 Hour', points: 10, priority: 'critical' };
  const logs: Array<Record<string, unknown>> = [];
  const service = new DailyLogsService(
    repo(logs) as never,
    { findOne: async () => task } as never,
    { refreshUserStreaks: async () => undefined, findAll: async () => [] } as never,
  );

  const created = await service.create({ id: 'user-1' } as never, {
    task_id: 'task-1',
    log_date: '2026-07-18',
    status: 'completed',
  });

  assert.equal(created.points_earned, 10);
  assert.equal(created.status, 'completed');

  const score = await service.getTodayScore('user-1', '2026-07-18');
  assert.equal(score.dailyScore, 20);
  assert.equal(score.tasksCompleted, 1);
}

async function testMissingLogThrows(): Promise<void> {
  const service = new DailyLogsService(repo([]) as never, repo([]) as never, { refreshUserStreaks: async () => undefined } as never);
  await assert.rejects(() => service.findOne('missing', 'user-1'), NotFoundException);
}

export async function runDailyLogsServiceTests(): Promise<void> {
  await testCreateAndScore();
  await testMissingLogThrows();
  console.log('daily-logs.service tests passed');
}

if (require.main === module) {
  void runDailyLogsServiceTests();
}
