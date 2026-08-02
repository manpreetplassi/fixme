import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private static readonly defaultModel = 'gemini-3.6-flash';
  private static readonly apiKeyNames = ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'];
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: GoogleGenerativeAI | null;
  private readonly modelName: string;
  private readonly configuredKeyName: string | null;

  constructor(private readonly configService: ConfigService) {
    const { apiKey, keyName } = this.resolveApiKey();
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.configuredKeyName = keyName;
    this.modelName = this.configService.get<string>('GEMINI_MODEL')?.trim() || GeminiService.defaultModel;
  }

  async analyzeReel(reelUrl: string, title: string, description: string) {
    if (!this.client) {
      return {
        topic: 'general_wellness',
        keyTips: [description || 'Review the reel manually and save the useful habit idea.'],
        howItHelpsYou: `Saved from ${reelUrl} as a reusable wellness reminder.`,
        actionItems: ['Review this reel before the next blocker moment', 'Add one concrete takeaway to your notes'],
      };
    }

    const model = this.client.getGenerativeModel({ model: this.modelName });
    const prompt = `Analyze this health/wellness Instagram reel.
Title: ${title}
Description: ${description}
URL: ${reelUrl}

Return only valid JSON:
{
  "topic": "health topic category",
  "keyTips": ["tip1", "tip2", "tip3"],
  "howItHelpsYou": "How this specifically helps with fitness/health",
  "actionItems": ["action1", "action2"]
}`;

    try {
      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();
      return JSON.parse(text);
    } catch (error) {
      this.logger.warn(`Gemini analysis failed: ${String(error)}`);
      return {
        topic: 'analysis_unavailable',
        keyTips: ['AI analysis was unavailable, so this reel was saved with a fallback summary.'],
        howItHelpsYou: 'You can still keep the reel in your vault and add manual notes.',
        actionItems: ['Open the reel later', 'Write down the useful advice in your notes'],
      };
    }
  }

  async *streamChat(messages: Array<{ role: 'user' | 'assistant'; content: string }>, accountContext?: string): AsyncGenerator<string> {
    if (!this.client) {
      yield this.fallbackChatResponse(messages.at(-1)?.content ?? '', 'not_configured');
      return;
    }

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction:
        'You are FixMe, a warm and practical personal productivity assistant. You help users manage daily tasks, track money, log meals, plan trips, and reflect on their week. ' +
        'When a user wants to create a task or routine item, ask for the title, suggest a sensible time_block (e.g. "9-10 AM", "2:20 PM"), and suggest a consequence_note if it links to a goal they have mentioned. ' +
        'When a user mentions spending or saving money, help them log it with an amount, category (Food, Travel, Health, Other), and date. ' +
        'Always show a confirmation before claiming anything was saved — never say data was written unless a separate confirmed action exists. ' +
        'Be concise, mobile-friendly, and action-oriented. Avoid long paragraphs.',
    });

    try {
      const history = messages.slice(0, -1).map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));
      const latest = this.withChatContext(messages.at(-1)?.content ?? '', accountContext);
      const result = await model.startChat({ history }).sendMessageStream(latest);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    } catch (error) {
      this.logger.warn(`Gemini chat failed: ${String(error)}`);
      yield this.fallbackChatResponse(messages.at(-1)?.content ?? '', 'api_error');
    }
  }

  async diagnose() {
    if (!this.client) {
      return {
        ok: false,
        reason: 'not_configured',
        status: this.getStatus(),
      };
    }

    try {
      const model = this.client.getGenerativeModel({ model: this.modelName });
      const response = await model.generateContent('Reply with exactly: ok');
      return {
        ok: true,
        status: this.getStatus(),
        sample: response.response.text().trim(),
      };
    } catch (error) {
      this.logger.warn(`Gemini diagnostic failed: ${String(error)}`);
      return {
        ok: false,
        reason: 'api_error',
        status: this.getStatus(),
        error: this.sanitizeError(error),
      };
    }
  }

  getStatus() {
    return {
      configured: Boolean(this.client),
      keyName: this.configuredKeyName,
      model: this.modelName,
    };
  }

  private withChatContext(message: string, accountContext?: string) {
    if (!accountContext) return message;
    return `${accountContext}

Chat instructions:
- Use the account snapshot to review the user's real tasks, money entries, blockers, and routines.
- If the user asks to create, update, delete, or mark something done, append a machine-readable action block after your visible answer.
- The block format must be exactly:
FIXME_ACTIONS_JSON
[{"name":"createRoutineItem","arguments":{"title":"Example","category":"health","priority":"important","repeat_rule":"daily","points":10}}]
END_FIXME_ACTIONS_JSON
- Allowed action names: createRoutineItem, updateRoutineItem, markRoutineItemDone, createMoneyEntry, updateMoneyEntry, deleteMoneyEntry.
- Use IDs from the account snapshot for updates, deletes, and marking done.
- Do not claim anything was saved until the user confirms the proposed action in the app.
- For review/advice questions, do not emit an action block.

User message:
${message}`;
  }

  private resolveApiKey() {
    for (const keyName of GeminiService.apiKeyNames) {
      const apiKey = this.configService.get<string>(keyName)?.trim();
      if (apiKey) return { apiKey, keyName };
    }
    return { apiKey: null, keyName: null };
  }

  private sanitizeError(error: unknown) {
    const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    const statusMatch = details.match(/\b(400|401|403|404|429|500|503)\b/);

    return {
      statusCode: statusMatch?.[1] ?? null,
      message: details.replace(/AIza[0-9A-Za-z_-]+/g, '[redacted-api-key]').slice(0, 1000),
    };
  }

  private fallbackChatResponse(message: string, reason: 'not_configured' | 'api_error') {
    const trimmed = message.trim();
    if (!trimmed) return 'I am here. Send me what you want to think through or plan next.';
    if (reason === 'api_error') {
      return `I hear you: "${trimmed}". Gemini is configured, but the Gemini API call failed, so I saved the conversation and can still help with a simple next step: name the outcome, the deadline, and the first action you can take today.`;
    }
    return `I hear you: "${trimmed}". Gemini is not configured right now, so I saved the conversation and can still help with a simple next step: name the outcome, the deadline, and the first action you can take today.`;
  }
}
