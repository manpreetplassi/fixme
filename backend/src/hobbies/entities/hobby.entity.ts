import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hobbies')
export class Hobby {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column()
  category: string;

  @Column({ type: 'varchar', nullable: true })
  icon: string | null;

  @Column({ default: false })
  is_weekend_only: boolean;

  @Column({ default: 5 })
  default_points_per_instance: number;

  @Column({ default: 15 })
  suggested_minutes_per_day: number;

  @Column({ default: 0 })
  display_order: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
