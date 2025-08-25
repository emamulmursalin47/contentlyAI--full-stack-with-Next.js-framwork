import { useState, useEffect, useCallback } from 'react';
import fetchWithAuth from '@/lib/fetchWithAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinkingContent?: string;
  created_at: Date;
  isOptimistic?: boolean;
  isThinking?: boolean;
}

interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, options?: { model?: string; platform?: string }) => Promise<void>;
  isGenerating: boolean;
}

export const useMessages = (conversationId: string): UseMessagesResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setError(null);
      const response = await fetchWithAuth(`/api/conversations/${conversationId}/messages`);
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (
    content: string, 
    options: { model?: string; platform?: string } = {}
  ) => {
    if (!content.trim() || !conversationId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticUserMessage: Message = {
      id: tempId,
      role: 'user',
      content: content.trim(),
      created_at: new Date(),
      isOptimistic: true
    };

    // Add optimistic user message
    setMessages(prev => [...prev, optimisticUserMessage]);
    setIsGenerating(true);

    // Add thinking indicator for AI response
    const thinkingId = `thinking-${Date.now()}`;
    const thinkingMessage: Message = {
      id: thinkingId,
      role: 'assistant',
      content: '',
      created_at: new Date(),
      isThinking: true,
      isOptimistic: true
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await fetchWithAuth(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          role: 'user',
          model: options.model || 'llama-3.1-8b-instant',
          platform: options.platform || 'general'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Remove optimistic messages and add real ones
        setMessages(prev => {
          const filtered = prev.filter(msg => 
            msg.id !== tempId && msg.id !== thinkingId
          );
          
          const newMessages = [];
          if (data.userMessage) {
            newMessages.push({
              ...data.userMessage,
              created_at: new Date(data.userMessage.createdAt || data.userMessage.created_at)
            });
          }
          if (data.aiMessage) {
            newMessages.push({
              ...data.aiMessage,
              created_at: new Date(data.aiMessage.createdAt || data.aiMessage.created_at)
            });
          }
          
          return [...filtered, ...newMessages];
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Remove optimistic messages on error
      setMessages(prev => prev.filter(msg => 
        msg.id !== tempId && msg.id !== thinkingId
      ));
      
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsGenerating(false);
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setLoading(true);
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    isGenerating
  };
};
