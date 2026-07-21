import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('meal_entries')
export class MealEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  meal_date: string;

  @Column()
  meal_type: string;

  @Column({ type: 'varchar', nullable: true })
  meal_time: string | null;

  @Column({ type: 'varchar', nullable: true })
  meal_name: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  food_items: string[];

  @Column({ default: true })
  homemade: boolean;

  @Column({ default: false })
  outside_food: boolean;

  @Column({ default: false })
  leftover_from_dinner: boolean;

  @Column({ type: 'varchar', nullable: true })
  restaurant: string | null;

  @Column({ type: 'varchar', nullable: true })
  sabzi_name: string | null;

  @Column({ type: 'int', nullable: true })
  roti_count: number | null;

  @Column({ default: false })
  rice: boolean;

  @Column({ default: false })
  dal: boolean;

  @Column({ default: false })
  salad: boolean;

  @Column({ default: false })
  curd: boolean;

  @Column({ default: false })
  fruits: boolean;

  @Column({ default: false })
  tea: boolean;

  @Column({ default: false })
  coffee: boolean;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  cost: number | null;

  @Column({ type: 'uuid', nullable: true })
  linked_money_entry_id: string | null;

  @Column({ type: 'varchar', nullable: true })
  outside_reason: string | null;

  @Column({ type: 'varchar', nullable: true })
  quantity: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
