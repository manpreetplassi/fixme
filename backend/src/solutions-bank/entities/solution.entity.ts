import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('solutions_bank')
export class Solution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blocker: string;

  @Column()
  trigger: string;

  @Column({ type: 'text' })
  solution: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  action_items: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  related_reels: string[];

  @Column({ default: 0 })
  priority: number;

  @CreateDateColumn()
  created_at: Date;
}
