import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('lifestyle_activities')
export class LifestyleActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  activity_date: string;

  @Column()
  activity_type: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  start_time: string | null;

  @Column({ type: 'varchar', nullable: true })
  end_time: string | null;

  @Column({ type: 'int', default: 0 })
  duration_minutes: number;

  @Column({ type: 'varchar', nullable: true })
  project_name: string | null;

  @Column({ type: 'int', nullable: true })
  calories: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'uuid', nullable: true })
  source_hobby_log_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  linked_money_entry_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
