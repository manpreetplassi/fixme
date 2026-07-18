import 'reflect-metadata';
import * as assert from 'node:assert/strict';
import { NotFoundException } from '@nestjs/common';
import { MoneyTrackerService } from '../src/money-tracker/money-tracker.service';

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

async function testCrudAndSummary(): Promise<void> {
  const items: Array<Record<string, unknown>> = [];
  const service = new MoneyTrackerService(repo(items) as never);

  const created = await service.create({ id: 'user-1' } as never, { amount: 100, log_date: '2026-07-18', reason: 'Cooked' });
  assert.equal(created.amount, 100);

  const updated = await service.update(created.id as string, 'user-1', { amount: 150 });
  assert.equal(updated.amount, 150);

  const summary = await service.summary('user-1');
  assert.equal(summary.thisWeek, 150);

  await service.remove(created.id as string, 'user-1');
  assert.equal(items.length, 0);
}

async function testMissingEntryThrows(): Promise<void> {
  const service = new MoneyTrackerService(repo([]) as never);
  await assert.rejects(() => service.findOne('missing', 'user-1'), NotFoundException);
}

export async function runMoneyTrackerServiceTests(): Promise<void> {
  await testCrudAndSummary();
  await testMissingEntryThrows();
  console.log('money-tracker.service tests passed');
}

if (require.main === module) {
  void runMoneyTrackerServiceTests();
}
