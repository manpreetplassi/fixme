import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutineCompletion } from '../today/entities/routine-completion.entity';
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
    @InjectRepository(RoutineCompletion) private readonly completionRepo: Repository<RoutineCompletion>,
  ) {}

  findAll(userId: string): Promise<Streak[]> {
    return this.repo.find({ where: { user: { id: userId } }, order: { current_count: 'DESC' } });
  }

  async refreshUserStreaks(userId: string): Promise<void> {
    const completions = await this.completionRepo.find({
      where: { user: { id: userId } },
      relations: { routine_item: true },
      order: { completion_date: 'DESC' },
      take: 180,
    });

    for (const track of TRACKED_HABITS) {
      const habitLogs = completions
        .filter((completion) => completion.routine_item?.title.toLowerCase() === track.habitName.toLowerCase())
        .sort((a, b) => a.completion_date.localeCompare(b.completion_date));

      let currentCount = 0;
      let bestCount = 0;
      let tempCount = 0;
      let startDate = habitLogs[0]?.completion_date ?? new Date().toISOString().slice(0, 10);
      let lastCompletedDate: string | null = null;

      for (const log of habitLogs) {
        if (!this.isDoneStatus(log.status)) {
          tempCount = 0;
          continue;
        }

        if (!lastCompletedDate) {
          tempCount = 1;
          startDate = log.completion_date;
        } else if (this.daysBetween(lastCompletedDate, log.completion_date) === 1) {
          tempCount += 1;
        } else {
          tempCount = 1;
          startDate = log.completion_date;
        }

        lastCompletedDate = log.completion_date;
        bestCount = Math.max(bestCount, tempCount);
      }

      const descendingLogs = [...habitLogs].sort((a, b) => b.completion_date.localeCompare(a.completion_date));
      for (let index = 0; index < descendingLogs.length; index += 1) {
        const log = descendingLogs[index];
        if (!this.isDoneStatus(log.status)) break;
        if (index === 0) {
          currentCount = 1;
          continue;
        }
        const previous = descendingLogs[index - 1];
        if (this.daysBetween(log.completion_date, previous.completion_date) === 1) {
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

  private isDoneStatus(status: string): boolean {
    return status === 'done' || status === 'completed';
  }
}
