import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateRoutineItemDto, ScreenCheckInDto, SetRoutineDoneDto, UpdateRoutineItemDto } from './dto/today.dto';
import { RoutineCompletion } from './entities/routine-completion.entity';
import { RoutineItem } from './entities/routine-item.entity';
import { ScreenCheckIn } from './entities/screen-check-in.entity';
import { TodayRemindersService } from './today-reminders.service';

const priorityRank: Record<string, number> = { urgent: 0, important: 1, low: 2 };
const systemItems = [
  { key: 'screen_daily', title: 'Screen check-in', category: 'screen', time_block: '22:00', priority: 'important', repeat_rule: 'daily', reminder_enabled: false, period: null },
];

@Injectable()
export class TodayService {
  constructor(
    @InjectRepository(RoutineItem) private readonly routineRepo: Repository<RoutineItem>,
    @InjectRepository(RoutineCompletion) private readonly completionRepo: Repository<RoutineCompletion>,
    @InjectRepository(ScreenCheckIn) private readonly screenRepo: Repository<ScreenCheckIn>,
    private readonly reminders: TodayRemindersService,
  ) {}

  async getToday(user: User, date = this.todayString()) {
    await this.ensureStarterRoutine(user);
    const [items, completions, checkIns] = await Promise.all([
      this.routineRepo.find({ where: { user: { id: user.id }, is_active: true }, order: { display_order: 'ASC', created_at: 'ASC' } }),
      this.completionRepo.find({ where: { user: { id: user.id }, completion_date: date }, relations: { routine_item: true } }),
      this.screenRepo.find({ where: { user: { id: user.id }, check_date: date } }),
    ]);

    const routine = items
      .filter((item) => this.shouldShow(item, date, completions))
      .map((item) => {
        const completion = completions.find((entry) => entry.routine_item?.id === item.id);
        return this.toRoutineResponse(item, completion ?? null, date);
      });

    const checks = systemItems.map((item) => {
      const checkIn = checkIns.find((entry) => entry.check_date === date);
      const completion = completions.find((entry) => entry.system_key === item.key);
      return {
        ...item,
        id: item.key,
        type: 'screen_checkin',
        status: completion?.status ?? (checkIn ? 'done' : 'not_started'),
        points: 0,
        points_earned: completion?.points_earned ?? 0,
        linked_money_entry_id: completion?.linked_money_entry_id ?? null,
        is_done: Boolean(checkIn) || Boolean(completion && this.isDoneStatus(completion.status)),
        overdue: this.isOverdue(item.time_block, Boolean(checkIn) || Boolean(completion && this.isDoneStatus(completion.status)), date),
        check_in: checkIn ?? null,
      };
    });

    const allItems = [...routine, ...checks].sort(this.sortItems);
    const overdue = allItems.filter((item) => item.overdue && item.reminder_enabled);

    return {
      date,
      items: allItems,
      overdue,
      screen: await this.getScreenSummary(user.id, date),
    };
  }

  async createItem(user: User, dto: CreateRoutineItemDto) {
    const item = this.routineRepo.create({ ...dto, user, time_block: dto.time_block ?? null, reminder_enabled: dto.reminder_enabled ?? false, points: dto.points ?? 0, linked_money_entry_id: dto.linked_money_entry_id ?? null });
    return this.routineRepo.save(item);
  }

  async updateItem(userId: string, id: string, dto: UpdateRoutineItemDto) {
    const item = await this.findItem(userId, id);
    Object.assign(item, dto);
    if (dto.time_block === null) item.time_block = null;
    return this.routineRepo.save(item);
  }

  async removeItem(userId: string, id: string) {
    const item = await this.findItem(userId, id);
    item.is_active = false;
    await this.routineRepo.save(item);
    return { deleted: true };
  }

  async setDone(user: User, id: string, dto: SetRoutineDoneDto) {
    const date = dto.date ?? this.todayString();
    const item = await this.findItem(user.id, id);
    let completion = await this.completionRepo.findOne({ where: { user: { id: user.id }, routine_item: { id }, completion_date: date } });
    if (!completion) {
      completion = this.completionRepo.create({ user, routine_item: item, system_key: null, completion_date: date });
    }
    const status = dto.status ?? (dto.is_done ? 'done' : 'not_started');
    const isDone = this.isDoneStatus(status);
    completion.status = status;
    completion.is_done = isDone;
    completion.completed_at = isDone ? new Date() : null;
    completion.note = dto.note ?? null;
    completion.points_earned = dto.points_earned ?? (isDone ? item.points : 0);
    completion.duration_minutes = dto.duration_minutes ?? null;
    completion.rating = dto.rating ?? null;
    completion.linked_money_entry_id = dto.linked_money_entry_id ?? item.linked_money_entry_id ?? null;
    return this.completionRepo.save(completion);
  }

  async checkIn(user: User, dto: ScreenCheckInDto) {
    const date = dto.date ?? this.todayString();
    const period = dto.period ?? 'daily';
    let checkIn = await this.screenRepo.findOne({ where: { user: { id: user.id }, check_date: date, period } });
    if (!checkIn) {
      checkIn = this.screenRepo.create({ user, check_date: date, period });
    }

    checkIn.watched = dto.watched;
    checkIn.content_type = dto.watched ? dto.content_type ?? 'other' : null;
    checkIn.title_note = dto.watched ? dto.title_note ?? null : null;
    checkIn.stopped_watching_at = dto.watched ? dto.stopped_watching_at ?? null : null;
    const saved = await this.screenRepo.save(checkIn);

    await this.markSystemDone(user, 'screen_daily', date);
    return saved;
  }

  async deleteCheckIn(user: User, date = this.todayString()) {
    await this.screenRepo.delete({ user: { id: user.id }, check_date: date });
    await this.completionRepo.delete({ user: { id: user.id }, system_key: 'screen_daily', completion_date: date });
    return { deleted: true };
  }

  async getScreenSummary(userId: string, date = this.todayString()) {
    const days = this.lastDays(date, 7);
    const checkIns = await this.screenRepo.find({
      where: { user: { id: userId }, check_date: Between(days[0], days[days.length - 1]) },
      order: { check_date: 'ASC' },
    });

    const week = days.map((day) => ({
      date: day,
      check_in: checkIns.find((entry) => entry.check_date === day) ?? null,
    }));

    return {
      week,
      streak: this.cleanStreak(week),
    };
  }

  async sendReminderDigest(user: User, date = this.todayString()) {
    const today = await this.getToday(user, date);
    return this.reminders.sendDigest({
      userEmail: user.email,
      items: today.overdue.map((item) => ({ title: item.title, time_block: item.time_block, priority: item.priority })),
    });
  }

  private async ensureStarterRoutine(user: User) {
    const count = await this.routineRepo.count({ where: { user: { id: user.id } } });
    if (count > 0) return;

    await this.routineRepo.save(
      this.routineRepo.create([
        { user, title: 'Wake up and hydrate', category: 'health', time_block: '06:30', priority: 'urgent', repeat_rule: 'daily', reminder_enabled: true, display_order: 1 },
        { user, title: 'Exercise or walk', category: 'health', time_block: '07:30', priority: 'important', repeat_rule: 'daily', reminder_enabled: true, display_order: 2 },
        { user, title: 'Focused learning block', category: 'learning', time_block: '20:00', priority: 'important', repeat_rule: 'weekdays', reminder_enabled: false, display_order: 3 },
        { user, title: 'Review money saved today', category: 'money', time_block: '21:15', priority: 'low', repeat_rule: 'daily', reminder_enabled: false, display_order: 4 },
        { user, title: 'Sleep shutdown routine', category: 'health', time_block: '22:45', priority: 'urgent', repeat_rule: 'daily', reminder_enabled: true, display_order: 5 },
      ]),
    );
  }

  private async findItem(userId: string, id: string) {
    const item = await this.routineRepo.findOne({ where: { id, user: { id: userId } } });
    if (!item) throw new NotFoundException('Routine item not found');
    return item;
  }

  private async markSystemDone(user: User, systemKey: string, date: string) {
    let completion = await this.completionRepo.findOne({ where: { user: { id: user.id }, system_key: systemKey, completion_date: date } });
    if (!completion) {
      completion = this.completionRepo.create({ user, routine_item: null, system_key: systemKey, completion_date: date });
    }
    completion.is_done = true;
    completion.status = 'done';
    completion.points_earned = 0;
    completion.completed_at = new Date();
    await this.completionRepo.save(completion);
  }

  private toRoutineResponse(item: RoutineItem, completion: RoutineCompletion | null, date: string) {
    const status = completion?.status ?? 'not_started';
    const isDone = completion ? this.isDoneStatus(status) : false;
    return {
      id: item.id,
      type: 'routine',
      title: item.title,
      category: item.category,
      time_block: item.time_block,
      priority: item.priority,
      repeat_rule: item.repeat_rule,
      reminder_enabled: item.reminder_enabled,
      status,
      points: item.points,
      points_earned: completion?.points_earned ?? 0,
      linked_money_entry_id: completion?.linked_money_entry_id ?? item.linked_money_entry_id,
      is_done: isDone,
      overdue: this.isOverdue(item.time_block, isDone, date),
    };
  }

  private shouldShow(item: RoutineItem, date: string, completions: RoutineCompletion[]) {
    const day = new Date(`${date}T00:00:00`).getDay();
    if (item.repeat_rule === 'weekdays' && (day === 0 || day === 6)) return false;
    if (item.repeat_rule === 'once') {
      return !completions.some((entry) => entry.routine_item?.id === item.id && entry.is_done);
    }
    return true;
  }

  private isOverdue(timeBlock: string | null, isDone: boolean, date: string) {
    if (!timeBlock || isDone || date !== this.todayString()) return false;
    const [hour, minute] = timeBlock.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    return now.getTime() > target.getTime();
  }

  private sortItems(a: { time_block: string | null; priority: string }, b: { time_block: string | null; priority: string }) {
    const timeA = a.time_block ?? '99:99';
    const timeB = b.time_block ?? '99:99';
    if (timeA !== timeB) return timeA.localeCompare(timeB);
    return (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
  }

private todayString() {
    return new Date().toISOString().slice(0, 10);
  }

  private lastDays(endDate: string, count: number) {
    const end = new Date(`${endDate}T00:00:00`);
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(end);
      date.setDate(end.getDate() - (count - 1 - index));
      return date.toISOString().slice(0, 10);
    });
  }

  private cleanStreak(week: Array<{ check_in: ScreenCheckIn | null }>) {
    let count = 0;
    for (const day of [...week].reverse()) {
      if (!day.check_in || day.check_in.watched) break;
      count += 1;
    }
    return count;
  }

  private isDoneStatus(status: string) {
    return status === 'done' || status === 'completed';
  }
}
