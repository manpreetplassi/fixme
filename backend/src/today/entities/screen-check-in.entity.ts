import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('screen_check_ins')
@Unique(['user', 'check_date', 'period'])
export class ScreenCheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  check_date: string;

  @Column()
  period: string;

  @Column({ default: false })
  watched: boolean;

  @Column({ type: 'varchar', nullable: true })
  content_type: string | null;

  @Column({ type: 'text', nullable: true })
  title_note: string | null;

  @Column({ type: 'varchar', nullable: true })
  stopped_watching_at: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
