import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private static readonly defaultModel = 'gemini-2.5-flash';
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: GoogleGenerativeAI | null;
  private readonly modelName: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.client = apiKey ? new GoogleGenerativeAI(apiKey) : null;
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

  async *streamChat(messages: Array<{ role: 'user' | 'assistant'; content: string }>): AsyncGenerator<string> {
    if (!this.client) {
      yield this.fallbackChatResponse(messages.at(-1)?.content ?? '');
      return;
    }

    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction:
        'You are FixMe chat: a warm, practical assistant for productivity, money tracking, meals, and trip planning. Chat normally. Do not claim that app data was changed unless a separate confirmed action exists.',
    });

    try {
      const history = messages.slice(0, -1).map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      }));
      const latest = messages.at(-1)?.content ?? '';
      const result = await model.startChat({ history }).sendMessageStream(latest);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) yield text;
      }
    } catch (error) {
      this.logger.warn(`Gemini chat failed: ${String(error)}`);
      yield this.fallbackChatResponse(messages.at(-1)?.content ?? '');
    }
  }

  private fallbackChatResponse(message: string) {
    const trimmed = message.trim();
    if (!trimmed) return 'I am here. Send me what you want to think through or plan next.';
    return `I hear you: "${trimmed}". Gemini is not configured right now, so I saved the conversation and can still help with a simple next step: name the outcome, the deadline, and the first action you can take today.`;
  }
}
