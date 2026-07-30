import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CareArea } from './care-area.entity';

@Entity('care_tasks')
export class CareTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CareArea, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'care_area_id' })
  care_area: CareArea;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: 'daily' })
  frequency: string; // daily | weekly | monthly | custom

  @Column({ default: 'important' })
  priority: string;

  @Column({ default: true })
  is_active: boolean;

  // when user activates this task into Today routine, we store the routine_item id
  @Column({ type: 'uuid', nullable: true })
  routine_item_id: string | null;

  @Column({ default: 0 })
  display_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
