import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('money_tracker')
export class MoneyEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  log_date: string;

  @Column({ default: 'saved' })
  type: string;

  @Column({ default: 'Other' })
  category: string;

  @Column({ type: 'varchar', nullable: true })
  reason: string | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'uuid', nullable: true })
  parent_entry_id: string | null;

  @Column({ default: false })
  is_recurring: boolean;

  @Column({ type: 'varchar', nullable: true })
  recurrence_rule: string | null;

  @Column({ default: false })
  needs_price: boolean;

  @Column({ type: 'varchar', nullable: true })
  source_type: string | null;

  @Column({ type: 'uuid', nullable: true })
  source_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  plan_id: string | null;

  @CreateDateColumn()
  created_at: Date;
}
