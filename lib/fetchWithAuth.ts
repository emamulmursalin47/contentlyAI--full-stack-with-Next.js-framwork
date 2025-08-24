import { auth } from '@/lib/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

interface FetchOptions extends RequestInit {
  skipAuthRefresh?: boolean;
  retryCount?: number;
}

const MAX_RETRIES = 1;

const fetchWithAuth = async (url: string, options: FetchOptions = {}): Promise<Response> => {
  const { skipAuthRefresh, retryCount = 0, ...fetchOptions } = options;

  // Ensure credentials are included for all requests to send cookies
  const optionsWithCreds: RequestInit = {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      ...fetchOptions.headers,
    },
  };

  const response = await fetch(url, optionsWithCreds);

  // If 401 and not the refresh endpoint itself, try to refresh token
  if (response.status === 401 && 
      !skipAuthRefresh && 
      url !== '/api/auth/refresh' && 
      retryCount < MAX_RETRIES) {
    
    console.log('[fetchWithAuth] Attempting token refresh...');
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (refreshResponse.ok) {
      console.log('[fetchWithAuth] Token refreshed successfully. Retrying original request...');
      // Retry the original request with new cookies
      return fetchWithAuth(url, {
        ...options,
        skipAuthRefresh: true,
        retryCount: retryCount + 1,
      });
    } else {
      console.error('[fetchWithAuth] Failed to refresh token. Logging out...');
      // Clear local tokens and redirect to login
      if (typeof window !== 'undefined') {
        await firebaseSignOut(auth);
        // window.location.href = '/login'; // Temporarily disabled for debugging
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
};

export default fetchWithAuth;