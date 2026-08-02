import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { validateSync } from 'class-validator';
import { Repository } from 'typeorm';
import { GeminiService } from '../gemini/gemini.service';
import { CreateMoneyEntryDto, UpdateMoneyEntryDto } from '../money-tracker/dto/money-entry.dto';
import { MoneyTrackerService } from '../money-tracker/money-tracker.service';
import { CreateRoutineItemDto, SetRoutineDoneDto, UpdateRoutineItemDto } from '../today/dto/today.dto';
import { TodayService } from '../today/today.service';
import { User } from '../users/entities/user.entity';
import { AiActionLog } from './entities/ai-action-log.entity';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

type PendingActionType =
  | 'routine_item_mark_done'
  | 'money_entry_create'
  | 'money_entry_update'
  | 'money_entry_delete'
  | 'routine_item_create'
  | 'routine_item_update';

const writeFunctionMap: Record<string, PendingActionType> = {
  markRoutineItemDone: 'routine_item_mark_done',
  createMoneyEntry: 'money_entry_create',
  updateMoneyEntry: 'money_entry_update',
  deleteMoneyEntry: 'money_entry_delete',
  createRoutineItem: 'routine_item_create',
  updateRoutineItem: 'routine_item_update',
};

const allowedFields = {
  createMoneyEntry: ['amount', 'log_date', 'reason', 'type', 'category', 'name', 'parent_entry_id', 'is_recurring', 'recurrence_rule', 'needs_price', 'source_type', 'source_id', 'linked_source_type', 'linked_source_id', 'plan_id'],
  updateMoneyEntry: ['amount', 'log_date', 'reason', 'type', 'category', 'name', 'parent_entry_id', 'is_recurring', 'recurrence_rule', 'needs_price', 'source_type', 'source_id', 'linked_source_type', 'linked_source_id', 'plan_id'],
  createRoutineItem: ['title', 'category', 'parent_tag', 'sub_tag', 'time_block', 'consequence_note', 'priority', 'repeat_rule', 'scheduled_date', 'item_type', 'target_value', 'target_unit', 'tolerance_value', 'reminder_enabled', 'reminder_trigger_type', 'reminder_trigger_item_id', 'time_tracking_enabled', 'display_order', 'points', 'plan_id', 'linked_money_entry_id'],
  updateRoutineItem: ['title', 'category', 'parent_tag', 'sub_tag', 'time_block', 'consequence_note', 'priority', 'repeat_rule', 'scheduled_date', 'item_type', 'target_value', 'target_unit', 'tolerance_value', 'reminder_enabled', 'reminder_trigger_type', 'reminder_trigger_item_id', 'is_active', 'display_order', 'points', 'plan_id', 'linked_money_entry_id'],
  setRoutineDone: ['is_done', 'status', 'date', 'note', 'blocker_reason', 'points_earned', 'duration_minutes', 'actual_value', 'score', 'rating', 'linked_money_entry_id'],
};

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(AiActionLog) private readonly actionsRepo: Repository<AiActionLog>,
    @InjectRepository(Conversation) private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
    private readonly moneyTrackerService: MoneyTrackerService,
    private readonly todayService: TodayService,
    private readonly configService: ConfigService,
    private readonly geminiService: GeminiService,
  ) {}

  async createConversation(user: User) {
    const conversation = await this.conversationRepo.save(this.conversationRepo.create({ user, title: null }));
    return {
      conversation_id: conversation.conversation_id,
      title: conversation.title,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
    };
  }

  listConversations(userId: string) {
    return this.conversationRepo.find({
      where: { user: { id: userId } },
      order: { updated_at: 'DESC', created_at: 'DESC' },
      take: 50,
    });
  }

  async getMessages(userId: string, conversationId: string) {
    const conversation = await this.findConversation(userId, conversationId);
    return this.messageRepo.find({
      where: { conversation: { conversation_id: conversation.conversation_id } },
      order: { created_at: 'ASC' },
    });
  }

  async sendMessage(user: User, conversationId: string, content: string, onChunk: (chunk: string) => void) {
    const conversation = await this.findConversation(user.id, conversationId);
    const userContent = content.trim();
    if (!userContent) throw new BadRequestException('Message content is required');

    await this.messageRepo.save(this.messageRepo.create({ conversation, role: 'user', content: userContent, is_streamed: false }));
    const history = await this.messageRepo.find({
      where: { conversation: { conversation_id: conversation.conversation_id } },
      order: { created_at: 'ASC' },
    });

    let assistantContent = '';
    for await (const chunk of this.geminiService.streamChat(history.map((message) => ({ role: message.role, content: message.content })))) {
      assistantContent += chunk;
      onChunk(chunk);
    }

    await this.messageRepo.save(this.messageRepo.create({ conversation, role: 'assistant', content: assistantContent, is_streamed: true }));
    if (!conversation.title) conversation.title = this.titleFromContent(userContent);
    await this.conversationRepo.save(conversation);
  }

  functionDefinitions() {
    return {
      readOnly: ['getTodayItems', 'getMoneyEntries', 'getBudgetVsSpent', 'getPendingNeedsPrice'],
      writesRequireConfirmation: Object.keys(writeFunctionMap),
    };
  }

  async executeFunctionCall(user: User, name: string, args: Record<string, unknown> = {}) {
    if (writeFunctionMap[name]) {
      return this.proposeWriteAction(user, writeFunctionMap[name], args);
    }

    switch (name) {
      case 'getTodayItems':
        return (await this.todayService.getToday(user, this.stringArg(args.date))).items;
      case 'getMoneyEntries':
        return this.getMoneyEntries(user.id, args);
      case 'getBudgetVsSpent':
        return { month: this.stringArg(args.month), summary: await this.moneyTrackerService.summary(user.id) };
      case 'getPendingNeedsPrice':
        return (await this.moneyTrackerService.findAll(user.id)).filter((entry) => entry.needs_price);
      default:
        throw new BadRequestException(`Unknown chat function: ${name}`);
    }
  }

  async proposeWriteAction(user: User, actionType: PendingActionType, payload: Record<string, unknown>) {
    const action = await this.actionsRepo.save(
      this.actionsRepo.create({
        user,
        action_type: actionType,
        payload,
        status: 'proposed',
        resolved_at: null,
      }),
    );

    return {
      confirmation_required: true,
      ai_write_enabled: this.configService.get<string>('AI_WRITE_ENABLED', 'false') === 'true',
      pending_action: {
        id: action.id,
        type: action.action_type,
        payload: action.payload,
        requires_confirmation: true,
      },
    };
  }

  history(userId: string) {
    return this.actionsRepo.find({ where: { user: { id: userId } }, order: { created_at: 'DESC' } });
  }

  async confirm(user: User, pendingActionId: string) {
    const action = await this.findProposedAction(user.id, pendingActionId);
    const result = await this.executeConfirmedAction(user, action);
    action.status = 'confirmed';
    action.resolved_at = new Date();
    await this.actionsRepo.save(action);
    return { status: 'confirmed', action_id: action.id, result };
  }

  async reject(userId: string, pendingActionId: string) {
    const action = await this.findProposedAction(userId, pendingActionId);
    action.status = 'rejected';
    action.resolved_at = new Date();
    await this.actionsRepo.save(action);
    return { status: 'rejected', action_id: action.id };
  }

  private async executeConfirmedAction(user: User, action: AiActionLog) {
    switch (action.action_type as PendingActionType) {
      case 'money_entry_create':
        return this.moneyTrackerService.create(user, this.validatedDto(CreateMoneyEntryDto, action.payload, allowedFields.createMoneyEntry));
      case 'money_entry_update':
        return this.moneyTrackerService.update(this.requiredString(action.payload.id, 'id'), user.id, this.validatedNestedDto(UpdateMoneyEntryDto, action.payload, allowedFields.updateMoneyEntry));
      case 'money_entry_delete':
        return this.moneyTrackerService.remove(this.requiredString(action.payload.id, 'id'), user.id);
      case 'routine_item_create':
        return this.todayService.createItem(user, this.validatedDto(CreateRoutineItemDto, action.payload, allowedFields.createRoutineItem));
      case 'routine_item_update':
        return this.todayService.updateItem(user.id, this.requiredString(action.payload.id, 'id'), this.validatedNestedDto(UpdateRoutineItemDto, action.payload, allowedFields.updateRoutineItem));
      case 'routine_item_mark_done':
        return this.todayService.setDone(user, this.requiredString(action.payload.item_id, 'item_id'), this.validatedDto(SetRoutineDoneDto, action.payload, allowedFields.setRoutineDone));
      default:
        throw new BadRequestException(`Unsupported pending action: ${action.action_type}`);
    }
  }

  private async findProposedAction(userId: string, id: string) {
    const action = await this.actionsRepo.findOne({ where: { id, user: { id: userId }, status: 'proposed' } });
    if (!action) throw new NotFoundException('Pending action not found');
    return action;
  }

  private async findConversation(userId: string, conversationId: string) {
    const conversation = await this.conversationRepo.findOne({ where: { conversation_id: conversationId, user: { id: userId } } });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  private titleFromContent(content: string) {
    const collapsed = content.replace(/\s+/g, ' ').trim();
    return collapsed.length > 64 ? `${collapsed.slice(0, 61)}...` : collapsed || null;
  }

  private async getMoneyEntries(userId: string, args: Record<string, unknown>) {
    const entries = await this.moneyTrackerService.findAll(userId);
    const range = typeof args.date_range === 'object' && args.date_range ? args.date_range as Record<string, unknown> : {};
    const start = this.stringArg(range.startDate ?? range.start_date);
    const end = this.stringArg(range.endDate ?? range.end_date);
    const category = this.stringArg(args.category);
    return entries.filter((entry) => {
      if (start && entry.log_date < start) return false;
      if (end && entry.log_date > end) return false;
      if (category && entry.category !== category) return false;
      return true;
    });
  }

  private validatedNestedDto<T extends object>(DtoClass: new () => T, payload: Record<string, unknown>, fields: string[]) {
    const nested = typeof payload.payload === 'object' && payload.payload ? payload.payload as Record<string, unknown> : payload;
    return this.validatedDto(DtoClass, nested, fields);
  }

  private validatedDto<T extends object>(DtoClass: new () => T, payload: Record<string, unknown>, fields: string[]) {
    const dto = Object.assign(new DtoClass(), this.pick(payload, fields));
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) throw new BadRequestException('Pending action payload is invalid');
    return dto;
  }

  private pick(payload: Record<string, unknown>, fields: string[]) {
    return Object.fromEntries(Object.entries(payload).filter(([key]) => fields.includes(key)));
  }

  private requiredString(value: unknown, field: string) {
    if (typeof value !== 'string' || !value.trim()) throw new BadRequestException(`${field} is required`);
    return value;
  }

  private stringArg(value: unknown) {
    return typeof value === 'string' && value.trim() ? value : undefined;
  }
}
