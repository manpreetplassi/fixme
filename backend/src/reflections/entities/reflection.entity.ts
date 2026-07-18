import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reflections')
export class Reflection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  reflection_date: string;

  @Column({ type: 'text', nullable: true })
  what_went_well: string | null;

  @Column({ type: 'text', nullable: true })
  what_didnt_work: string | null;

  @Column({ type: 'varchar', nullable: true })
  primary_blocker: string | null;

  @Column({ type: 'text', nullable: true })
  blocker_details: string | null;

  @Column({ type: 'text', nullable: true })
  solution_to_try: string | null;

  @Column({ type: 'varchar', nullable: true })
  mood: string | null;

  @Column({ type: 'int', nullable: true })
  energy_level: number | null;

  @Column({ default: false })
  masturbation_happened: boolean;

  @Column({ type: 'text', nullable: true })
  masturbation_trigger_log: string | null;

  @Column({ default: 0 })
  daily_score: number;

  @CreateDateColumn()
  created_at: Date;
}
