import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoneyEntry } from '../money-tracker/entities/money-entry.entity';
import { Reflection } from '../reflections/entities/reflection.entity';
import { Streak } from '../streaks/entities/streak.entity';
import { RoutineCompletion } from '../today/entities/routine-completion.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(RoutineCompletion) private readonly completionRepo: Repository<RoutineCompletion>,
    @InjectRepository(Reflection) private readonly reflectionRepo: Repository<Reflection>,
    @InjectRepository(MoneyEntry) private readonly moneyRepo: Repository<MoneyEntry>,
    @InjectRepository(Streak) private readonly streakRepo: Repository<Streak>,
  ) {}

  async weekly(userId: string) {
    const completions = await this.completionRepo.find({ where: { user: { id: userId } }, order: { completion_date: 'DESC' }, take: 50 });
    const reflections = await this.reflectionRepo.find({ where: { user: { id: userId } }, order: { reflection_date: 'DESC' }, take: 7 });
    const money = await this.moneyRepo.find({ where: { user: { id: userId } }, order: { log_date: 'DESC' }, take: 7 });
    const streaks = await this.streakRepo.find({ where: { user: { id: userId } } });

    const grouped = new Map<string, RoutineCompletion[]>();
    for (const completion of completions) {
      grouped.set(completion.completion_date, [...(grouped.get(completion.completion_date) ?? []), completion]);
    }

    const dailyScores = [...grouped.entries()].slice(0, 7).map(([date, dayLogs]) => ({
      date,
      score: dayLogs.reduce((sum, completion) => sum + Number(completion.points_earned ?? 0), 0),
    }));

    const totalScore = dailyScores.reduce((sum, day) => sum + day.score, 0);
    const completedTasks = completions.filter((completion) => completion.status === 'done' || completion.status === 'completed').length;
    const failedTasks = completions.filter((completion) => completion.status === 'failed' || completion.status === 'cheated').length;
    const moneySaved = money.reduce((sum, entry) => sum + Number(entry.amount), 0);

    const sortedScores = [...dailyScores].sort((a, b) => b.score - a.score);

    return {
      weekStart: dailyScores[dailyScores.length - 1]?.date ?? null,
      weekEnd: dailyScores[0]?.date ?? null,
      dailyScores,
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
