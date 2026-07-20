import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ActivityDto, MealDto, MealTemplateDto, UpsertLifestyleDayDto } from './dto/lifestyle.dto';
import { LifestyleActivity } from './entities/lifestyle-activity.entity';
import { LifestyleDay } from './entities/lifestyle-day.entity';
import { MealEntry } from './entities/meal-entry.entity';
import { MealTemplate } from './entities/meal-template.entity';

@Injectable()
export class LifestyleService {
  constructor(
    @InjectRepository(LifestyleDay) private readonly dayRepo: Repository<LifestyleDay>,
    @InjectRepository(MealEntry) private readonly mealRepo: Repository<MealEntry>,
    @InjectRepository(MealTemplate) private readonly templateRepo: Repository<MealTemplate>,
    @InjectRepository(LifestyleActivity) private readonly activityRepo: Repository<LifestyleActivity>,
  ) {}

  async getToday(user: User, date = this.todayString()) {
    const [day, meals, activities, analytics] = await Promise.all([
      this.ensureDay(user, date),
      this.mealRepo.find({ where: { user: { id: user.id }, meal_date: date }, order: { meal_time: 'ASC', created_at: 'ASC' } }),
      this.activityRepo.find({ where: { user: { id: user.id }, activity_date: date }, order: { start_time: 'ASC', created_at: 'ASC' } }),
      this.analytics(user.id, 'week', date),
    ]);

    return {
      date,
      day,
      meals,
      activities,
      score: this.completionScore(day, meals, activities),
      insights: analytics.insights.slice(0, 4),
    };
  }

  async upsertDay(user: User, dto: UpsertLifestyleDayDto) {
    const date = dto.date ?? this.todayString();
    const day = await this.ensureDay(user, date);
    Object.assign(day, {
      wake_time: dto.wake_time ?? day.wake_time,
      sleep_time: dto.sleep_time ?? day.sleep_time,
      sleep_hours: dto.sleep_hours ?? day.sleep_hours,
      sleep_quality: dto.sleep_quality ?? day.sleep_quality,
      water_litres: dto.water_litres ?? day.water_litres,
      mood: dto.mood ?? day.mood,
      morning_energy: dto.morning_energy ?? day.morning_energy,
      night_energy: dto.night_energy ?? day.night_energy,
      screen_shutdown_time: dto.screen_shutdown_time ?? day.screen_shutdown_time,
      notes: dto.notes ?? day.notes,
    });
    return this.dayRepo.save(day);
  }

  async createMeal(user: User, dto: MealDto) {
    const meal = this.mealRepo.create({
      user,
      meal_date: dto.date ?? this.todayString(),
      meal_type: dto.meal_type,
      meal_time: dto.meal_time ?? null,
      meal_name: dto.meal_name ?? null,
      food_items: this.cleanList(dto.food_items),
      homemade: dto.homemade ?? !dto.outside_food,
      outside_food: dto.outside_food ?? false,
      leftover_from_dinner: dto.leftover_from_dinner ?? false,
      restaurant: dto.restaurant ?? null,
      sabzi_name: dto.sabzi_name ?? null,
      roti_count: dto.roti_count ?? null,
      rice: dto.rice ?? false,
      dal: dto.dal ?? false,
      salad: dto.salad ?? false,
      curd: dto.curd ?? false,
      fruits: dto.fruits ?? false,
      tea: dto.tea ?? false,
      coffee: dto.coffee ?? false,
      cost: dto.cost ?? null,
      outside_reason: dto.outside_reason ?? null,
      quantity: dto.quantity ?? null,
      notes: dto.notes ?? null,
    });
    return this.mealRepo.save(meal);
  }

  async updateMeal(userId: string, id: string, dto: Partial<MealDto>) {
    const meal = await this.findMeal(userId, id);
    Object.assign(meal, { ...dto, food_items: dto.food_items ? this.cleanList(dto.food_items) : meal.food_items });
    return this.mealRepo.save(meal);
  }

  async removeMeal(userId: string, id: string) {
    const meal = await this.findMeal(userId, id);
    await this.mealRepo.remove(meal);
    return { deleted: true };
  }

  async createTemplate(user: User, dto: MealTemplateDto) {
    return this.templateRepo.save(
      this.templateRepo.create({
        user,
        name: dto.name,
        meal_type: dto.meal_type,
        food_items: this.cleanList(dto.food_items),
        homemade: dto.homemade ?? true,
        sabzi_name: dto.sabzi_name ?? null,
        roti_count: dto.roti_count ?? null,
        notes: dto.notes ?? null,
      }),
    );
  }

  templates(userId: string) {
    return this.templateRepo.find({ where: { user: { id: userId } }, order: { meal_type: 'ASC', name: 'ASC' } });
  }

  async useTemplate(user: User, id: string, date = this.todayString()) {
    const template = await this.templateRepo.findOne({ where: { id, user: { id: user.id } } });
    if (!template) throw new NotFoundException('Meal template not found');
    return this.createMeal(user, {
      date,
      meal_type: template.meal_type,
      meal_name: template.name,
      food_items: template.food_items,
      homemade: template.homemade,
      outside_food: !template.homemade,
      sabzi_name: template.sabzi_name ?? undefined,
      roti_count: template.roti_count ?? undefined,
      notes: template.notes ?? undefined,
    });
  }

  async createActivity(user: User, dto: ActivityDto) {
    return this.activityRepo.save(
      this.activityRepo.create({
        user,
        activity_date: dto.date ?? this.todayString(),
        activity_type: dto.activity_type,
        name: dto.name ?? null,
        start_time: dto.start_time ?? null,
        end_time: dto.end_time ?? null,
        duration_minutes: dto.duration_minutes ?? this.durationFromTimes(dto.start_time, dto.end_time),
        project_name: dto.project_name ?? null,
        calories: dto.calories ?? null,
        notes: dto.notes ?? null,
      }),
    );
  }

  async updateActivity(userId: string, id: string, dto: Partial<ActivityDto>) {
    const activity = await this.findActivity(userId, id);
    Object.assign(activity, dto);
    if (dto.start_time || dto.end_time) {
      activity.duration_minutes = dto.duration_minutes ?? this.durationFromTimes(activity.start_time ?? undefined, activity.end_time ?? undefined);
    }
    return this.activityRepo.save(activity);
  }

  async removeActivity(userId: string, id: string) {
    const activity = await this.findActivity(userId, id);
    await this.activityRepo.remove(activity);
    return { deleted: true };
  }

  async analytics(userId: string, range: 'week' | 'month' = 'week', endDate = this.todayString()) {
    const daysBack = range === 'month' ? 30 : 7;
    const dates = this.lastDays(endDate, daysBack);
    const [days, meals, activities] = await Promise.all([
      this.dayRepo.find({ where: { user: { id: userId }, log_date: Between(dates[0], endDate) }, order: { log_date: 'ASC' } }),
      this.mealRepo.find({ where: { user: { id: userId }, meal_date: Between(dates[0], endDate) }, order: { meal_date: 'ASC' } }),
      this.activityRepo.find({ where: { user: { id: userId }, activity_date: Between(dates[0], endDate) }, order: { activity_date: 'ASC' } }),
    ]);

    const exercise = activities.filter((entry) => entry.activity_type === 'exercise');
    const productivity = activities.filter((entry) => entry.activity_type === 'productivity');
    const homemadeMeals = meals.filter((meal) => meal.homemade).length;
    const outsideMeals = meals.filter((meal) => meal.outside_food).length;
    const fruitDays = new Set(meals.filter((meal) => meal.fruits || meal.food_items.some((item) => item.toLowerCase().includes('fruit'))).map((meal) => meal.meal_date)).size;
    const sabziCounts = this.countBy(meals.map((meal) => meal.sabzi_name).filter(Boolean) as string[]);
    const avgSleep = this.average(days.map((day) => Number(day.sleep_hours ?? 0)).filter(Boolean));
    const avgWater = this.average(days.map((day) => Number(day.water_litres ?? 0)).filter(Boolean));
    const productiveMinutes = productivity.reduce((sum, entry) => sum + entry.duration_minutes, 0);
    const exerciseTypes = this.countBy(exercise.map((entry) => entry.name ?? 'Exercise'));
    const dailyScores = dates.map((date) => ({
      date,
      score: this.completionScore(
        days.find((day) => day.log_date === date) ?? null,
        meals.filter((meal) => meal.meal_date === date),
        activities.filter((activity) => activity.activity_date === date),
      ).percentage,
    }));

    const bestDay = [...dailyScores].sort((a, b) => b.score - a.score)[0] ?? null;
    const worstDay = [...dailyScores].filter((day) => day.score > 0).sort((a, b) => a.score - b.score)[0] ?? null;
    const mostCommonSabzi = Object.entries(sabziCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const summary = {
      range,
      startDate: dates[0],
      endDate,
      averageSleep: avgSleep,
      gymDays: exercise.filter((entry) => (entry.name ?? '').toLowerCase().includes('gym')).length,
      walkDays: exercise.filter((entry) => (entry.name ?? '').toLowerCase().includes('walk')).length,
      codingHours: Math.round((productiveMinutes / 60) * 10) / 10,
      outsideMeals,
      homeCookedMeals: homemadeMeals,
      homeCookedPercent: meals.length ? Math.round((homemadeMeals / meals.length) * 100) : 0,
      fruitDays,
      averageWaterIntake: avgWater,
      mostCommonSabzi,
      sabziCounts,
      exerciseTypes,
      dailyScores,
      bestDay,
      worstDay,
      consistency: dailyScores.length ? Math.round(this.average(dailyScores.map((day) => day.score))) : 0,
    };

    return { ...summary, insights: this.insights(summary, days, meals, activities) };
  }

  async search(userId: string, query: string) {
    if (!query) return { meals: [], days: [], activities: [] };
    const like = `%${query}%`;
    const [meals, days, activities] = await Promise.all([
      this.mealRepo.find({
        where: [
          { user: { id: userId }, meal_name: ILike(like) },
          { user: { id: userId }, sabzi_name: ILike(like) },
          { user: { id: userId }, restaurant: ILike(like) },
          { user: { id: userId }, notes: ILike(like) },
        ],
        order: { meal_date: 'DESC' },
        take: 20,
      }),
      this.dayRepo.find({ where: { user: { id: userId }, notes: ILike(like) }, order: { log_date: 'DESC' }, take: 20 }),
      this.activityRepo.find({
        where: [
          { user: { id: userId }, name: ILike(like) },
          { user: { id: userId }, project_name: ILike(like) },
          { user: { id: userId }, notes: ILike(like) },
        ],
        order: { activity_date: 'DESC' },
        take: 20,
      }),
    ]);
    return { meals, days, activities };
  }

  private async ensureDay(user: User, date: string) {
    let day = await this.dayRepo.findOne({ where: { user: { id: user.id }, log_date: date } });
    if (!day) day = await this.dayRepo.save(this.dayRepo.create({ user, log_date: date }));
    return day;
  }

  private async findMeal(userId: string, id: string) {
    const meal = await this.mealRepo.findOne({ where: { id, user: { id: userId } } });
    if (!meal) throw new NotFoundException('Meal not found');
    return meal;
  }

  private async findActivity(userId: string, id: string) {
    const activity = await this.activityRepo.findOne({ where: { id, user: { id: userId } } });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  private completionScore(day: LifestyleDay | null, meals: MealEntry[], activities: LifestyleActivity[]) {
    const checks = [
      { label: 'Breakfast logged', done: meals.some((meal) => meal.meal_type === 'breakfast') },
      { label: 'Lunch logged', done: meals.some((meal) => meal.meal_type === 'lunch') },
      { label: 'Dinner logged', done: meals.some((meal) => meal.meal_type === 'dinner') },
      { label: 'Water goal', done: Number(day?.water_litres ?? 0) >= 2 },
      { label: 'Exercise', done: activities.some((entry) => entry.activity_type === 'exercise') },
      { label: 'Productivity', done: activities.some((entry) => entry.activity_type === 'productivity') },
      { label: 'Sleep logged', done: Boolean(day?.sleep_hours || day?.sleep_time || day?.wake_time) },
      { label: 'Mood logged', done: Boolean(day?.mood) },
    ];
    const done = checks.filter((check) => check.done).length;
    return { percentage: Math.round((done / checks.length) * 100), checks };
  }

  private insights(summary: any, days: LifestyleDay[], meals: MealEntry[], activities: LifestyleActivity[]) {
    const insights: string[] = [];
    const breakfastDays = new Set(meals.filter((meal) => meal.meal_type === 'breakfast').map((meal) => meal.meal_date)).size;
    const skippedBreakfast = Math.max(0, (summary.range === 'month' ? 30 : 7) - breakfastDays);
    if (skippedBreakfast > 0) insights.push(`You skipped breakfast ${skippedBreakfast} time${skippedBreakfast === 1 ? '' : 's'} this ${summary.range}.`);
    if (summary.homeCookedPercent > 0) insights.push(`You ate homemade food ${summary.homeCookedPercent}% of logged meals.`);
    if (summary.averageSleep) insights.push(`Your average sleep is ${summary.averageSleep.toFixed(1)} hours.`);
    if (summary.fruitDays > 0) insights.push(`You had fruits on ${summary.fruitDays} day${summary.fruitDays === 1 ? '' : 's'}.`);
    if (summary.mostCommonSabzi) insights.push(`${summary.mostCommonSabzi} is your most common sabzi.`);
    if (summary.codingHours > 0) insights.push(`You logged ${summary.codingHours} productive hours.`);
    const gymOrWalkDays = new Set(activities.filter((entry) => entry.activity_type === 'exercise').map((entry) => entry.activity_date)).size;
    if (gymOrWalkDays > 0) insights.push(`Exercise happened on ${gymOrWalkDays} day${gymOrWalkDays === 1 ? '' : 's'}; keep that rhythm gentle and repeatable.`);
    if (!days.length && !meals.length && !activities.length) insights.push('Start with meals, water, sleep, and one activity. Small logs are enough.');
    return insights.slice(0, 6);
  }

  private durationFromTimes(start?: string, end?: string) {
    if (!start || !end) return 0;
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
    if (minutes < 0) minutes += 24 * 60;
    return minutes;
  }

  private countBy(values: string[]) {
    return values.reduce<Record<string, number>>((acc, value) => {
      const key = value.trim();
      if (key) acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }

  private average(values: number[]) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  private cleanList(values?: string[]) {
    return (values ?? []).map((value) => value.trim()).filter(Boolean);
  }

  private todayString() {
    return new Date().toISOString().slice(0, 10);
  }

  private lastDays(endDate: string, count: number) {
    const end = new Date(`${endDate}T00:00:00`);
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(end);
      date.setDate(end.getDate() - (count - 1 - index));
      return date.toISOString().slice(0, 10);
    });
  }
}
