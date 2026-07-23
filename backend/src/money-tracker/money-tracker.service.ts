import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateMoneyEntryDto, UpdateMoneyEntryDto } from './dto/money-entry.dto';
import { MoneyEntry } from './entities/money-entry.entity';

@Injectable()
export class MoneyTrackerService {
  constructor(@InjectRepository(MoneyEntry) private readonly repo: Repository<MoneyEntry>) {}

  async create(user: User, dto: CreateMoneyEntryDto) {
    if (dto.parent_entry_id) await this.findOne(dto.parent_entry_id, user.id);
    return this.repo.save(this.repo.create(this.withDefaults(user, dto)));
  }

  findAll(userId: string) {
    return this.repo.find({ where: { user: { id: userId } }, order: { log_date: 'DESC', created_at: 'DESC' } });
  }

  async findOne(id: string, userId: string) {
    const entry = await this.repo.findOne({ where: { id, user: { id: userId } } });
    if (!entry) throw new NotFoundException('Money entry not found');
    return entry;
  }

  async update(id: string, userId: string, dto: UpdateMoneyEntryDto) {
    const entry = await this.findOne(id, userId);
    if (dto.parent_entry_id) await this.findOne(dto.parent_entry_id, userId);
    Object.assign(entry, this.cleanNullableFields(dto));
    return this.repo.save(entry);
  }

  async remove(id: string, userId: string) {
    const entry = await this.findOne(id, userId);
    await this.repo.remove(entry);
    return { deleted: true };
  }

  async summary(userId: string) {
    const entries = await this.repo.find({ where: { user: { id: userId } } });
    const totalSaved = this.sumByType(entries, ['saved', 'income']);
    const totalSpent = this.sumByType(entries, ['spent', 'expense']);
    const net = totalSaved - totalSpent;
    return {
      thisWeek: net,
      thisMonth: net,
      thisYear: net,
      totalSaved,
      totalSpent,
      progressToReward: totalSaved,
      rewardThreshold: 1000,
    };
  }

  async stats(userId: string) {
    const entries = await this.repo.find({ where: { user: { id: userId } }, order: { log_date: 'DESC' } });
    const pricedEntries = entries.filter((entry) => entry.amount !== null && entry.amount !== undefined);
    const totalSaved = this.sumByType(entries, ['saved', 'income']);
    const totalSpent = this.sumByType(entries, ['spent', 'expense']);
    const avgDailySavings = pricedEntries.length ? totalSaved / pricedEntries.length : 0;
    return {
      avgDailySavings,
      avgWeeklySavings: avgDailySavings * 7,
      bestDay: entries[0] ?? null,
      totalSaved,
      totalSpent,
      pendingPriceCount: entries.filter((entry) => entry.needs_price).length,
      rewardsUnlocked: Math.floor(totalSaved / 1000),
      daysWithoutZomato: pricedEntries.length,
    };
  }

  private withDefaults(user: User, dto: CreateMoneyEntryDto) {
    return {
      ...this.cleanNullableFields(dto),
      user,
      amount: dto.amount ?? null,
      type: dto.type ?? 'saved',
      category: dto.category ?? 'Other',
      is_recurring: dto.is_recurring ?? false,
      needs_price: dto.needs_price ?? dto.amount == null,
    };
  }

  private cleanNullableFields<T extends CreateMoneyEntryDto | UpdateMoneyEntryDto>(dto: T) {
    return Object.fromEntries(Object.entries(dto).filter(([, value]) => value !== undefined)) as T;
  }

  private sumByType(entries: MoneyEntry[], types: string[]) {
    return entries
      .filter((entry) => types.includes(entry.type))
      .reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
  }
}
