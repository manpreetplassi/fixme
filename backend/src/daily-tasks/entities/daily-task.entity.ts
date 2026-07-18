import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('daily_tasks')
export class DailyTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  day_type: string;

  @Column()
  priority: string;

  @Column()
  points: number;

  @Column()
  category: string;

  @Column({ default: false })
  is_optional: boolean;

  @Column({ default: false })
  is_bonus: boolean;

  @Column({ default: 1 })
  max_cheats_per_week: number;

  @Column({ type: 'varchar', nullable: true })
  icon: string | null;

  @Column({ default: 0 })
  display_order: number;

  @Column({ default: true })
  is_enabled: boolean;

  @CreateDateColumn()
  created_at: Date;
}
