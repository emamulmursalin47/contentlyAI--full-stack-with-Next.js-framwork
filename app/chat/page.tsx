'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import fetchWithAuth from '@/lib/fetchWithAuth';

interface ConversationData {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  targetPlatform: string;
  llmModel: string;
}

interface ConversationsResponse {
  conversations: ConversationData[];
}

export default function ChatRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user && !isProcessing) {
      const fetchConversationsAndRedirect = async () => {
        setIsProcessing(true);
        setError(null);
        
        try {
          const response = await fetchWithAuth('/api/conversations');
          if (response.ok) {
            const data: ConversationsResponse = await response.json();
            if (data.conversations && data.conversations.length > 0) {
              // Navigate to the most recently updated conversation
              const sortedConversations = data.conversations.sort((a: ConversationData, b: ConversationData) => 
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
              );
              router.push(`/chat/${sortedConversations[0].id}`);
            } else {
              // No conversations exist, create a new one
              const createResponse = await fetchWithAuth('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: 'New Conversation',
                  targetPlatform: 'general',
                  llmModel: 'llama-3.1-8b-instant'
                }),
              });
              if (createResponse.ok) {
                const createData = await createResponse.json();
                router.push(`/chat/${createData.conversation.id}`);
              } else {
                const errorData = await createResponse.json().catch(() => ({ error: 'Failed to create conversation' }));
                throw new Error(errorData.error || 'Failed to create new conversation');
              }
            }
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Failed to fetch conversations' }));
            throw new Error(errorData.error || 'Failed to fetch conversations');
          }
        } catch (error) {
          console.error('Error in fetchConversationsAndRedirect:', error);
          setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
          setIsProcessing(false);
        }
      };
      
      fetchConversationsAndRedirect();
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, isProcessing]);

  if (!loading && !user) {
    return null; // Will redirect to login
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0c29] p-4">
        <div className="text-center max-w-md w-full">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#7950f2] text-white rounded-lg hover:bg-[#6a40e1] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0c29] p-4">
      <div className="text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7950f2] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-indigo-100 mb-2">
          {loading ? 'Loading...' : 'Setting up your workspace...'}
        </h2>
        <p className="text-indigo-300">Please wait...</p>
      </div>
    </div>
  );
}
