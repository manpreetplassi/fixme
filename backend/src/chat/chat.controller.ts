import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ChatFunctionCallDto, SendChatMessageDto } from './dto/chat-action.dto';
import { ChatService } from './chat.service';

@ApiTags('chat')
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a persistent chat conversation for the current user' })
  createConversation(@CurrentUser() user: User) {
    return this.chatService.createConversation(user);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List persistent chat conversations for the current user' })
  conversations(@CurrentUser() user: User) {
    return this.chatService.listConversations(user.id);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete a conversation and all its messages' })
  deleteConversation(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chatService.deleteConversation(user.id, id);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Load full message history for a conversation' })
  messages(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chatService.getMessages(user.id, id);
  }

  @Post('conversations/:id/message')
  @ApiOperation({ summary: 'Send a message and stream the assistant response as raw text' })
  async message(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: SendChatMessageDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    await this.chatService.sendMessage(user, id, dto.content, (chunk) => res.write(chunk));
    res.end();
  }

  @Get('functions')
  @ApiOperation({ summary: 'Get Gemini chat function definitions and write safety policy' })
  functions() {
    return this.chatService.functionDefinitions();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get safe chat/Gemini configuration status' })
  status() {
    return this.chatService.status();
  }

  @Post('diagnostics/gemini')
  @ApiOperation({ summary: 'Run a safe Gemini connectivity diagnostic' })
  diagnoseGemini() {
    return this.chatService.diagnoseGemini();
  }

  @Post('functions/call')
  @ApiOperation({ summary: 'Execute a read function or create a pending write action' })
  functionCall(@CurrentUser() user: User, @Body() dto: ChatFunctionCallDto) {
    return this.chatService.executeFunctionCall(user, dto.name, dto.arguments ?? {});
  }

  @Post('actions/:pendingActionId/confirm')
  @ApiOperation({ summary: 'Confirm and execute a pending AI-proposed action' })
  confirm(@CurrentUser() user: User, @Param('pendingActionId') pendingActionId: string) {
    return this.chatService.confirm(user, pendingActionId);
  }

  @Post('actions/:pendingActionId/reject')
  @ApiOperation({ summary: 'Reject a pending AI-proposed action without writing data' })
  reject(@CurrentUser() user: User, @Param('pendingActionId') pendingActionId: string) {
    return this.chatService.reject(user.id, pendingActionId);
  }

  @Get('actions/history')
  @ApiOperation({ summary: 'Get AI action history for the current user' })
  history(@CurrentUser() user: User) {
    return this.chatService.history(user.id);
  }
}
