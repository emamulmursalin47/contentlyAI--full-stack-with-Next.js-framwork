/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { Conversation, User, Message } from '@/lib/mongodb';
import { groqService, LLMModel, SocialPlatform, GroqMessage } from '@/lib/groq';
import { AuthService } from '@/lib/auth';
import { adminAuth } from '@/lib/firebaseAdmin';
import { measureAsync, perfMonitor } from '@/lib/performance';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function authenticateUser(request: NextRequest): Promise<string | null> {
  // Try Firebase authentication first
  const authorizationHeader = request.headers.get('Authorization');
  const firebaseIdToken = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.split(' ')[1]
    : null;

  if (firebaseIdToken) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (user) {
        return user._id.toString();
      }
    } catch (firebaseError) {
      console.error('Firebase authentication failed:', firebaseError);
      // Fall through to token authentication
    }
  }

  // Try token authentication
  const accessToken = request.cookies.get('access_token')?.value;
  if (accessToken) {
    try {
      const payload = AuthService.verifyAccessToken(accessToken);
      return payload?.userId || null;
    } catch (tokenError) {
      console.error('Token authentication failed:', tokenError);
    }
  }
  
  return null;
}

function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', APP_URL);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Platform-specific content guidelines
type PlatformGuidelines = {
  maxLength: number;
  emojiRecommendation?: boolean;
  hashtagRecommendation?: boolean;
  characterCount?: boolean;
  professionalTone?: boolean;
  paragraphStructure?: boolean;
  lineBreaks?: boolean;
  callToAction?: boolean;
  engagementPrompt?: boolean;
  trendingTopics?: boolean;
  viralHooks?: boolean;
  videoDescription?: boolean;
  seoKeywords?: boolean;
  basicFormatting?: boolean;
};

const PLATFORM_GUIDELINES: Record<string, PlatformGuidelines> = {
  twitter: {
    maxLength: 280,
    emojiRecommendation: true,
    hashtagRecommendation: true,
    characterCount: true
  },
  linkedin: {
    maxLength: 1300,
    professionalTone: true,
    hashtagRecommendation: true,
    paragraphStructure: true
  },
  instagram: {
    maxLength: 2200,
    emojiRecommendation: true,
    lineBreaks: true,
    callToAction: true
  },
  facebook: {
    maxLength: 63206,
    emojiRecommendation: true,
    paragraphStructure: true,
    engagementPrompt: true
  },
  tiktok: {
    maxLength: 150,
    trendingTopics: true,
    viralHooks: true,
    emojiRecommendation: true
  },
  youtube: {
    maxLength: 4500,
    videoDescription: true,
    hashtagRecommendation: true,
    seoKeywords: true
  },
  general: {
    maxLength: 1000,
    basicFormatting: true
  }
};

function extractThinkingContent(text: string): { mainContent: string; thinkingContent: string | null } {
  const thinkRegex = /<think>(.*?)<\/think>/s;
  const match = text.match(thinkRegex);

  if (match && match[1]) {
    const thinkingContent = match[1].trim();
    const mainContent = text.replace(thinkRegex, '').trim();
    return { mainContent, thinkingContent };
  }
  return { mainContent: text.trim(), thinkingContent: null };
}

function getPlatformSpecificPrompt(platform: SocialPlatform, _model: LLMModel): string {
  const guidelines = PLATFORM_GUIDELINES[platform] || PLATFORM_GUIDELINES.general;
  
  const prompt = `You are ContentlyAI, an expert social media content creation assistant. Your goal is to be helpful, creative, and conversational.

When the user asks for content, create engaging, platform-optimized content for ${platform}.

## CRITICAL GUIDELINES:
- STRICTLY adhere to ${platform}'s best practices
- Maximum ${guidelines.maxLength} characters for main content
- Use appropriate tone for ${platform}
- Include relevant emojis if suitable
- Add 3-5 relevant hashtags at the end
- Ensure high engagement potential

## CONTENT STRUCTURE:
[Main Hook/Headline] - Attention-grabbing opening

[Body Content] - Clear, concise message

[Call to Action] - Engagement prompt (like, comment, share)

[Hashtags] - 3-5 relevant hashtags

## THINKING PROCESS:
<think>
Analyze: [Platform analysis]
Tone: [Appropriate tone]
Strategy: [Content strategy]
Engagement: [Engagement tactics]
Optimization: [Platform-specific optimizations]
</think>

## FINAL OUTPUT:
[Your optimized social media content here]`;

  return prompt;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return measureAsync('api-get-messages', async () => {
    try {
      await dbConnect();

      const userId = await authenticateUser(request);
      const { id } = await params;
      const conversationId = id;

      if (!userId) {
        const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        return setCorsHeaders(response);
      }

      if (!conversationId || typeof conversationId !== 'string') {
        const response = NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
        return setCorsHeaders(response);
      }

      const conversation = await measureAsync('db-find-conversation', () =>
        Conversation.findOne({ _id: conversationId, userId })
      );

      if (!conversation) {
        const response = NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        return setCorsHeaders(response);
      }

      const messages = await measureAsync('db-find-messages', () =>
        Message.find({ conversationId }).sort({ createdAt: 1 })
      );

      const responseData = {
        messages: messages.map(msg => ({
          ...msg.toObject(),
          id: msg._id.toString(),
          createdAt: msg.createdAt.toISOString()
        }))
      };

      const response = NextResponse.json(responseData);
      response.headers.set('Cache-Control', 'private, max-age=10');
      return setCorsHeaders(response);
    } catch (error) {
      console.error('Messages fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch messages';
      const response = NextResponse.json({ error: errorMessage }, { status: 500 });
      return setCorsHeaders(response);
    }
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const userId = await authenticateUser(request);
    const { id } = await params;
    const conversationId = id;
    
    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return setCorsHeaders(response);
    }

    if (!conversationId || typeof conversationId !== 'string') {
      const response = NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
      return setCorsHeaders(response);
    }

    const body = await request.json();
    const { content, role, model = 'llama-3.1-8b-instant', platform = 'general' } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      const response = NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
      return setCorsHeaders(response);
    }

    if (!role || !['user', 'assistant', 'system'].includes(role)) {
      const response = NextResponse.json({ error: 'Valid role is required (user, assistant, or system)' }, { status: 400 });
      return setCorsHeaders(response);
    }

    // Validate model
    const validModels = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'gemma2-9b-it', 'deepseek-r1-distill-llama-70b', 'openai/gpt-oss-120b', 'qwen/qwen3-32b'];
    if (!validModels.includes(model)) {
      const response = NextResponse.json({ error: 'Invalid model specified' }, { status: 400 });
      return setCorsHeaders(response);
    }

    // Validate platform
    const validPlatforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok', 'youtube', 'general'];
    if (!validPlatforms.includes(platform)) {
      const response = NextResponse.json({ error: 'Invalid platform specified' }, { status: 400 });
      return setCorsHeaders(response);
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });

    if (!conversation) {
      const response = NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      return setCorsHeaders(response);
    }

    if (role !== 'user') {
      // Just save non-user messages and return
      const message = await Message.create({
        conversationId,
        role,
        content: content.trim(),
        metadata: { platform, model, characterCount: content.trim().length }
      });

      const responseData = {
        userMessage: {
          ...message.toObject(),
          id: message._id.toString(),
          createdAt: message.createdAt.toISOString()
        }
      };

      const response = NextResponse.json(responseData, { status: 201 });
      return setCorsHeaders(response);
    }

    // Role is 'user', so generate AI response
    try {
      const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

      const systemPrompt = getPlatformSpecificPrompt(platform as SocialPlatform, model as LLMModel);

      const groqMessages: GroqMessage[] = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        { role: 'user', content: content.trim() }
      ];
      
      const aiResponse = await groqService.generateContent(
        groqMessages,
        model as LLMModel,
        platform as SocialPlatform
      );

      const { mainContent, thinkingContent } = extractThinkingContent(aiResponse);

      // Save user message
      const userMessage = await Message.create({
        conversationId,
        role,
        content: content.trim(),
        metadata: { platform, model, characterCount: content.trim().length }
      });

      const characterCount = mainContent.length;
      const hashtags = (mainContent.match(/#\w+/g) || []).length;
      const emojis = (mainContent.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;

      // Save AI message
      const aiMessage = await Message.create({
        conversationId,
        role: 'assistant',
        content: mainContent,
        thinkingContent: thinkingContent,
        metadata: {
          platform,
          model,
          characterCount,
          hashtags,
          emojis,
          optimizationScore: calculateOptimizationScore(mainContent, platform as SocialPlatform)
        }
      });

      const responseData = {
        userMessage: {
          ...userMessage.toObject(),
          id: userMessage._id.toString(),
          createdAt: userMessage.createdAt.toISOString()
        },
        aiMessage: {
          ...aiMessage.toObject(),
          id: aiMessage._id.toString(),
          createdAt: aiMessage.createdAt.toISOString()
        },
        analytics: {
          characterCount,
          hashtags,
          emojis,
          platformSuitability: checkPlatformSuitability(mainContent, platform as SocialPlatform)
        }
      };

      const response = NextResponse.json(responseData, { status: 201 });
      return setCorsHeaders(response);

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      // Save user message even if AI fails
      const userMessage = await Message.create({
        conversationId,
        role,
        content: content.trim(),
        metadata: { platform, model, characterCount: content.trim().length }
      });

      const responseData = {
        userMessage: {
          ...userMessage.toObject(),
          id: userMessage._id.toString(),
          createdAt: userMessage.createdAt.toISOString()
        },
        aiMessage: null,
        error: 'Failed to generate AI response'
      };

      const response = NextResponse.json(responseData, { status: 201 });
      return setCorsHeaders(response);
    }
  } catch (error) {
    console.error('Message creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const response = NextResponse.json({ error: errorMessage }, { status: 500 });
    return setCorsHeaders(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}

// Helper functions for content analysis
function calculateOptimizationScore(content: string, platform: SocialPlatform): number {
  const guidelines = PLATFORM_GUIDELINES[platform] || PLATFORM_GUIDELINES.general;
  let score = 100;

  // Length penalty
  if (content.length > guidelines.maxLength) {
    score -= Math.min(50, ((content.length - guidelines.maxLength) / guidelines.maxLength) * 100);
  }

  // Hashtag bonus
  const hashtags = (content.match(/#\w+/g) || []).length;
  if (hashtags >= 3 && hashtags <= 5) {
    score += 10;
  }

  // Emoji bonus for platforms that benefit from them
  if (guidelines.emojiRecommendation) {
    const emojis = (content.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
    if (emojis > 0 && emojis <= 3) {
      score += 5;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function checkPlatformSuitability(content: string, platform: SocialPlatform): {
  suitable: boolean;
  issues: string[];
} {
  const guidelines = PLATFORM_GUIDELINES[platform];
  const issues: string[] = [];

  if (content.length > guidelines.maxLength) {
    issues.push(`Content exceeds ${platform}'s optimal length (${content.length}/${guidelines.maxLength} characters)`);
  }

  const hashtags = (content.match(/#\w+/g) || []).length;
  if (hashtags < 2) {
    issues.push('Consider adding more hashtags for discoverability');
  }

  if (platform === 'linkedin' && content.includes('!!!')) {
    issues.push('Avoid excessive exclamation marks for professional platforms');
  }

  return {
    suitable: issues.length === 0,
    issues
  };
}