import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyTask } from './entities/daily-task.entity';
import { CreateDailyTaskDto, UpdateDailyTaskDto } from './dto/daily-task.dto';

@Injectable()
export class DailyTasksService {
  constructor(@InjectRepository(DailyTask) private readonly repo: Repository<DailyTask>) {}

  findAll(day_type?: string): Promise<DailyTask[]> {
    const where = day_type ? { day_type, is_enabled: true } : { is_enabled: true };
    return this.repo.find({ where, order: { display_order: 'ASC' } });
  }

  async findOne(id: string): Promise<DailyTask> {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  create(dto: CreateDailyTaskDto): Promise<DailyTask> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateDailyTaskDto): Promise<DailyTask> {
    const task = await this.findOne(id);
    Object.assign(task, dto);
    return this.repo.save(task);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
