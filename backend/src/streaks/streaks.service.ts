import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyLog } from '../daily-logs/entities/daily-log.entity';
import { Streak } from './entities/streak.entity';

const TRACKED_HABITS = [
  { habitName: 'Wake at 6 AM', icon: 'sunrise' },
  { habitName: 'Sleep by 11 PM', icon: 'moon' },
  { habitName: 'No Junk Food', icon: 'salad' },
  { habitName: 'No Masturbation', icon: 'zap' },
  { habitName: 'Exercise 1 Hour', icon: 'activity' },
];

@Injectable()
export class StreaksService {
  constructor(
    @InjectRepository(Streak) private readonly repo: Repository<Streak>,
    @InjectRepository(DailyLog) private readonly logRepo: Repository<DailyLog>,
  ) {}

  findAll(userId: string): Promise<Streak[]> {
    return this.repo.find({ where: { user: { id: userId } }, order: { current_count: 'DESC' } });
  }

  async refreshUserStreaks(userId: string): Promise<void> {
    const logs = await this.logRepo.find({
      where: { user: { id: userId } },
      order: { log_date: 'DESC' },
      take: 180,
    });

    for (const track of TRACKED_HABITS) {
      const habitLogs = logs
        .filter((log) => log.task.name.toLowerCase() === track.habitName.toLowerCase())
        .sort((a, b) => a.log_date.localeCompare(b.log_date));

      let currentCount = 0;
      let bestCount = 0;
      let tempCount = 0;
      let startDate = habitLogs[0]?.log_date ?? new Date().toISOString().slice(0, 10);
      let lastCompletedDate: string | null = null;

      for (const log of habitLogs) {
        if (log.status !== 'completed') {
          tempCount = 0;
          continue;
        }

        if (!lastCompletedDate) {
          tempCount = 1;
          startDate = log.log_date;
        } else if (this.daysBetween(lastCompletedDate, log.log_date) === 1) {
          tempCount += 1;
        } else {
          tempCount = 1;
          startDate = log.log_date;
        }

        lastCompletedDate = log.log_date;
        bestCount = Math.max(bestCount, tempCount);
      }

      const descendingLogs = [...habitLogs].sort((a, b) => b.log_date.localeCompare(a.log_date));
      for (let index = 0; index < descendingLogs.length; index += 1) {
        const log = descendingLogs[index];
        if (log.status !== 'completed') break;
        if (index === 0) {
          currentCount = 1;
          continue;
        }
        const previous = descendingLogs[index - 1];
        if (this.daysBetween(log.log_date, previous.log_date) === 1) {
          currentCount += 1;
        } else {
          break;
        }
      }

      let streak = await this.repo.findOne({ where: { user: { id: userId }, habit_name: track.habitName } });
      if (!streak) {
        streak = this.repo.create({
          user: { id: userId } as never,
          habit_name: track.habitName,
          start_date: startDate,
          icon: track.icon,
        });
      }

      streak.start_date = startDate;
      streak.end_date = currentCount > 0 ? null : new Date().toISOString().slice(0, 10);
      streak.current_count = currentCount;
      streak.best_count = Math.max(bestCount, streak.best_count ?? 0);
      streak.is_active = currentCount > 0;
      await this.repo.save(streak);
    }
  }

  private daysBetween(dateA: string, dateB: string): number {
    const a = new Date(dateA).getTime();
    const b = new Date(dateB).getTime();
    return Math.abs(Math.round((a - b) / 86_400_000));
  }
}
