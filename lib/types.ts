export interface Conversation {
  id: string;
  title: string;
  targetPlatform: string;
  llmModel: string;
  updatedAt: Date;
  createdAt: Date;
  userId?: string;
}

export interface Message {
  id: string;
  conversationId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  isThinking?: boolean;
  isStreaming?: boolean;
  isOptimistic?: boolean;
  thinkingContent?: string;
  metadata?: {
    platform?: string;
    model?: string;
    characterCount?: number;
    hashtags?: number;
    emojis?: number;
    optimizationScore?: number;
  };
}

export interface MessageAnalytics {
  characterCount: number;
  hashtags: number;
  emojis: number;
  platformSuitability: {
    suitable: boolean;
    issues: string[];
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MessageResponse {
  userMessage?: Message;
  aiMessage?: Message;
  analytics?: MessageAnalytics;
  error?: string;
}
