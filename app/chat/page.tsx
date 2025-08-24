/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import fetchWithAuth from '@/lib/fetchWithAuth';

export default function ChatRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const fetchConversationsAndRedirect = async () => {
        try {
          const response = await fetchWithAuth('/api/conversations');
          if (response.ok) {
            const data = await response.json();
            if (data.conversations && data.conversations.length > 0) {
              router.push(`/chat/${data.conversations[0].id}`);
            } else {
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
                router.push('/chat/new-error');
              }
            }
          } else {
            router.push('/chat/new');
          }
        } catch (error) {
          router.push('/chat/new');
        }
      };
      fetchConversationsAndRedirect();
    } else if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0c29] p-4">
      <div className="text-center max-w-md w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7950f2] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-indigo-100 mb-2">Redirecting...</h2>
        <p className="text-indigo-300">Please wait...</p>
      </div>
    </div>
  );
}