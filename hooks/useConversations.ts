import { useState, useEffect, useCallback, useRef } from 'react';
import fetchWithAuth from '@/lib/fetchWithAuth';
import { Conversation, ConversationsResponse } from '@/lib/types';

interface UseConversationsResult {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createConversation: (data: { title: string; targetPlatform?: string; llmModel?: string }) => Promise<Conversation | null>;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

export const useConversations = (): UseConversationsResult => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const fetchConversations = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchingRef.current) {
      return;
    }
    
    fetchingRef.current = true;
    
    try {
      setError(null);
      const response = await fetchWithAuth('/api/conversations');
      
      if (response.ok) {
        const data: ConversationsResponse = await response.json();
        const parsedConversations = data.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
        }));
        setConversations(parsedConversations || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch conversations' }));
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConversations([]); // Reset conversations on error
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  const createConversation = useCallback(async (data: { 
    title: string; 
    targetPlatform?: string; 
    llmModel?: string 
  }): Promise<Conversation | null> => {
    try {
      setError(null);
      
      // Validate input
      if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
        throw new Error('Title is required and must be a non-empty string');
      }

      const response = await fetchWithAuth('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title.trim(),
          targetPlatform: data.targetPlatform || 'general',
          llmModel: data.llmModel || 'llama-3.1-8b-instant'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newConversation: Conversation = {
          ...result.conversation,
          createdAt: new Date(result.conversation.createdAt),
          updatedAt: new Date(result.conversation.updatedAt),
        };
        
        // Add to the beginning of the list (most recent first)
        setConversations(prev => [newConversation, ...prev]);
        
        return newConversation;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create conversation' }));
        throw new Error(errorData.error || 'Failed to create conversation');
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      return null;
    }
  }, []);

  const renameConversation = useCallback(async (id: string, title: string) => {
    if (!id || typeof id !== 'string') {
      setError('Invalid conversation ID');
      return;
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      setError('Title is required and must be a non-empty string');
      return;
    }

    const originalConversations = [...conversations];
    
    // Optimistic update
    setConversations(prev => 
      prev.map(c => c.id === id ? { ...c, title: title.trim(), updatedAt: new Date() } : c)
    );

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/conversations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to rename conversation' }));
        throw new Error(errorData.error || 'Failed to rename conversation');
      }

      // Update with server response
      const result = await response.json();
      setConversations(prev => 
        prev.map(c => c.id === id ? {
          ...result.conversation,
          createdAt: new Date(result.conversation.createdAt),
          updatedAt: new Date(result.conversation.updatedAt)
        } : c)
      );
    } catch (err) {
      console.error('Error renaming conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename conversation');
      // Revert optimistic update on error
      setConversations(originalConversations);
    }
  }, [conversations]);

  const deleteConversation = useCallback(async (id: string) => {
    if (!id || typeof id !== 'string') {
      setError('Invalid conversation ID');
      return;
    }

    const originalConversations = [...conversations];

    // Optimistic update - remove immediately
    setConversations(prev => prev.filter(c => c.id !== id));

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/conversations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete conversation' }));
        throw new Error(errorData.error || 'Failed to delete conversation');
      }

      // Success - the optimistic update is already applied
      console.log('Conversation deleted successfully');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
      // Revert optimistic update on error
      setConversations(originalConversations);
    }
  }, [conversations]);

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
    createConversation,
    renameConversation,
    deleteConversation
  };
};
