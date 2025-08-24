'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import fetchWithAuth from '@/lib/fetchWithAuth'; // Import fetchWithAuth

export default function ChatRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth(); // Get user and loading from useAuth

  useEffect(() => {
    if (!loading && user) { // Ensure user is loaded and authenticated
      const fetchConversationsAndRedirect = async () => {
        try {
          const response = await fetchWithAuth('/api/conversations');
          if (response.ok) {
            const data = await response.json();
            if (data.conversations && data.conversations.length > 0) {
              // Redirect to the most recent conversation
              router.push(`/chat/${data.conversations[0].id}`);
            } else {
              // No conversations, create a new one and redirect
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
                console.error('Failed to create new conversation:', createResponse.statusText);
                // Fallback if new conversation creation fails
                router.push('/chat/new-error'); // Or a more appropriate error page
              }
            }
          } else {
            console.error('Failed to fetch conversations:', response.statusText);
            // Fallback to new chat if fetching conversations fails
            router.push('/chat/new');
          }
        } catch (error) {
          console.error('Error fetching conversations:', error);
          // Fallback to new chat if an error occurs
          router.push('/chat/new');
        }
      };

      fetchConversationsAndRedirect();
    } else if (!loading && !user) {
      // If not loading and no user, redirect to login page
      router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Redirecting...</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}