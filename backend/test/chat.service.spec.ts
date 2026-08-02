import 'reflect-metadata';
import * as assert from 'node:assert/strict';
import { ChatService } from '../src/chat/chat.service';

type Entity = { id?: string; conversation_id?: string; status?: string; user?: { id: string } };

function repo<T extends Entity>(items: T[] = []) {
  return {
    create: (data: Partial<T>) => ({ id: data.id ?? `id-${items.length + 1}`, ...data }),
    delete: async () => ({ affected: 1 }),
    find: async () => items,
    findOne: async ({ where }: { where: { id?: string; conversation_id?: string; status?: string; user?: { id: string } } }) => (
      items.find((item) => (
        (!where.id || item.id === where.id) &&
        (!where.conversation_id || item.conversation_id === where.conversation_id) &&
        (!where.status || item.status === where.status) &&
        (!where.user?.id || item.user?.id === where.user.id)
      )) ?? null
    ),
    remove: async (item: T) => {
      const index = items.indexOf(item);
      if (index >= 0) items.splice(index, 1);
      return item;
    },
    save: async (item: T) => {
      if (!item.id) item.id = `id-${items.length + 1}`;
      const existingIndex = items.findIndex((existing) => existing.id === item.id);
      if (existingIndex >= 0) items[existingIndex] = item;
      else items.push(item);
      return item;
    },
  };
}

async function testGeminiProposedTaskCanBeConfirmedForSameUser(): Promise<void> {
  const user = { id: 'user-1', email: 'demo@fixme.app', name: 'Demo User' };
  const conversations = [{ conversation_id: 'conversation-1', user, title: null }];
  const messages: Array<Record<string, unknown>> = [];
  const actions: Array<Record<string, unknown>> = [];
  const createdTasks: Array<{ user: typeof user; dto: Record<string, unknown> }> = [];

  const geminiService = {
    streamChat: async function* () {
      yield 'I can set that up for confirmation.\n';
      yield 'FIXME_ACTIONS_JSON\n';
      yield '[{"name":"createRoutineItem","arguments":{"title":"Walk 20 minutes","category":"health","priority":"important","repeat_rule":"once","time_block":"18:00"}}]';
      yield '\nEND_FIXME_ACTIONS_JSON';
    },
    getStatus: () => ({ configured: true, keyName: 'GEMINI_API_KEY', model: 'gemini-3.6-flash' }),
    diagnose: async () => ({ ok: true }),
  };

  const todayService = {
    getToday: async () => ({ date: '2026-08-02', items: [], overdue: [], screen: {} }),
    createItem: async (taskUser: typeof user, dto: Record<string, unknown>) => {
      createdTasks.push({ user: taskUser, dto });
      return { id: 'task-1', ...dto };
    },
  };

  const moneyTrackerService = {
    findAll: async () => [],
    summary: async () => ({ totalSaved: 0, totalSpent: 0 }),
  };

  const service = new ChatService(
    repo(actions) as never,
    repo(conversations) as never,
    repo(messages) as never,
    moneyTrackerService as never,
    todayService as never,
    { get: (_key: string, fallback?: string) => fallback } as never,
    geminiService as never,
  );

  const chunks: string[] = [];
  await service.sendMessage(user as never, 'conversation-1', 'Create a task to walk at 6pm', (chunk) => chunks.push(chunk));

  const streamed = chunks.join('');
  assert.match(streamed, /I can set that up/);
  assert.doesNotMatch(streamed, /FIXME_ACTIONS_JSON/);
  assert.match(streamed, /FIXME_PENDING_ACTIONS_JSON/);
  assert.equal(actions.length, 1);
  assert.equal(actions[0].user, user);
  assert.equal(actions[0].action_type, 'routine_item_create');
  assert.deepEqual(actions[0].payload, {
    category: 'health',
    priority: 'important',
    repeat_rule: 'once',
    scheduled_date: '2026-08-02',
    points: 10,
    title: 'Walk 20 minutes',
    time_block: '18:00',
  });

  await service.confirm(user as never, actions[0].id as string);
  assert.equal(createdTasks.length, 1);
  assert.equal(createdTasks[0].user, user);
  assert.equal(createdTasks[0].dto.title, 'Walk 20 minutes');
  assert.equal(createdTasks[0].dto.time_block, '18:00');
}

export async function runChatServiceTests(): Promise<void> {
  await testGeminiProposedTaskCanBeConfirmedForSameUser();
  console.log('chat.service tests passed');
}

if (require.main === module) {
  void runChatServiceTests();
}
