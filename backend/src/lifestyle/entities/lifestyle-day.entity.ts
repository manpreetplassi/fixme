import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('lifestyle_days')
@Unique(['user', 'log_date'])
export class LifestyleDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  log_date: string;

  @Column({ type: 'varchar', nullable: true })
  wake_time: string | null;

  @Column({ type: 'varchar', nullable: true })
  sleep_time: string | null;

  @Column({ type: 'numeric', precision: 4, scale: 1, nullable: true })
  sleep_hours: number | null;

  @Column({ type: 'varchar', nullable: true })
  sleep_quality: string | null;

  @Column({ type: 'numeric', precision: 4, scale: 1, default: 0 })
  water_litres: number;

  @Column({ type: 'varchar', nullable: true })
  mood: string | null;

  @Column({ type: 'varchar', nullable: true })
  morning_energy: string | null;

  @Column({ type: 'varchar', nullable: true })
  night_energy: string | null;

  @Column({ type: 'varchar', nullable: true })
  screen_shutdown_time: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
