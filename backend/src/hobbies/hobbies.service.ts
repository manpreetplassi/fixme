import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateHobbyDto, CreateHobbyLogDto } from './dto/hobby.dto';
import { HobbyLog } from './entities/hobby-log.entity';
import { Hobby } from './entities/hobby.entity';

@Injectable()
export class HobbiesService {
  constructor(
    @InjectRepository(Hobby) private readonly hobbyRepo: Repository<Hobby>,
    @InjectRepository(HobbyLog) private readonly hobbyLogRepo: Repository<HobbyLog>,
  ) {}

  findAll(): Promise<Hobby[]> {
    return this.hobbyRepo.find({ where: { is_active: true }, order: { display_order: 'ASC', name: 'ASC' } });
  }

  create(dto: CreateHobbyDto): Promise<Hobby> {
    return this.hobbyRepo.save(this.hobbyRepo.create(dto));
  }

  async log(user: User, dto: CreateHobbyLogDto) {
    const hobby = await this.hobbyRepo.findOne({ where: { id: dto.hobby_id } });
    if (!hobby) throw new NotFoundException('Hobby not found');

    const duration = dto.duration_minutes ?? hobby.suggested_minutes_per_day;
    const points = hobby.default_points_per_instance + Math.floor(duration / 15);

    const log = this.hobbyLogRepo.create({
      user,
      hobby,
      log_date: new Date().toISOString().slice(0, 10),
      duration_minutes: duration,
      notes: dto.notes ?? null,
      points_earned: points,
    });

    return this.hobbyLogRepo.save(log);
  }

  findLogs(userId: string, startDate?: string, endDate?: string): Promise<HobbyLog[]> {
    return this.hobbyLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.hobby', 'hobby')
      .where('log.user_id = :userId', { userId })
      .andWhere(startDate ? 'log.log_date >= :startDate' : '1=1', { startDate })
      .andWhere(endDate ? 'log.log_date <= :endDate' : '1=1', { endDate })
      .orderBy('log.log_date', 'DESC')
      .getMany();
  }
}
