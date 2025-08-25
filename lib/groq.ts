import { aiQueue } from './aiQueue';
import { apiCache } from './cache';

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export type LLMModel = 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768' | 'gemma-7b-it' | 'deepseek-r1-distill-llama-70b';
export type SocialPlatform = 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'general';

export class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY!;
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is required');
    }
  }

  private getPlatformPrompt(platform: SocialPlatform): string {
    const prompts = {
      twitter: 'Create content optimized for Twitter/X. Keep it under 280 characters, use engaging hooks, include relevant hashtags (2-3 max), and make it shareable. Focus on brevity and impact.',
      linkedin: 'Create professional LinkedIn content. Use a professional tone, include industry insights, add relevant hashtags, and structure with clear paragraphs. Aim for thought leadership and professional networking.',
      instagram: 'Create Instagram-optimized content. Use engaging captions, include 5-10 relevant hashtags, add emojis for visual appeal, and encourage engagement through questions or calls-to-action.',
      facebook: 'Create Facebook content that encourages engagement. Use a conversational tone, include relevant hashtags (3-5), and structure for easy reading with line breaks and emojis where appropriate.',
      tiktok: 'Create TikTok content description. Focus on trending topics, use casual and energetic tone, include trending hashtags, and structure content that would work well for short-form video.',
      youtube: 'Create YouTube Shorts content description. Include engaging hooks, use trending topics, add relevant hashtags, and focus on content that works well in vertical video format.',
      general: 'Create engaging social media content that can be adapted for multiple platforms. Focus on clear messaging, engaging tone, and broad appeal.'
    };

    return prompts[platform] || prompts.general;
  }

  private cleanGroqResponse(text: string): string {
    // Remove markdown headings (e.g., # Heading, ## Subheading)
    let cleanedText = text.replace(/^#+\s*/gm, '');

    // Remove markdown bold/italic (e.g., **bold**, *italic*)
    cleanedText = cleanedText.replace(/\*\*([^\*]+)\*\*/g, '$1'); // For **bold**
    cleanedText = cleanedText.replace(/\*([^\*]+)\*/g, '$1');   // For *italic*

    // Remove quotation marks
    cleanedText = cleanedText.replace(/"/g, '');

    return cleanedText;
  }

  private generateCacheKey(messages: GroqMessage[], model: LLMModel, platform: SocialPlatform): string {
    const messageHash = messages.map(m => `${m.role}:${m.content}`).join('|');
    return `groq:${model}:${platform}:${Buffer.from(messageHash).toString('base64').slice(0, 32)}`;
  }

  async generateContent(
    messages: GroqMessage[],
    model: LLMModel = 'llama-3.1-8b-instant',
    platform: SocialPlatform = 'general'
  ): Promise<string> {
    // Check cache first (only for non-user specific content)
    const cacheKey = this.generateCacheKey(messages, model, platform);
    const cachedResult = apiCache.get(cacheKey);
    if (cachedResult) {
      console.log('🎯 Cache hit for AI request');
      return cachedResult;
    }

    // Queue the request to prevent API overload
    const result = await aiQueue.add(async () => {
      return this.executeGroqRequest(messages, model, platform);
    }, 1); // Normal priority

    // Cache successful results for 10 minutes
    if (result) {
      apiCache.set(cacheKey, result, 600);
    }

    return result;
  }

  private async executeGroqRequest(
    messages: GroqMessage[],
    model: LLMModel,
    platform: SocialPlatform
  ): Promise<string> {
    const systemPrompt = `You are a social media content creation expert. ${this.getPlatformPrompt(platform)}

Always provide actionable, engaging content that follows platform best practices. Be creative, authentic, and valuable to the audience.`;

    const requestMessages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    try {
      console.log(`🤖 Making AI request (Queue: ${aiQueue.getQueueLength()}, Active: ${aiQueue.getCurrentRequests()})`);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: requestMessages,
          max_tokens: 1024,
          temperature: 0.7,
          top_p: 1,
          stream: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GroqResponse = await response.json();
      return this.cleanGroqResponse(data.choices[0]?.message?.content || 'No response generated');
    } catch (error) {
      console.error('Groq API Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate content');
    }
  }

  async generateStreamingContent(
    messages: GroqMessage[],
    model: LLMModel = 'llama-3.1-8b-instant',
    platform: SocialPlatform = 'general'
  ): Promise<ReadableStream> {
    const systemPrompt = `You are a social media content creation expert. ${this.getPlatformPrompt(platform)}

Always provide actionable, engaging content that follows platform best practices. Be creative, authentic, and valuable to the audience.`;

    const requestMessages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: requestMessages,
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 1,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    return response.body!;
  }
}

export const groqService = new GroqService();