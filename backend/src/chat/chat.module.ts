import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiModule } from '../gemini/gemini.module';
import { MoneyTrackerModule } from '../money-tracker/money-tracker.module';
import { TodayModule } from '../today/today.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AiActionLog } from './entities/ai-action-log.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AiActionLog, Conversation, Message]), MoneyTrackerModule, TodayModule, GeminiModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
