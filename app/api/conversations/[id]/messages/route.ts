/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { Conversation, Message } from '@/lib/mongodb';
import { groqService, LLMModel, SocialPlatform, GroqMessage } from '@/lib/groq';
import { AuthService } from '@/lib/auth';

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
  
  const prompt = `You are an expert social media content creator specializing in ${platform}. Create engaging, platform-optimized content.

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
  try {
    await dbConnect();

    const accessToken = request.cookies.get('access_token')?.value;
    const payload = accessToken ? AuthService.verifyAccessToken(accessToken) : null;
    const userId = payload?.userId;

    const { id } = await params;
    const conversationId = id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const accessToken = request.cookies.get('access_token')?.value;
    const payload = accessToken ? AuthService.verifyAccessToken(accessToken) : null;
    const userId = payload?.userId;

    const { id } = await params;
    const conversationId = id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, role, model = 'llama-3.1-8b-instant', platform = 'general' } = await request.json();

    if (!content || !role) {
      return NextResponse.json({ error: 'Content and role are required' }, { status: 400 });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId,
      role,
      content,
      metadata: {
        platform,
        model,
        characterCount: content.length
      }
    });

    // If it's a user message, generate AI response
    if (role === 'user') {
      try {
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

        // Enhanced system prompt for social media
        const systemPrompt = getPlatformSpecificPrompt(platform as SocialPlatform, model as LLMModel);

        const groqMessages: GroqMessage[] = [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...(messages?.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          })) || []),
        ];


        
        const aiResponse = await groqService.generateContent(
          groqMessages,
          model as LLMModel,
          platform as SocialPlatform
        );

        const { mainContent, thinkingContent } = extractThinkingContent(aiResponse);

        // Analyze the generated content
        const characterCount = mainContent.length;
        const hashtags = (mainContent.match(/#\w+/g) || []).length;
        const emojis = (mainContent.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;

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

        return NextResponse.json({ 
          userMessage,
          aiMessage,
          analytics: {
            characterCount,
            hashtags,
            emojis,
            platformSuitability: checkPlatformSuitability(mainContent, platform as SocialPlatform)
          }
        }, { status: 201 });

      } catch (aiError) {
        console.error('AI generation error:', aiError);
        return NextResponse.json({ 
          userMessage,
          aiMessage: null,
          error: 'Failed to generate AI response'
        }, { status: 201 });
      }
    }

    return NextResponse.json({ userMessage }, { status: 201 });

  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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