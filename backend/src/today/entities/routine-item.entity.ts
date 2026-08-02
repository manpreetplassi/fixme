import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('routine_items')
export class RoutineItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column()
  category: string;

  @Column({ type: 'varchar', nullable: true })
  parent_tag: string | null;

  @Column({ type: 'varchar', nullable: true })
  sub_tag: string | null;

  @Column({ type: 'varchar', nullable: true })
  time_block: string | null;

  @Column({ type: 'text', nullable: true })
  consequence_note: string | null;

  @Column({ default: 'important' })
  priority: string;

  @Column({ default: 'daily' })
  repeat_rule: string;

  @Column({ type: 'date', nullable: true })
  scheduled_date: string | null;

  @Column({ default: 'simple' })
  item_type: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  target_value: number | null;

  @Column({ type: 'varchar', nullable: true })
  target_unit: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  tolerance_value: number | null;

  @Column({ default: false })
  reminder_enabled: boolean;

  @Column({ default: 'time' })
  reminder_trigger_type: string;

  @Column({ type: 'uuid', nullable: true })
  reminder_trigger_item_id: string | null;

  @Column({ default: false })
  time_tracking_enabled: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 'custom' })
  source: string;

  @Column({ default: 0 })
  display_order: number;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'varchar', nullable: true })
  legacy_task_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  icon: string | null;

  @Column({ type: 'varchar', nullable: true })
  plan_id: string | null;

  @Column({ type: 'uuid', nullable: true })
  linked_money_entry_id: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
