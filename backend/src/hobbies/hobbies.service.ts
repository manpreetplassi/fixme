import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateHobbyDto, CreateHobbyLogDto, UpdateHobbyDto, UpdateHobbyLogDto } from './dto/hobby.dto';
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

  async findOne(id: string): Promise<Hobby> {
    const hobby = await this.hobbyRepo.findOne({ where: { id } });
    if (!hobby) throw new NotFoundException('Hobby not found');
    return hobby;
  }

  async update(id: string, dto: UpdateHobbyDto): Promise<Hobby> {
    const hobby = await this.findOne(id);
    Object.assign(hobby, dto);
    return this.hobbyRepo.save(hobby);
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const hobby = await this.findOne(id);
    hobby.is_active = false;
    await this.hobbyRepo.save(hobby);
    return { deleted: true };
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

  async findLog(id: string, userId: string): Promise<HobbyLog> {
    const log = await this.hobbyLogRepo.findOne({ where: { id, user: { id: userId } } });
    if (!log) throw new NotFoundException('Hobby log not found');
    return log;
  }

  async updateLog(id: string, userId: string, dto: UpdateHobbyLogDto): Promise<HobbyLog> {
    const log = await this.findLog(id, userId);
    Object.assign(log, dto);
    if (dto.duration_minutes !== undefined) {
      log.points_earned = log.hobby.default_points_per_instance + Math.floor(dto.duration_minutes / 15);
    }
    return this.hobbyLogRepo.save(log);
  }

  async removeLog(id: string, userId: string): Promise<{ deleted: true }> {
    const log = await this.findLog(id, userId);
    await this.hobbyLogRepo.remove(log);
    return { deleted: true };
  }
}
