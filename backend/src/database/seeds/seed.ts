import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { CareArea } from '../../self-care/entities/care-area.entity';
import { CareTask } from '../../self-care/entities/care-task.entity';
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
  const careAreaRepo = dataSource.getRepository(CareArea);
  const careTaskRepo = dataSource.getRepository(CareTask);

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
        { name: 'Mocktails/Cocktails', category: 'social', icon: 'glass', suggested_minutes_per_day: 20, default_points_per_instance: 4, display_order: 7 },
        { name: 'Swimming', category: 'sports', icon: 'waves', suggested_minutes_per_day: 45, default_points_per_instance: 8, is_weekend_only: true, display_order: 8 },
        { name: 'English Practice', category: 'learning', icon: 'languages', suggested_minutes_per_day: 15, default_points_per_instance: 5, display_order: 9 },
      ]),
    );
  }

  const solutionsCount = await solutionRepo.count();
  if (solutionsCount === 0) {
    await solutionRepo.save(
      solutionRepo.create([
        { blocker: 'hunger', trigger: 'Feeling hungry', solution: 'Eat oats, fruit, or soaked chia seeds.', action_items: ['Eat prepared snack'], priority: 10 },
        { blocker: 'energy', trigger: 'Feeling tired', solution: 'Do cervical relief stretches and take a short walk.', action_items: ['Stretch for 5 minutes', 'Walk for 10 minutes'], priority: 9 },
        { blocker: 'temptation', trigger: 'Tempted by porn', solution: 'Call your roommate or step outside immediately.', action_items: ['Leave the room', 'Call someone'], priority: 10 },
        { blocker: 'laziness', trigger: 'Movie watching spiral', solution: 'Stop the movie and do 5 minutes of exercise.', action_items: ['Pause the screen', 'Do pushups or walk'], priority: 8 },
        { blocker: 'stress', trigger: 'Evening energy crash', solution: 'Take a light walk and reset before opening apps.', action_items: ['Walk 5 minutes', 'Avoid bed'], priority: 7 },
      ]),
    );
  }

  console.log(`Seed complete for ${user.email}`);

  const careAreasCount = await careAreaRepo.count({ where: { user: { id: user.id } } });
  if (careAreasCount === 0) {
    const presets = [
      { name: 'Hair Care', icon: '💇', color: '#8b5cf6', description: 'Washing, oiling, trimming, and scalp health', display_order: 0 },
      { name: 'Dental Care', icon: '🦷', color: '#06b6d4', description: 'Brushing, flossing, tongue cleaning, mouthwash', display_order: 1 },
      { name: 'Skin Care', icon: '✨', color: '#f59e0b', description: 'Moisturising, sunscreen, face wash, exfoliation', display_order: 2 },
      { name: 'Fitness', icon: '💪', color: '#10b981', description: 'Workouts, stretching, steps, and active recovery', display_order: 3 },
      { name: 'Heart Health', icon: '❤️', color: '#ef4444', description: 'Cardio, blood pressure, stress, and diet', display_order: 4 },
      { name: 'Mental Health', icon: '🧠', color: '#6366f1', description: 'Meditation, journaling, therapy, and rest', display_order: 5 },
      { name: 'Sleep', icon: '😴', color: '#0ea5e9', description: 'Sleep schedule, wind-down routine, and quality', display_order: 6 },
      { name: 'Nutrition', icon: '🥗', color: '#84cc16', description: 'Balanced meals, hydration, and supplements', display_order: 7 },
    ];

    const defaultTasks: Record<string, { title: string; frequency: string; priority: string }[]> = {
      'Hair Care': [
        { title: 'Oil hair', frequency: 'weekly', priority: 'important' },
        { title: 'Wash hair', frequency: 'weekly', priority: 'important' },
        { title: 'Comb and detangle', frequency: 'daily', priority: 'low' },
      ],
      'Dental Care': [
        { title: 'Brush teeth (morning)', frequency: 'daily', priority: 'urgent' },
        { title: 'Brush teeth (night)', frequency: 'daily', priority: 'urgent' },
        { title: 'Floss', frequency: 'daily', priority: 'important' },
        { title: 'Tongue scraper', frequency: 'daily', priority: 'important' },
      ],
      'Skin Care': [
        { title: 'Face wash', frequency: 'daily', priority: 'important' },
        { title: 'Moisturiser', frequency: 'daily', priority: 'important' },
        { title: 'Sunscreen (morning)', frequency: 'daily', priority: 'urgent' },
      ],
      'Fitness': [
        { title: 'Exercise 30+ mins', frequency: 'daily', priority: 'urgent' },
        { title: 'Stretch / mobility', frequency: 'daily', priority: 'important' },
        { title: '8000 steps', frequency: 'daily', priority: 'important' },
      ],
      'Heart Health': [
        { title: '20 min cardio', frequency: 'daily', priority: 'important' },
        { title: 'No junk food', frequency: 'daily', priority: 'urgent' },
        { title: 'Stress check-in', frequency: 'daily', priority: 'low' },
      ],
      'Mental Health': [
        { title: 'Meditate 10 mins', frequency: 'daily', priority: 'important' },
        { title: 'Journal entry', frequency: 'daily', priority: 'low' },
        { title: 'No doom scrolling', frequency: 'daily', priority: 'important' },
      ],
      'Sleep': [
        { title: 'Screen off by 10:30 PM', frequency: 'daily', priority: 'urgent' },
        { title: 'In bed by 11 PM', frequency: 'daily', priority: 'urgent' },
        { title: 'Wake without snooze', frequency: 'daily', priority: 'important' },
      ],
      'Nutrition': [
        { title: 'Drink 2.5L water', frequency: 'daily', priority: 'urgent' },
        { title: 'Eat fruit', frequency: 'daily', priority: 'important' },
        { title: 'No outside food', frequency: 'daily', priority: 'important' },
      ],
    };

    for (const preset of presets) {
      const area = await careAreaRepo.save(careAreaRepo.create({ ...preset, user }));
      const tasks = defaultTasks[preset.name] ?? [];
      for (let i = 0; i < tasks.length; i++) {
        await careTaskRepo.save(careTaskRepo.create({ ...tasks[i], user, care_area: area, display_order: i }));
      }
    }
  }
}

async function bootstrapSeed() {
  await AppDataSource.initialize();
  await runSeed(AppDataSource);
  await AppDataSource.destroy();
}

if (require.main === module) {
  void bootstrapSeed();
}
