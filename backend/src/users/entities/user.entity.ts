import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ default: '06:00' })
  wake_target: string;

  @Column({ default: '23:00' })
  sleep_target: string;

  @Column({ default: 60 })
  exercise_minutes_target: number;

  @Column('decimal', { precision: 10, scale: 2, default: 400 })
  daily_zomato_avoidance_savings: number;

  @Column({ default: 1000 })
  weekly_reward_threshold: number;

  @Column({ default: true })
  dark_mode: boolean;

  @Column({ default: true })
  notifications_enabled: boolean;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  preferred_hobbies: string[];

  @Column({ default: 'addiction' })
  addiction_label: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
