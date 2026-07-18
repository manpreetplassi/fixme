import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Hobby } from './hobby.entity';

@Entity('hobby_logs')
export class HobbyLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Hobby, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hobby_id' })
  hobby: Hobby;

  @Column({ type: 'date' })
  log_date: string;

  @Column({ default: 0 })
  duration_minutes: number;

  @Column({ default: 0 })
  points_earned: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;
}
