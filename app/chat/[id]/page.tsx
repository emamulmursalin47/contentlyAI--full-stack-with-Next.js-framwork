'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useConversations';
import { LLMModel, SocialPlatform } from '@/lib/groq';
import fetchWithAuth from '@/lib/fetchWithAuth';
import { Conversation, Message } from '@/lib/types';

interface RawMessage {
  _id?: string;
  id?: string;
  role: string;
  content: string;
  created_at?: string;
  createdAt?: string;
  isThinking?: boolean;
}

const LLM_MODELS = [
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Fast)', description: 'Quick responses, great for most tasks' },
  { value: 'openai/gpt-oss-120b', label: 'openai/gpt-oss-120b', description: 'Excellent for creative writing' },
  { value: 'qwen/qwen3-32b', label: 'qwen/qwen3-32b', description: 'Balanced performance and speed' },
  { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill Llama 70B', description: 'Optimized for complex tasks' },
] as const;

const SOCIAL_PLATFORMS = [
  { value: 'general', label: 'General Content', description: 'Universal social media content' },
  { value: 'twitter', label: 'Twitter/X', description: 'Short, engaging tweets with hashtags' },
  { value: 'linkedin', label: 'LinkedIn', description: 'Professional networking content' },
  { value: 'instagram', label: 'Instagram', description: 'Visual-first content with hashtags' },
  { value: 'facebook', label: 'Facebook', description: 'Community-focused posts' },
  { value: 'tiktok', label: 'TikTok', description: 'Trendy, short-form video content' },
  { value: 'youtube', label: 'YouTube Shorts', description: 'Vertical video descriptions' },
] as const;



export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { 
    conversations, 
    loading: conversationsLoading, 
    createConversation, 
    deleteConversation, 
    renameConversation 
  } = useConversations();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = params.id as string;

  const loadConversation = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data.conversation);
        setMessages(data.messages.map((msg: RawMessage) => {
          const dateString = msg.created_at || msg.createdAt;
          const parsedMessageCreatedAt = dateString ? new Date(dateString) : new Date();
          return {
            ...msg,
            createdAt: isNaN(parsedMessageCreatedAt.getTime()) ? new Date() : parsedMessageCreatedAt,
          };
        }));
      } else if (response.status === 404) {
        // Conversation not found, redirect to main chat page
        router.push('/chat');
      } else {
        router.push('/chat');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      router.push('/chat');
    }
  }, [conversationId, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      if (conversationId) {
        loadConversation();
      }
    }
  }, [user, authLoading, conversationId, loadConversation, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isStreaming]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      // If we're deleting the current conversation, navigate away first
      if (id === conversationId) {
        // Find another conversation to navigate to
        const otherConversation = conversations.find(c => c.id !== id);
        if (otherConversation) {
          // Navigate to another conversation
          router.push(`/chat/${otherConversation.id}`);
        } else {
          // No other conversations, go to main chat page which will create a new one
          router.push('/chat');
        }
      }
      
      // Delete the conversation (optimistic update will handle UI immediately)
      await deleteConversation(id);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [conversationId, conversations, router, deleteConversation]);

  const createNewConversation = async () => {
    try {
      const newConversation = await createConversation({ 
        title: 'New Conversation', 
        llmModel: 'llama-3.1-8b-instant', 
        targetPlatform: 'general' 
      });
      if (newConversation) {
        // Navigate to the new conversation
        router.push(`/chat/${newConversation.id}`);
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation) return;
    setIsLoading(true);
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content, createdAt: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);
    const assistantMessageId = 'thinking-' + Date.now().toString();
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', createdAt: new Date(), isThinking: true }]);

    try {
      const response = await fetchWithAuth(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, role: 'user', model: currentConversation.llmModel, platform: currentConversation.targetPlatform }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      if (data.aiMessage) {
        setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, id: data.aiMessage._id, content: data.aiMessage.content, createdAt: new Date(data.aiMessage.createdAt), isThinking: false } : msg));
      }
      setIsThinking(false);
      // Only reload conversation if we need to update the conversation metadata
      // Messages are already updated optimistically above
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id && msg.id !== assistantMessageId));
      setIsThinking(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, conversationId]);

  const handleSettingsSave = async (model: LLMModel, platform: SocialPlatform) => {
    if (!currentConversation) return;
    try {
      const response = await fetchWithAuth(`/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ llmModel: model, targetPlatform: platform }),
      });
      if (response.ok) {
        const result = await response.json();
        // Update current conversation state directly instead of reloading
        setCurrentConversation(result.conversation);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  if (authLoading || conversationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0c29] p-4">
        <div className="text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7950f2] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-indigo-100 mb-2">Loading your workspace</h2>
          <p className="text-indigo-300">Please wait while we set things up...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="flex h-screen bg-[#0f0c29] overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        currentConversationId={conversationId}
        user={user}
        onNewConversation={createNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={renameConversation}
      />
      
      <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
        <header className="bg-[#1a1633] border-b border-indigo-700/30 px-4 py-3 sm:px-6 sm:py-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-md p-2 text-indigo-300 hover:bg-[#302b63]/50 hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold text-indigo-100 truncate">
                  {currentConversation?.title || 'Loading...'}
                </h1>
                {currentConversation && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <p className="text-xs sm:text-sm text-indigo-300 truncate">
                      {currentConversation.targetPlatform} • {currentConversation.llmModel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={currentConversation.llmModel}
                        onChange={(e) => handleSettingsSave(e.target.value as LLMModel, currentConversation.targetPlatform as SocialPlatform)}
                        className="block pl-3 pr-10 py-1.5 text-xs sm:text-sm border border-indigo-700/50 bg-[#302b63]/50 text-indigo-100 rounded-lg focus:ring-[#7950f2] focus:border-[#7950f2] shadow-sm w-full sm:w-auto"
                      >
                        {LLM_MODELS.map((model) => (
                          <option key={model.value} value={model.value} className="bg-[#1a1633]">
                            {model.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={currentConversation.targetPlatform}
                        onChange={(e) => handleSettingsSave(currentConversation.llmModel as LLMModel, e.target.value as SocialPlatform)}
                        className="block pl-3 pr-10 py-1.5 text-xs sm:text-sm border border-indigo-700/50 bg-[#302b63]/50 text-indigo-100 rounded-lg focus:ring-[#7950f2] focus:border-[#7950f2] shadow-sm w-full sm:w-auto"
                      >
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <option key={platform.value} value={platform.value} className="bg-[#1a1633]">
                            {platform.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto bg-[#0f0c29] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-indigo-600/30 hover:scrollbar-thumb-indigo-500/50"
             style={{ scrollbarWidth: 'thin' }}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-md w-full">
                <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-100 mb-2">
                  Welcome to ContentAI Pro
                </h2>
                <p className="text-indigo-300 mb-4 sm:mb-6">
                  Start creating engaging social media content with AI assistance.
                </p>
                <div className="bg-[#302b63]/30 rounded-lg p-4 text-left">
                  <h3 className="font-medium text-indigo-200 mb-2 text-sm sm:text-base">Try asking:</h3>
                  <ul className="text-xs sm:text-sm text-indigo-300 space-y-1">
                    <li>• &quot;Create a Twitter thread about productivity tips&quot;</li>
                    <li>• &quot;Write a LinkedIn post about recent industry trends&quot;</li>
                    <li>• &quot;Generate Instagram captions for travel photos&quot;</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        <div className="bg-[#0f0c29]">
          <ChatInput
            onSendMessage={sendMessage}
            isLoading={isLoading || isThinking}
            disabled={isStreaming}
            placeholder="Describe the content you want to create..."
          />
        </div>
      </div>
    </div>
  );
}