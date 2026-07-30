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
}
