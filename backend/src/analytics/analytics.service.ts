import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyLog } from '../daily-logs/entities/daily-log.entity';
import { MoneyEntry } from '../money-tracker/entities/money-entry.entity';
import { Reflection } from '../reflections/entities/reflection.entity';
import { Streak } from '../streaks/entities/streak.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(DailyLog) private readonly logRepo: Repository<DailyLog>,
    @InjectRepository(Reflection) private readonly reflectionRepo: Repository<Reflection>,
    @InjectRepository(MoneyEntry) private readonly moneyRepo: Repository<MoneyEntry>,
    @InjectRepository(Streak) private readonly streakRepo: Repository<Streak>,
  ) {}

  async weekly(userId: string) {
    const logs = await this.logRepo.find({ where: { user: { id: userId } }, order: { log_date: 'DESC' }, take: 50 });
    const reflections = await this.reflectionRepo.find({ where: { user: { id: userId } }, order: { reflection_date: 'DESC' }, take: 7 });
    const money = await this.moneyRepo.find({ where: { user: { id: userId } }, order: { log_date: 'DESC' }, take: 7 });
    const streaks = await this.streakRepo.find({ where: { user: { id: userId } } });

    const grouped = new Map<string, DailyLog[]>();
    for (const log of logs) {
      grouped.set(log.log_date, [...(grouped.get(log.log_date) ?? []), log]);
    }

    const dailyScores = [...grouped.entries()].slice(0, 7).map(([date, dayLogs]) => ({
      date,
      score: dayLogs.reduce((sum, log) => sum + log.points_earned, 0),
    }));

    const totalScore = dailyScores.reduce((sum, day) => sum + day.score, 0);
    const completedTasks = logs.filter((log) => log.status === 'completed').length;
    const failedTasks = logs.filter((log) => log.status === 'failed' || log.status === 'cheated').length;
    const moneySaved = money.reduce((sum, entry) => sum + Number(entry.amount), 0);

    const sortedScores = [...dailyScores].sort((a, b) => b.score - a.score);

    return {
      weekStart: dailyScores[dailyScores.length - 1]?.date ?? null,
      weekEnd: dailyScores[0]?.date ?? null,
      totalScore,
      avgScore: dailyScores.length ? totalScore / dailyScores.length : 0,
      completedTasks,
      failedTasks,
      streaksActive: streaks.filter((streak) => streak.is_active).length,
      moneySaved,
      masturbationDays: reflections.filter((reflection) => reflection.masturbation_happened).length,
      bestDay: sortedScores[0] ?? null,
      worstDay: sortedScores[sortedScores.length - 1] ?? null,
      taskCompletionRate: completedTasks + failedTasks ? completedTasks / (completedTasks + failedTasks) : 0,
    };
  }

  async monthly(userId: string) {
    return this.weekly(userId);
  }

  async blockers(userId: string) {
    const reflections = await this.reflectionRepo.find({ where: { user: { id: userId } }, take: 30 });
    const counts = reflections.reduce<Record<string, number>>((acc, reflection) => {
      const key = reflection.primary_blocker ?? 'other';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return {
      thisWeek: counts,
      thisMonth: counts,
      trend: Object.entries(counts).map(([blocker, count]) => ({ blocker, count })),
    };
  }

  async habits(userId: string) {
    const streaks = await this.streakRepo.find({ where: { user: { id: userId } }, order: { best_count: 'DESC' } });
    return {
      bestHabits: streaks.slice(0, 3),
      worstHabits: [...streaks].sort((a, b) => a.current_count - b.current_count).slice(0, 3),
    };
  }
}
