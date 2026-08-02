import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

export type MessageRole = 'user' | 'assistant';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  message_id: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ type: 'varchar' })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  is_streamed: boolean;

  @CreateDateColumn()
  created_at: Date;
}
