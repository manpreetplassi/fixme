import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutineItem } from '../today/entities/routine-item.entity';
import { User } from '../users/entities/user.entity';
import { CreateCareAreaDto, CreateCareTaskDto, UpdateCareAreaDto, UpdateCareTaskDto } from './dto/self-care.dto';
import { CareArea } from './entities/care-area.entity';
import { CareTask } from './entities/care-task.entity';

const FREQUENCY_TO_REPEAT: Record<string, string> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'weekly', // closest match
  custom: 'once',
};

@Injectable()
export class SelfCareService {
  constructor(
    @InjectRepository(CareArea) private readonly areaRepo: Repository<CareArea>,
    @InjectRepository(CareTask) private readonly taskRepo: Repository<CareTask>,
    @InjectRepository(RoutineItem) private readonly routineRepo: Repository<RoutineItem>,
  ) {}

  // ── Areas ──────────────────────────────────────────────────────────────────

  async getAreas(userId: string) {
    const areas = await this.areaRepo.find({
      where: { user: { id: userId }, is_active: true },
      order: { display_order: 'ASC', created_at: 'ASC' },
    });
    // attach task counts and active routine count
    return Promise.all(
      areas.map(async (area) => {
        const tasks = await this.taskRepo.find({ where: { care_area: { id: area.id }, user: { id: userId } } });
        const activeCount = tasks.filter((t) => t.routine_item_id !== null).length;
        return { ...area, task_count: tasks.length, active_in_routine: activeCount };
      }),
    );
  }

  async createArea(user: User, dto: CreateCareAreaDto) {
    const area = this.areaRepo.create({ ...dto, user, display_order: dto.display_order ?? 0 });
    return this.areaRepo.save(area);
  }

  async updateArea(userId: string, id: string, dto: UpdateCareAreaDto) {
    const area = await this.findArea(userId, id);
    Object.assign(area, dto);
    return this.areaRepo.save(area);
  }

  async deleteArea(userId: string, id: string) {
    const area = await this.findArea(userId, id);
    area.is_active = false;
    await this.areaRepo.save(area);
    return { deleted: true };
  }

  // ── Tasks ──────────────────────────────────────────────────────────────────

  async getTasks(userId: string, areaId: string) {
    await this.findArea(userId, areaId);
    const tasks = await this.taskRepo.find({
      where: { care_area: { id: areaId }, user: { id: userId } },
      order: { display_order: 'ASC', created_at: 'ASC' },
    });
    // attach routine item info for each task
    return Promise.all(
      tasks.map(async (task) => {
        let routine_item = null;
        if (task.routine_item_id) {
          routine_item = await this.routineRepo.findOne({ where: { id: task.routine_item_id, is_active: true } });
          if (!routine_item) {
            // routine item was deleted externally — clear the link
            task.routine_item_id = null;
            await this.taskRepo.save(task);
          }
        }
        return { ...task, in_routine: Boolean(routine_item) };
      }),
    );
  }

  async createTask(user: User, areaId: string, dto: CreateCareTaskDto) {
    const area = await this.findArea(user.id, areaId);
    const task = this.taskRepo.create({
      ...dto,
      user,
      care_area: area,
      frequency: dto.frequency ?? 'daily',
      priority: dto.priority ?? 'important',
      display_order: dto.display_order ?? 0,
    });
    return this.taskRepo.save(task);
  }

  async updateTask(userId: string, areaId: string, taskId: string, dto: UpdateCareTaskDto) {
    const task = await this.findTask(userId, areaId, taskId);
    Object.assign(task, dto);
    return this.taskRepo.save(task);
  }

  async deleteTask(userId: string, areaId: string, taskId: string) {
    const task = await this.findTask(userId, areaId, taskId);
    // deactivate linked routine item too
    if (task.routine_item_id) {
      await this.routineRepo.update(task.routine_item_id, { is_active: false });
    }
    await this.taskRepo.remove(task);
    return { deleted: true };
  }

  // ── Activate / Deactivate in Today routine ─────────────────────────────────

  async activateTask(user: User, areaId: string, taskId: string) {
    const area = await this.findArea(user.id, areaId);
    const task = await this.findTask(user.id, areaId, taskId);

    // if already linked to an active routine item, return as-is
    if (task.routine_item_id) {
      const existing = await this.routineRepo.findOne({ where: { id: task.routine_item_id, is_active: true } });
      if (existing) return { ...task, in_routine: true };
    }

    const routineItem = this.routineRepo.create({
      user,
      title: task.title,
      category: 'self_care',
      priority: task.priority,
      repeat_rule: FREQUENCY_TO_REPEAT[task.frequency] ?? 'daily',
      source: 'care_task',
      plan_id: area.id, // store area id so Today can link back
      icon: area.icon ?? null,
      reminder_enabled: false,
      points: 0,
    });
    const saved = await this.routineRepo.save(routineItem);
    task.routine_item_id = saved.id;
    await this.taskRepo.save(task);
    return { ...task, in_routine: true };
  }

  async deactivateTask(userId: string, areaId: string, taskId: string) {
    const task = await this.findTask(userId, areaId, taskId);
    if (task.routine_item_id) {
      await this.routineRepo.update(task.routine_item_id, { is_active: false });
      task.routine_item_id = null;
      await this.taskRepo.save(task);
    }
    return { ...task, in_routine: false };
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async findArea(userId: string, id: string) {
    const area = await this.areaRepo.findOne({ where: { id, user: { id: userId } } });
    if (!area) throw new NotFoundException('Care area not found');
    return area;
  }

  private async findTask(userId: string, areaId: string, taskId: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, user: { id: userId }, care_area: { id: areaId } },
    });
    if (!task) throw new NotFoundException('Care task not found');
    return task;
  }
}
