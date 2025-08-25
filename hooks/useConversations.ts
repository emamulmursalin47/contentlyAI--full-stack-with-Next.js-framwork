import { useState, useEffect, useCallback } from 'react';
import fetchWithAuth from '@/lib/fetchWithAuth';

interface Conversation {
  id: string;
  title: string;
  targetPlatform: string;
  llmModel: string;
  updatedAt: string;
  createdAt: string;
}

interface UseConversationsResult {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createConversation: (data: { title: string; targetPlatform?: string; llmModel?: string }) => Promise<Conversation | null>;
}

export const useConversations = (): UseConversationsResult => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchWithAuth('/api/conversations');
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (data: { 
    title: string; 
    targetPlatform?: string; 
    llmModel?: string 
  }): Promise<Conversation | null> => {
    try {
      const response = await fetchWithAuth('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          targetPlatform: data.targetPlatform || 'general',
          llmModel: data.llmModel || 'llama-3.1-8b-instant'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newConversation = result.conversation;
        
        // Optimistically update the list
        setConversations(prev => [newConversation, ...prev]);
        
        return newConversation;
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    error,
    refetch,
    createConversation
  };
};
