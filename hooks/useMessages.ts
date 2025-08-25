import { useState, useEffect, useCallback } from 'react';
import fetchWithAuth from '@/lib/fetchWithAuth';
import { Message, MessageResponse } from '@/lib/types';

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
    if (!conversationId || typeof conversationId !== 'string') {
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      const response = await fetchWithAuth(`/api/conversations/${conversationId}/messages`);
      
      if (response.ok) {
        const data = await response.json();
        const parsedMessages = (data.messages || []).map((msg: any) => {
          const dateString = msg.createdAt || msg.created_at;
          return {
            ...msg,
            createdAt: dateString ? new Date(dateString) : new Date(),
            conversationId: conversationId
          };
        });
        setMessages(parsedMessages);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch messages' }));
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setMessages([]); // Reset messages on error
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (
    content: string, 
    options: { model?: string; platform?: string } = {}
  ) => {
    if (!content || typeof content !== 'string' || !content.trim() || !conversationId) {
      setError('Message content is required');
      return;
    }

    const trimmedContent = content.trim();
    const tempId = `temp-${Date.now()}`;
    const optimisticUserMessage: Message = {
      id: tempId,
      conversationId,
      role: 'user',
      content: trimmedContent,
      createdAt: new Date(),
      isOptimistic: true
    };

    // Add optimistic user message
    setMessages(prev => [...prev, optimisticUserMessage]);
    setIsGenerating(true);
    setError(null);

    // Add thinking indicator for AI response
    const thinkingId = `thinking-${Date.now()}`;
    const thinkingMessage: Message = {
      id: thinkingId,
      conversationId,
      role: 'assistant',
      content: '',
      createdAt: new Date(),
      isThinking: true,
      isOptimistic: true
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      const response = await fetchWithAuth(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmedContent,
          role: 'user',
          model: options.model || 'llama-3.1-8b-instant',
          platform: options.platform || 'general'
        }),
      });

      if (response.ok) {
        const data: MessageResponse = await response.json();
        
        // Remove optimistic messages and add real ones
        setMessages(prev => {
          const filtered = prev.filter(msg => 
            msg.id !== tempId && msg.id !== thinkingId
          );
          
          const newMessages: Message[] = [];
          if (data.userMessage) {
            newMessages.push({
              ...data.userMessage,
              createdAt: data.userMessage.createdAt ? new Date(data.userMessage.createdAt) : new Date(),
              conversationId
            });
          }
          if (data.aiMessage) {
            newMessages.push({
              ...data.aiMessage,
              createdAt: data.aiMessage.createdAt ? new Date(data.aiMessage.createdAt) : new Date(),
              conversationId
            });
          }
          
          return [...filtered, ...newMessages];
        });

        // Handle AI generation error but successful user message save
        if (data.error && !data.aiMessage) {
          setError(`AI Response: ${data.error}`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to send message' }));
        throw new Error(errorData.error || 'Failed to send message');
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

  // Reset state when conversation changes
  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setLoading(true);
      setError(null);
      setIsGenerating(false);
      fetchMessages();
    } else {
      setMessages([]);
      setLoading(false);
      setError(null);
      setIsGenerating(false);
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
