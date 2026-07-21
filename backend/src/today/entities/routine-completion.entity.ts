import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RoutineItem } from './routine-item.entity';

@Entity('routine_completions')
@Unique(['user', 'routine_item', 'completion_date'])
@Unique(['user', 'system_key', 'completion_date'])
export class RoutineCompletion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => RoutineItem, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'routine_item_id' })
  routine_item: RoutineItem | null;

  @Column({ type: 'varchar', nullable: true })
  system_key: string | null;

  @Column({ type: 'date' })
  completion_date: string;

  @Column({ default: true })
  is_done: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ default: 'not_started' })
  status: string;

  @Column({ default: 0 })
  points_earned: number;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number | null;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @Column({ type: 'varchar', nullable: true })
  legacy_log_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  linked_money_entry_id: string | null;

  @CreateDateColumn()
  created_at: Date;
}
