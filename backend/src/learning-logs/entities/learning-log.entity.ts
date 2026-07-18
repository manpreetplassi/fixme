import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('learning_logs')
export class LearningLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  log_date: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  key_notes: string;

  @Column({ type: 'text', nullable: true })
  detailed_description: string | null;

  @Column({ type: 'varchar', nullable: true })
  code_link: string | null;

  @Column({ default: false })
  tweeted_to_twitter: boolean;

  @Column({ default: false })
  posted_to_linkedin: boolean;

  @Column({ type: 'varchar', nullable: true })
  tweet_url: string | null;

  @Column({ type: 'varchar', nullable: true })
  linkedin_url: string | null;

  @Column({ type: 'varchar', nullable: true })
  tags: string | null;

  @CreateDateColumn()
  created_at: Date;
}
