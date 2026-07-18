import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('reels_vault')
export class Reel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  reel_url: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail_url: string | null;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ type: 'jsonb', nullable: true })
  ai_analysis: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  user_notes: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  linked_triggers: string[];

  @Column({ default: 0 })
  use_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
