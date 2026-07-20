import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyTask } from '../daily-tasks/entities/daily-task.entity';
import { StreaksService } from '../streaks/streaks.service';
import { User } from '../users/entities/user.entity';
import { CreateDailyLogDto, UpdateDailyLogDto } from './dto/daily-log.dto';
import { DailyLog } from './entities/daily-log.entity';

@Injectable()
export class DailyLogsService {
  constructor(
    @InjectRepository(DailyLog) private readonly logRepo: Repository<DailyLog>,
    @InjectRepository(DailyTask) private readonly taskRepo: Repository<DailyTask>,
    private readonly streaksService: StreaksService,
  ) {}

  private calculatePoints(task: DailyTask, status: string): number {
    return status === 'completed' ? task.points : 0;
  }

  async create(user: User, dto: CreateDailyLogDto): Promise<DailyLog> {
    const task = await this.taskRepo.findOne({ where: { id: dto.task_id } });
    if (!task) throw new NotFoundException('Task not found');

    const existing = await this.logRepo.findOne({
      where: { user: { id: user.id }, task: { id: task.id }, log_date: dto.log_date },
    });

    if (existing) {
      Object.assign(existing, {
        status: dto.status ?? existing.status,
        duration_minutes: dto.duration_minutes ?? existing.duration_minutes,
        rating: dto.rating ?? existing.rating,
        notes: dto.notes ?? existing.notes,
        money_saved: dto.money_saved ?? existing.money_saved,
      });
      existing.points_earned = this.calculatePoints(task, existing.status);
      const savedExisting = await this.logRepo.save(existing);
      await this.streaksService.refreshUserStreaks(user.id);
      return this.findOne(savedExisting.id, user.id);
    }

    const log = this.logRepo.create({
      user,
      task,
      log_date: dto.log_date,
      status: dto.status ?? 'not_started',
      points_earned: this.calculatePoints(task, dto.status ?? 'not_started'),
      duration_minutes: dto.duration_minutes ?? null,
      rating: dto.rating ?? null,
      notes: dto.notes ?? null,
      money_saved: dto.money_saved ?? 0,
    });

    const saved = await this.logRepo.save(log);
    await this.streaksService.refreshUserStreaks(user.id);
    return this.findOne(saved.id, user.id);
  }

  async findAll(userId: string, date?: string): Promise<DailyLog[]> {
    const where = date ? { user: { id: userId }, log_date: date } : { user: { id: userId } };
    return this.logRepo.find({
      where,
      order: { log_date: 'DESC', created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<DailyLog> {
    const log = await this.logRepo.findOne({ where: { id, user: { id: userId } } });
    if (!log) throw new NotFoundException('Log not found');
    return log;
  }

  async update(id: string, userId: string, dto: UpdateDailyLogDto): Promise<DailyLog> {
    const log = await this.findOne(id, userId);
    Object.assign(log, dto);
    log.points_earned = this.calculatePoints(log.task, dto.status ?? log.status);
    const saved = await this.logRepo.save(log);
    await this.streaksService.refreshUserStreaks(userId);
    return saved;
  }

  async remove(id: string, userId: string): Promise<{ id: string }> {
    const log = await this.findOne(id, userId);
    await this.logRepo.remove(log);
    await this.streaksService.refreshUserStreaks(userId);
    return { id };
  }

  async getTodayScore(userId: string, date = new Date().toISOString().slice(0, 10)) {
    const logs = await this.findAll(userId, date);
    const completedTasks = logs.filter((log) => log.status === 'completed');
    const failedTasks = logs.filter((log) => log.status === 'failed' || log.status === 'cheated');
    const baseScore = completedTasks.reduce((sum, log) => sum + log.points_earned, 0);

    const sleepMissed = logs.some((log) => log.task.name.toLowerCase().includes('sleep') && log.status !== 'completed');
    const masturbationLogged = logs.some(
      (log) => log.task.name.toLowerCase().includes('masturbation') && log.status !== 'completed',
    );
    const junkFoodLogged = logs.some(
      (log) => log.task.name.toLowerCase().includes('junk food') && log.status !== 'completed',
    );

    let modifier = 1;
    if (sleepMissed) modifier -= 0.2;
    if (masturbationLogged) modifier -= 0.15;
    if (junkFoodLogged) modifier -= 0.1;

    const criticalTasks = logs.filter((log) => log.task.priority === 'critical');
    const allCriticalDone = criticalTasks.length > 0 && criticalTasks.every((log) => log.status === 'completed');

    return {
      date,
      dailyScore: Math.max(0, Math.round(baseScore * modifier + (allCriticalDone ? 10 : 0))),
      tasksCompleted: completedTasks.length,
      tasksFailed: failedTasks.length,
      streakUpdate: await this.streaksService.findAll(userId),
    };
  }
}
