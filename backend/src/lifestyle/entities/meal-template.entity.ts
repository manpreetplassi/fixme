import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('meal_templates')
export class MealTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column()
  meal_type: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  food_items: string[];

  @Column({ default: true })
  homemade: boolean;

  @Column({ type: 'varchar', nullable: true })
  sabzi_name: string | null;

  @Column({ type: 'int', nullable: true })
  roti_count: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
