import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateMoneyEntryDto } from './dto/money-entry.dto';
import { MoneyEntry } from './entities/money-entry.entity';

@Injectable()
export class MoneyTrackerService {
  constructor(@InjectRepository(MoneyEntry) private readonly repo: Repository<MoneyEntry>) {}

  create(user: User, dto: CreateMoneyEntryDto) {
    return this.repo.save(this.repo.create({ user, ...dto }));
  }

  async summary(userId: string) {
    const entries = await this.repo.find({ where: { user: { id: userId } } });
    const totalSaved = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
    return {
      thisWeek: totalSaved,
      thisMonth: totalSaved,
      thisYear: totalSaved,
      progressToReward: totalSaved,
      rewardThreshold: 1000,
    };
  }

  async stats(userId: string) {
    const entries = await this.repo.find({ where: { user: { id: userId } }, order: { log_date: 'DESC' } });
    const totalSaved = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
    const avgDailySavings = entries.length ? totalSaved / entries.length : 0;
    return {
      avgDailySavings,
      avgWeeklySavings: avgDailySavings * 7,
      bestDay: entries[0] ?? null,
      totalSaved,
      rewardsUnlocked: Math.floor(totalSaved / 1000),
      daysWithoutZomato: entries.length,
    };
  }
}
