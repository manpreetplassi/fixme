import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HobbyLog } from '../hobbies/entities/hobby-log.entity';
import { LearningLog } from '../learning-logs/entities/learning-log.entity';
import { LifestyleActivity } from '../lifestyle/entities/lifestyle-activity.entity';
import { MealEntry } from '../lifestyle/entities/meal-entry.entity';
import { MoneyEntry } from '../money-tracker/entities/money-entry.entity';
import { Reflection } from '../reflections/entities/reflection.entity';
import { Streak } from '../streaks/entities/streak.entity';
import { RoutineCompletion } from '../today/entities/routine-completion.entity';
import { RoutineItem } from '../today/entities/routine-item.entity';
import { DeleteUserDataDto, DeletableCategory, UpdateUserGoalsDto, UpdateUserProfileDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(RoutineCompletion) private readonly completionsRepo: Repository<RoutineCompletion>,
    @InjectRepository(RoutineItem) private readonly routineItemsRepo: Repository<RoutineItem>,
    @InjectRepository(MoneyEntry) private readonly moneyRepo: Repository<MoneyEntry>,
    @InjectRepository(LearningLog) private readonly learningRepo: Repository<LearningLog>,
    @InjectRepository(Reflection) private readonly reflectionsRepo: Repository<Reflection>,
    @InjectRepository(LifestyleActivity) private readonly lifestyleRepo: Repository<LifestyleActivity>,
    @InjectRepository(MealEntry) private readonly mealsRepo: Repository<MealEntry>,
    @InjectRepository(HobbyLog) private readonly hobbyLogsRepo: Repository<HobbyLog>,
    @InjectRepository(Streak) private readonly streaksRepo: Repository<Streak>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: Partial<User>): Promise<User> {
    const existing = await this.findByEmail(data.email as string);
    if (existing) throw new ConflictException('Email already exists');
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  sanitizeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing && existing.id !== id) throw new ConflictException('Email already exists');
    }

    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    return this.sanitizeUser(saved);
  }

  async updateGoals(id: string, dto: UpdateUserGoalsDto) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    return this.sanitizeUser(saved);
  }

  private repoFor(category: DeletableCategory) {
    const map: Record<DeletableCategory, Repository<any>> = {
      routine_completions: this.completionsRepo,
      routine_items: this.routineItemsRepo,
      money_tracker: this.moneyRepo,
      learning_logs: this.learningRepo,
      reflections: this.reflectionsRepo,
      lifestyle_activities: this.lifestyleRepo,
      meal_entries: this.mealsRepo,
      hobby_logs: this.hobbyLogsRepo,
      streaks: this.streaksRepo,
    };
    return map[category];
  }

  async getDataCounts(userId: string): Promise<Record<DeletableCategory, number>> {
    const categories: DeletableCategory[] = [
      'routine_completions',
      'routine_items',
      'money_tracker',
      'learning_logs',
      'reflections',
      'lifestyle_activities',
      'meal_entries',
      'hobby_logs',
      'streaks',
    ];
    const entries = await Promise.all(
      categories.map(async (cat) => [cat, await this.repoFor(cat).count({ where: { user: { id: userId } } })] as const),
    );
    return Object.fromEntries(entries) as Record<DeletableCategory, number>;
  }

  async deleteData(userId: string, dto: DeleteUserDataDto): Promise<{ deleted: Record<string, number> }> {
    const deleted: Record<string, number> = {};
    for (const cat of dto.categories) {
      const result = await this.repoFor(cat).delete({ user: { id: userId } });
      deleted[cat] = result.affected ?? 0;
    }
    return { deleted };
  }
}
