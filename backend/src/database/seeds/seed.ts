import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { DailyTask } from '../../daily-tasks/entities/daily-task.entity';
import { Hobby } from '../../hobbies/entities/hobby.entity';
import { Solution } from '../../solutions-bank/entities/solution.entity';
import { User } from '../../users/entities/user.entity';
import { AppDataSource } from '../data-source';

export async function runSeed(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  const taskRepo = dataSource.getRepository(DailyTask);
  const hobbyRepo = dataSource.getRepository(Hobby);
  const solutionRepo = dataSource.getRepository(Solution);

  let user = await userRepo.findOne({ where: { email: 'demo@fixme.app' } });
  if (!user) {
    user = await userRepo.save(
      userRepo.create({
        email: 'demo@fixme.app',
        name: 'FixMe Demo User',
        password_hash: await bcrypt.hash('Demo@123', 10),
        bio: 'Demo account for local development',
        preferred_hobbies: ['Dance Practice', 'Bike Ride'],
      }),
    );
  }

  const tasksCount = await taskRepo.count();
  if (tasksCount === 0) {
    await taskRepo.save(
      taskRepo.create([
        { name: 'Wake at 6 AM', day_type: 'weekday', priority: 'critical', points: 15, category: 'health', icon: 'sunrise', display_order: 1 },
        { name: 'Sleep by 11 PM', day_type: 'weekday', priority: 'critical', points: 15, category: 'health', icon: 'moon', display_order: 2 },
        { name: 'No Junk Food', day_type: 'weekday', priority: 'critical', points: 12, category: 'habits', icon: 'utensils', display_order: 3, max_cheats_per_week: 2 },
        { name: 'No Masturbation', day_type: 'weekday', priority: 'critical', points: 20, category: 'habits', icon: 'zap', display_order: 4 },
        { name: 'Exercise 1 Hour', day_type: 'weekday', priority: 'high', points: 10, category: 'health', icon: 'activity', display_order: 5 },
        { name: 'Learn Something', day_type: 'weekday', priority: 'high', points: 8, category: 'learning', icon: 'book-open', display_order: 6 },
        { name: 'Instagram 15 mins', day_type: 'weekday', priority: 'low', points: 3, category: 'habits', icon: 'smartphone', display_order: 7 },
        { name: 'No Movies', day_type: 'weekday', priority: 'low', points: 2, category: 'habits', icon: 'film', display_order: 8 },
        { name: 'Wake at 7 AM', day_type: 'weekend', priority: 'critical', points: 12, category: 'health', icon: 'sunrise', display_order: 9 },
        { name: 'Sleep by 11:30 PM', day_type: 'weekend', priority: 'critical', points: 12, category: 'health', icon: 'moon', display_order: 10 },
        { name: 'Hobby Practice', day_type: 'weekend', priority: 'medium', points: 6, category: 'habits', icon: 'palette', display_order: 11 },
        { name: 'Bike/Activity', day_type: 'weekend', priority: 'medium', points: 8, category: 'health', icon: 'bike', display_order: 12 },
        { name: 'Eat Homemade Food', day_type: 'travel', priority: 'critical', points: 10, category: 'health', icon: 'salad', display_order: 13 },
      ]),
    );
  }

  const hobbiesCount = await hobbyRepo.count();
  if (hobbiesCount === 0) {
    await hobbyRepo.save(
      hobbyRepo.create([
        { name: 'Dance Practice', category: 'sports', icon: 'music', suggested_minutes_per_day: 15, default_points_per_instance: 5, display_order: 1 },
        { name: 'Read Poetry', category: 'learning', icon: 'book-heart', suggested_minutes_per_day: 10, default_points_per_instance: 4, display_order: 2 },
        { name: 'Try New Recipe', category: 'creative', icon: 'chef-hat', suggested_minutes_per_day: 30, default_points_per_instance: 7, display_order: 3 },
        { name: 'Write Story/Journal', category: 'creative', icon: 'pen-line', suggested_minutes_per_day: 20, default_points_per_instance: 5, display_order: 4 },
        { name: 'Gurudwara Visit', category: 'spiritual', icon: 'sparkles', suggested_minutes_per_day: 60, default_points_per_instance: 6, display_order: 5 },
        { name: 'Bike Ride', category: 'sports', icon: 'bike', suggested_minutes_per_day: 60, default_points_per_instance: 8, is_weekend_only: true, display_order: 6 },
        { name: 'Mocktails/Cocktails', category: 'social', icon: 'glass-water', suggested_minutes_per_day: 20, default_points_per_instance: 4, display_order: 7 },
        { name: 'Swimming', category: 'sports', icon: 'waves', suggested_minutes_per_day: 45, default_points_per_instance: 8, is_weekend_only: true, display_order: 8 },
        { name: 'English Practice', category: 'learning', icon: 'languages', suggested_minutes_per_day: 15, default_points_per_instance: 5, display_order: 9 },
      ]),
    );
  }

  const solutionsCount = await solutionRepo.count();
  if (solutionsCount === 0) {
    await solutionRepo.save(
      solutionRepo.create([
        { blocker: 'hunger', trigger: 'Feeling hungry', solution: 'Drink water and eat oats or soaked chia seeds.', action_items: ['Drink water', 'Eat prepared snack'], priority: 10 },
        { blocker: 'energy', trigger: 'Feeling tired', solution: 'Do cervical relief stretches and take a short walk.', action_items: ['Stretch for 5 minutes', 'Walk for 10 minutes'], priority: 9 },
        { blocker: 'temptation', trigger: 'Tempted by porn', solution: 'Call your roommate or step outside immediately.', action_items: ['Leave the room', 'Call someone'], priority: 10 },
        { blocker: 'laziness', trigger: 'Movie watching spiral', solution: 'Stop the movie and do 5 minutes of exercise.', action_items: ['Pause the screen', 'Do pushups or walk'], priority: 8 },
        { blocker: 'stress', trigger: 'Evening energy crash', solution: 'Take a light walk and reset before opening apps.', action_items: ['Walk 5 minutes', 'Avoid bed'], priority: 7 },
      ]),
    );
  }

  console.log(`Seed complete for ${user.email}`);
}

async function bootstrapSeed() {
  await AppDataSource.initialize();
  await runSeed(AppDataSource);
  await AppDataSource.destroy();
}

if (require.main === module) {
  void bootstrapSeed();
}
