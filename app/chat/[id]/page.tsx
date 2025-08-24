/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { useAuth } from '@/hooks/useAuth';
import { LLMModel, SocialPlatform } from '@/lib/groq';
import fetchWithAuth from '@/lib/fetchWithAuth';

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

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
  isThinking?: boolean;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  targetPlatform: string;
  llmModel: string;
  updated_at: Date;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationId = params.id as string;

  const loadConversations = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations.map((conv: Conversation) => {
          const parsedDate = new Date(conv.updated_at);
          return {
            ...conv,
            updated_at: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
          };
        }));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  const loadConversation = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        const parsedConversationUpdatedAt = new Date(data.conversation.updated_at);
        setCurrentConversation({
          ...data.conversation,
          updated_at: isNaN(parsedConversationUpdatedAt.getTime()) ? new Date() : parsedConversationUpdatedAt,
        });
        setMessages(data.messages.map((msg: Message) => {
          const parsedMessageCreatedAt = new Date(msg.created_at);
          return {
            ...msg,
            created_at: isNaN(parsedMessageCreatedAt.getTime()) ? new Date() : parsedMessageCreatedAt,
          };
        }));
      } else {
        router.push('/chat');
      }
    } catch (error) {
      router.push('/chat');
    }
  }, [conversationId, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadConversations();
      if (conversationId) {
        loadConversation();
      }
    }
  }, [user, authLoading, conversationId, loadConversation, loadConversations, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isStreaming]);

  const createNewConversation = async () => {
    try {
      const response = await fetchWithAuth('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation', targetPlatform: 'general', llmModel: 'llama-3.1-8b-instant' }),
      });
      if (response.ok) {
        const data = await response.json();
        await loadConversations();
        router.push(`/chat/${data.conversation.id}`);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetchWithAuth(`/api/conversations/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await loadConversations();
        if (id === conversationId) router.push('/chat');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const renameConversation = async (id: string, title: string) => {
    try {
      const response = await fetchWithAuth(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (response.ok) {
        await loadConversations();
        if (id === conversationId) await loadConversation();
      }
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation) return;
    setIsLoading(true);
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content, created_at: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsThinking(true);
    const assistantMessageId = 'thinking-' + Date.now().toString();
    setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '', created_at: new Date(), isThinking: true }]);

    try {
      const response = await fetchWithAuth(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, role: 'user', model: currentConversation.llmModel, platform: currentConversation.targetPlatform }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      const data = await response.json();
      if (data.aiMessage) {
        setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? { ...msg, id: data.aiMessage._id, content: data.aiMessage.content, created_at: new Date(data.aiMessage.createdAt), isThinking: false } : msg));
      }
      setIsThinking(false);
      await loadConversation();
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id && msg.id !== assistantMessageId));
      setIsThinking(false);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, conversationId, loadConversation]);

  const handleSettingsSave = async (model: LLMModel, platform: SocialPlatform) => {
    if (!currentConversation) return;
    try {
      const response = await fetchWithAuth(`/api/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ llmModel: model, targetPlatform: platform }),
      });
      if (response.ok) {
        await loadConversation();
        await loadConversations();
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  if (authLoading) {
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
        onDeleteConversation={deleteConversation}
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
        
        <div className="flex-1 overflow-y-auto bg-[#0f0c29]">
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