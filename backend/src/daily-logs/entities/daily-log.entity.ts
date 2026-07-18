import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DailyTask } from '../../daily-tasks/entities/daily-task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('daily_logs')
export class DailyLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DailyTask, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: DailyTask;

  @Column({ type: 'date' })
  log_date: string;

  @Column({ default: 'not_started' })
  status: string;

  @Column({ default: 0 })
  points_earned: number;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number | null;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  money_saved: number;

  @CreateDateColumn()
  created_at: Date;
}
