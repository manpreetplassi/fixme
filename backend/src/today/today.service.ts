import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import { LearningLog } from '../learning-logs/entities/learning-log.entity';
import { LifestyleActivity } from '../lifestyle/entities/lifestyle-activity.entity';
import { User } from '../users/entities/user.entity';
import { StreaksService } from '../streaks/streaks.service';
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
export class TodayService implements OnModuleInit, OnModuleDestroy {
  private rolloverTimer: NodeJS.Timeout | null = null;
  private reminderTimer: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(RoutineItem) private readonly routineRepo: Repository<RoutineItem>,
    @InjectRepository(RoutineCompletion) private readonly completionRepo: Repository<RoutineCompletion>,
    @InjectRepository(ScreenCheckIn) private readonly screenRepo: Repository<ScreenCheckIn>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(LifestyleActivity) private readonly activityRepo: Repository<LifestyleActivity>,
    @InjectRepository(LearningLog) private readonly learningRepo: Repository<LearningLog>,
    private readonly reminders: TodayRemindersService,
    private readonly streaksService: StreaksService,
  ) {}

  onModuleInit() {
    this.rolloverTimer = setInterval(() => void this.runDayRollover(), 30 * 60 * 1000);
    this.reminderTimer = setInterval(() => void this.sendAutomaticReminders(), 15 * 60 * 1000);
    this.rolloverTimer.unref?.();
    this.reminderTimer.unref?.();
    void this.runDayRollover();
  }

  onModuleDestroy() {
    if (this.rolloverTimer) clearInterval(this.rolloverTimer);
    if (this.reminderTimer) clearInterval(this.reminderTimer);
  }

  async getToday(user: User, date = this.todayString()) {
    await this.ensureStarterRoutine(user);
    if (date < this.todayString()) await this.materializeMissingCompletions(user, date);
    const [items, completions, checkIns, hobbyActivities, learningLogs] = await Promise.all([
      this.routineRepo.find({ where: { user: { id: user.id }, is_active: true }, order: { display_order: 'ASC', created_at: 'ASC' } }),
      this.completionRepo.find({ where: { user: { id: user.id }, completion_date: date }, relations: { routine_item: true } }),
      this.screenRepo.find({ where: { user: { id: user.id }, check_date: date } }),
      this.activityRepo.find({ where: { user: { id: user.id }, activity_date: date, activity_type: 'hobby' }, order: { start_time: 'ASC', created_at: 'ASC' } }),
      this.learningRepo.find({ where: { user: { id: user.id }, log_date: date }, order: { created_at: 'ASC' } }),
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
        score: completion?.score ?? null,
        duration_minutes: completion?.duration_minutes ?? null,
        timer_started_at: completion?.timer_started_at ?? null,
        actual_value: completion?.actual_value ?? null,
        linked_money_entry_id: completion?.linked_money_entry_id ?? null,
        is_done: Boolean(checkIn) || Boolean(completion && this.isDoneStatus(completion.status)),
        overdue: this.isOverdue(item.time_block, Boolean(checkIn) || Boolean(completion && this.isDoneStatus(completion.status)), date),
        check_in: checkIn ?? null,
      };
    });

    const loggedItems = [
      ...hobbyActivities.map((activity) => this.toLoggedActivityResponse(activity)),
      ...learningLogs.map((log) => this.toLearningLogResponse(log)),
    ];
    const allItems = [...routine, ...loggedItems, ...checks].sort(this.sortItems);
    const overdue = allItems.filter((item) => item.overdue && item.reminder_enabled);

    return {
      date,
      items: allItems,
      overdue,
      screen: await this.getScreenSummary(user.id, date),
      reminders: this.getReminderStatus(),
    };
  }

  async createItem(user: User, dto: CreateRoutineItemDto) {
    const parentTag = dto.parent_tag ?? dto.category;
    const item = this.routineRepo.create({
      ...dto,
      user,
      category: parentTag,
      parent_tag: parentTag,
      sub_tag: dto.sub_tag ?? null,
      time_block: dto.time_block ?? null,
      consequence_note: dto.consequence_note ?? null,
      scheduled_date: dto.repeat_rule === 'once' ? dto.scheduled_date ?? this.todayString() : dto.scheduled_date ?? null,
      reminder_enabled: dto.reminder_enabled ?? false,
      reminder_trigger_type: dto.reminder_trigger_type ?? 'time',
      reminder_trigger_item_id: dto.reminder_trigger_item_id ?? null,
      time_tracking_enabled: dto.time_tracking_enabled ?? false,
      item_type: dto.item_type ?? 'simple',
      target_value: dto.target_value ?? null,
      target_unit: dto.target_unit ?? null,
      tolerance_value: dto.tolerance_value ?? null,
      points: dto.points ?? 0,
      linked_money_entry_id: dto.linked_money_entry_id ?? null,
    });
    return this.routineRepo.save(item);
  }

  async updateItem(userId: string, id: string, dto: UpdateRoutineItemDto) {
    const item = await this.findItem(userId, id);
    Object.assign(item, dto);
    if (dto.parent_tag !== undefined) {
      item.parent_tag = dto.parent_tag;
      item.category = dto.parent_tag ?? item.category;
    }
    if (dto.sub_tag !== undefined) item.sub_tag = dto.sub_tag;
    if (dto.time_block === null) item.time_block = null;
    if (dto.scheduled_date === null) item.scheduled_date = null;
    if (dto.repeat_rule === 'once' && !item.scheduled_date) item.scheduled_date = this.todayString();
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
    completion.blocker_reason = dto.blocker_reason ?? null;
    completion.actual_value = dto.actual_value ?? null;
    completion.score = dto.score ?? this.calculateScore(item, status, completion.actual_value);
    completion.points_earned = dto.points_earned ?? this.calculatePoints(item, completion.score);
    completion.duration_minutes = dto.duration_minutes ?? completion.duration_minutes ?? null;
    completion.rating = dto.rating ?? null;
    completion.linked_money_entry_id = dto.linked_money_entry_id ?? item.linked_money_entry_id ?? null;
    const saved = await this.completionRepo.save(completion);
    if (isDone) await this.sendContextReminder(user, 'after_item', item.id);
    return saved;
  }

  async startTimer(user: User, id: string, date = this.todayString()) {
    const item = await this.findItem(user.id, id);
    if (!item.time_tracking_enabled) throw new NotFoundException('Time tracking is not enabled for this routine item');
    const completion = await this.getOrCreateCompletion(user, item, date);
    completion.timer_started_at = new Date();
    return this.completionRepo.save(completion);
  }

  async stopTimer(user: User, id: string, date = this.todayString()) {
    const item = await this.findItem(user.id, id);
    if (!item.time_tracking_enabled) throw new NotFoundException('Time tracking is not enabled for this routine item');
    const completion = await this.getOrCreateCompletion(user, item, date);
    if (completion.timer_started_at) {
      const elapsedMs = Date.now() - completion.timer_started_at.getTime();
      completion.duration_minutes = Math.max(0, Math.round(elapsedMs / 60000));
      completion.timer_started_at = null;
    }
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
    await this.sendContextReminder(user, 'check_in', null);
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

  getReminderStatus() {
    return this.reminders.getDeliveryStatus();
  }

  async getTodayScore(user: User, date = this.todayString()) {
    await this.ensureStarterRoutine(user);
    const completions = await this.completionRepo.find({
      where: { user: { id: user.id }, completion_date: date },
      relations: { routine_item: true },
    });
    const routineCompletions = completions.filter((completion) => completion.routine_item);
    const completedTasks = routineCompletions.filter((completion) => this.isDoneStatus(completion.status));
    const failedTasks = routineCompletions.filter((completion) => completion.status === 'failed' || completion.status === 'cheated');
    const baseScore = completedTasks.reduce((sum, completion) => sum + Number(completion.points_earned ?? 0), 0);

    const sleepMissed = routineCompletions.some((completion) => this.titleIncludes(completion, 'sleep') && !this.isDoneStatus(completion.status));
    const masturbationLogged = routineCompletions.some((completion) => this.titleIncludes(completion, 'masturbation') && !this.isDoneStatus(completion.status));
    const junkFoodLogged = routineCompletions.some((completion) => this.titleIncludes(completion, 'junk food') && !this.isDoneStatus(completion.status));

    let modifier = 1;
    if (sleepMissed) modifier -= 0.2;
    if (masturbationLogged) modifier -= 0.15;
    if (junkFoodLogged) modifier -= 0.1;

    const criticalTasks = routineCompletions.filter((completion) => completion.routine_item?.priority === 'urgent');
    const allCriticalDone = criticalTasks.length > 0 && criticalTasks.every((completion) => this.isDoneStatus(completion.status));

    return {
      date,
      dailyScore: Math.max(0, Math.round(baseScore * modifier + (allCriticalDone ? 10 : 0))),
      tasksCompleted: completedTasks.length,
      tasksFailed: failedTasks.length,
      streakUpdate: await this.streaksService.findAll(user.id),
    };
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

  private async getOrCreateCompletion(user: User, item: RoutineItem, date: string) {
    let completion = await this.completionRepo.findOne({ where: { user: { id: user.id }, routine_item: { id: item.id }, completion_date: date } });
    if (!completion) {
      completion = this.completionRepo.create({ user, routine_item: item, system_key: null, completion_date: date, is_done: false, status: 'not_started', points_earned: 0 });
    }
    return completion;
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
      parent_tag: item.parent_tag ?? item.category,
      sub_tag: item.sub_tag,
      time_block: item.time_block,
      consequence_note: item.consequence_note,
      priority: item.priority,
      repeat_rule: item.repeat_rule,
      scheduled_date: item.scheduled_date,
      item_type: item.item_type,
      target_value: item.target_value,
      target_unit: item.target_unit,
      tolerance_value: item.tolerance_value,
      reminder_enabled: item.reminder_enabled,
      reminder_trigger_type: item.reminder_trigger_type,
      reminder_trigger_item_id: item.reminder_trigger_item_id,
      time_tracking_enabled: item.time_tracking_enabled,
      status,
      points: item.points,
      source: item.source,
      plan_id: item.plan_id,
      icon: item.icon,
      points_earned: completion?.points_earned ?? 0,
      score: completion?.score ?? null,
      duration_minutes: completion?.duration_minutes ?? null,
      timer_started_at: completion?.timer_started_at ?? null,
      actual_value: completion?.actual_value ?? null,
      linked_money_entry_id: completion?.linked_money_entry_id ?? item.linked_money_entry_id,
      blocker_reason: completion?.blocker_reason ?? null,
      is_done: isDone,
      overdue: this.isOverdue(item.time_block, isDone, date),
    };
  }

  private toLoggedActivityResponse(activity: LifestyleActivity) {
    return {
      id: activity.id,
      type: 'lifestyle_activity',
      title: activity.name ?? 'Hobby activity',
      category: 'hobby',
      parent_tag: 'Hobbies',
      sub_tag: null,
      time_block: activity.start_time,
      priority: 'low',
      repeat_rule: 'logged',
      scheduled_date: activity.activity_date,
      item_type: 'simple',
      target_value: null,
      target_unit: null,
      tolerance_value: null,
      reminder_enabled: false,
      reminder_trigger_type: 'time',
      reminder_trigger_item_id: null,
      time_tracking_enabled: false,
      status: 'done',
      points: 0,
      source: 'lifestyle_activity',
      plan_id: null,
      icon: null,
      points_earned: 0,
      score: null,
      duration_minutes: activity.duration_minutes,
      timer_started_at: null,
      actual_value: null,
      linked_money_entry_id: activity.linked_money_entry_id,
      is_done: true,
      overdue: false,
      note: activity.notes,
    };
  }

  private toLearningLogResponse(log: LearningLog) {
    return {
      id: log.id,
      type: 'learning_log',
      title: log.title,
      category: 'learning',
      parent_tag: 'Learning',
      sub_tag: log.tags,
      time_block: null,
      priority: 'low',
      repeat_rule: 'logged',
      scheduled_date: log.log_date,
      item_type: 'simple',
      target_value: null,
      target_unit: null,
      tolerance_value: null,
      reminder_enabled: false,
      reminder_trigger_type: 'time',
      reminder_trigger_item_id: null,
      time_tracking_enabled: false,
      status: 'done',
      points: 0,
      source: 'learning_log',
      plan_id: null,
      icon: null,
      points_earned: 0,
      score: null,
      duration_minutes: null,
      timer_started_at: null,
      actual_value: null,
      linked_money_entry_id: null,
      is_done: true,
      overdue: false,
      note: log.key_notes,
    };
  }

  private shouldShow(item: RoutineItem, date: string, completions: RoutineCompletion[]) {
    const day = new Date(`${date}T00:00:00`).getDay();
    if (item.repeat_rule === 'weekdays' && (day === 0 || day === 6)) return false;
    if (item.repeat_rule === 'once') {
      return item.scheduled_date === date && !completions.some((entry) => entry.routine_item?.id === item.id && entry.is_done);
    }
    if (item.repeat_rule === 'weekly') {
      const createdDay = new Date(item.scheduled_date ? `${item.scheduled_date}T00:00:00` : item.created_at).getDay();
      return day === createdDay;
    }
    return true;
  }

  private async runDayRollover() {
    const yesterday = this.addDays(this.todayString(), -1);
    const users = await this.userRepo.find();
    await Promise.all(users.map((user) => this.materializeMissingCompletions(user, yesterday)));
  }

  private async materializeMissingCompletions(user: User, date: string) {
    const [items, completions] = await Promise.all([
      this.routineRepo.find({ where: { user: { id: user.id }, is_active: true } }),
      this.completionRepo.find({ where: { user: { id: user.id }, completion_date: date }, relations: { routine_item: true } }),
    ]);
    const missing = items.filter((item) => this.shouldShow(item, date, completions) && !completions.some((entry) => entry.routine_item?.id === item.id));
    if (missing.length === 0) return;
    await this.completionRepo.save(missing.map((item) => this.completionRepo.create({
      user,
      routine_item: item,
      system_key: null,
      completion_date: date,
      is_done: false,
      status: 'failed',
      points_earned: 0,
      score: 0,
    })));
  }

  private async sendAutomaticReminders() {
    if (!this.getReminderStatus().configured) return;
    const users = await this.userRepo.find();
    await Promise.all(users.map((user) => this.sendTimedReminders(user).catch(() => null)));
  }

  private async sendTimedReminders(user: User) {
    const today = await this.getToday(user);
    const dueNow = today.overdue.filter((item) => item.time_block && this.minutesSinceTimeBlock(item.time_block) <= 15);
    if (dueNow.length === 0) return;
    await this.reminders.sendDigest({
      userEmail: user.email,
      items: dueNow.map((item) => ({ title: item.title, time_block: item.time_block, priority: item.priority })),
    });
  }

  private async sendContextReminder(user: User, triggerType: string, triggerItemId: string | null) {
    if (!this.getReminderStatus().configured) return;
    const items = await this.routineRepo.find({
      where: {
        user: { id: user.id },
        is_active: true,
        reminder_enabled: true,
        reminder_trigger_type: triggerType,
        reminder_trigger_item_id: triggerItemId ?? IsNull(),
      },
    });
    if (items.length === 0) return;
    await this.reminders.sendDigest({
      userEmail: user.email,
      items: items.map((item) => ({ title: item.title, time_block: item.time_block, priority: item.priority })),
    });
  }

  private calculateScore(item: RoutineItem, status: string, actualValue: number | null) {
    if (status === 'skipped' || status === 'not_started') return null;
    if (status === 'failed') return 0;
    if (item.item_type !== 'measurable' || item.target_value === null || item.target_value === undefined) return this.isDoneStatus(status) ? 10 : 0;
    const target = Number(item.target_value);
    const actual = Number(actualValue ?? 0);
    const tolerance = Number(item.tolerance_value ?? 0);
    if (target <= 0) return this.isDoneStatus(status) ? 10 : 0;
    const diff = Math.max(0, Math.abs(target - actual) - tolerance);
    return Math.max(0, Math.min(10, Math.round((1 - diff / target) * 10)));
  }

  private calculatePoints(item: RoutineItem, score: number | null) {
    if (score === null) return 0;
    return Math.round((item.points * score) / 10);
  }

  private titleIncludes(completion: RoutineCompletion, text: string) {
    return completion.routine_item?.title.toLowerCase().includes(text) ?? false;
  }

  private isOverdue(timeBlock: string | null, isDone: boolean, date: string) {
    if (!timeBlock || isDone || date !== this.todayString()) return false;
    const [hour, minute] = timeBlock.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    return now.getTime() > target.getTime();
  }

  private minutesSinceTimeBlock(timeBlock: string) {
    const [hour, minute] = timeBlock.split(':').map(Number);
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    return Math.max(0, Math.floor((Date.now() - target.getTime()) / 60000));
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

  private addDays(date: string, days: number) {
    const value = new Date(`${date}T00:00:00`);
    value.setDate(value.getDate() + days);
    return value.toISOString().slice(0, 10);
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
