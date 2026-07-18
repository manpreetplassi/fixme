import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyLogsService } from '../daily-logs/daily-logs.service';
import { User } from '../users/entities/user.entity';
import { CreateReflectionDto } from './dto/reflection.dto';
import { Reflection } from './entities/reflection.entity';

@Injectable()
export class ReflectionsService {
  constructor(
    @InjectRepository(Reflection) private readonly repo: Repository<Reflection>,
    private readonly dailyLogsService: DailyLogsService,
  ) {}

  async create(user: User, dto: CreateReflectionDto) {
    const today = new Date().toISOString().slice(0, 10);
    const score = await this.dailyLogsService.getTodayScore(user.id, today);

    const reflection = this.repo.create({
      user,
      reflection_date: today,
      daily_score: score.dailyScore,
      ...dto,
    });

    return this.repo.save(reflection);
  }

  async findByDate(userId: string, date: string) {
    const reflection = await this.repo.findOne({ where: { user: { id: userId }, reflection_date: date } });
    if (!reflection) throw new NotFoundException('Reflection not found');
    return reflection;
  }

  findWeek(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { reflection_date: 'DESC' },
      take: 7,
    });
  }

  async blockerStats(userId: string) {
    const reflections = await this.findWeek(userId);
    const counts = reflections.reduce<Record<string, number>>((acc, reflection) => {
      const key = reflection.primary_blocker ?? 'other';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([blocker, frequency]) => ({
      blocker,
      frequency,
      daysAffected: frequency,
      trend: 'steady',
    }));
  }
}
