import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { auth } from '@/lib/firebase'; // Import Firebase auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut, // Alias to avoid conflict with custom signOut
  GoogleAuthProvider, // Import GoogleAuthProvider
  signInWithPopup, // Import signInWithPopup
  onAuthStateChanged,
  User as FirebaseUser, // Alias Firebase User type
} from 'firebase/auth';
import fetchWithAuth from '@/lib/fetchWithAuth'; // Import fetchWithAuth

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  firebaseUid?: string; // Add firebaseUid to our User interface
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    console.log('[useAuth] useEffect triggered. Current user:', user, 'loading:', loading);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[useAuth] onAuthStateChanged triggered. firebaseUser:', firebaseUser ? '[present]' : '[not present]');
      if (firebaseUser) {
        // Firebase user is logged in, now fetch/sync with our backend
        try {
          const response = await fetchWithAuth('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${await firebaseUser.getIdToken()}`, // Send Firebase ID token
            },
          });
          console.log('[useAuth] Backend /api/auth/me response (Firebase user):', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('[useAuth] Backend user data (Firebase user):', data.user);
            setUser(data.user);
          } else {
            // User exists in Firebase but not in our DB, or token invalid
            console.error('[useAuth] Failed to fetch user from backend (Firebase user):', response.statusText);
            setUser(null);
            // Optionally, sign out from Firebase if backend sync fails
            // firebaseSignOut(auth); // Removed to prevent loop
          }
        } catch (error) {
          console.error('[useAuth] Error fetching user from backend (Firebase user):', error);
          setUser(null); // Ensure user is null on fetch error

          // logout(); // Removed to prevent loop
        } finally {
          setLoading(false);
        }
      } else {
        // No Firebase user, check for custom session
        try {
          const response = await fetchWithAuth('/api/auth/me');
          console.log('[useAuth] Backend /api/auth/me response (custom session):', response.status);
          if (response.ok) {
            const data = await response.json();
            console.log('[useAuth] Backend user data (custom session):', data.user);
            setUser(data.user);
          } else {
            console.error('[useAuth] Failed to fetch user from backend (custom session):', response.statusText);
            setUser(null);
          }
        } catch (error) {
          console.error('[useAuth] Error checking custom auth (custom session):', error);
          setUser(null); // Ensure user is null on fetch error
          // logout(); // Removed to prevent loop
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Try Firebase login first
      const firebaseCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = firebaseCredential.user;

      // If Firebase login successful, sync with backend
      const response = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await firebaseUser.getIdToken()}`, // Send Firebase ID token
        },
        body: JSON.stringify({ email, password, firebaseUid: firebaseUser.uid }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        router.push('/chat'); // Redirect after successful login
        return { success: true, user: data.user };
      } else {
        // Firebase login successful, but backend sync failed.
        // This might happen if the user exists in Firebase but not in our DB.
        // We should still consider them logged in via Firebase, but warn/handle.
        console.warn('Firebase login successful, but backend sync failed:', data.error);
        const tempUser = {
          id: firebaseUser.uid, // Use Firebase UID as ID for now
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || 'User', // Use Firebase display name if available
          firebaseUid: firebaseUser.uid,
        };
        setUser(tempUser);
        router.push('/chat'); // Redirect even if backend sync fails but Firebase login is successful
        return { success: true, user: tempUser }; // Still consider successful for client-side Firebase auth
      }
    } catch (firebaseError: any) {
      console.error('Firebase login failed:', firebaseError.code, firebaseError.message);
      // If Firebase login fails, try custom API login
      const response = await fetchWithAuth('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        router.push('/chat'); // Redirect after successful custom login
        return { success: true, user: data.user };
      } else {
        setUser(null);
        return { success: false, error: data.error || firebaseError.message };
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    try {
      // Try Firebase registration first
      const firebaseCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = firebaseCredential.user;

      // If Firebase registration successful, save user details to our backend
      const response = await fetchWithAuth('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password, // Password might not be needed by backend if Firebase handles it
          fullName,
          firebaseUid: firebaseUser.uid,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        router.push('/chat'); // Redirect after successful registration
        return { success: true };
      } else {
        // Firebase registration successful, but backend sync failed.
        // This is a critical error, as user exists in Firebase but not our DB.
        // Consider rolling back Firebase registration or logging error.
        console.error('Firebase registration successful, but backend sync failed:', data.error);
        // Optionally, sign out from Firebase if backend sync fails
        firebaseSignOut(auth);
        setUser(null);
        return { success: false, error: data.error || 'Backend registration failed after Firebase success.' };
      }
    } catch (firebaseError: any) {
      console.error('Firebase registration failed:', firebaseError.code, firebaseError.message);
      // If Firebase registration fails, try custom API registration
      const response = await fetchWithAuth('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        router.push('/chat'); // Redirect after successful custom registration
        return { success: true };
      } else {
        setUser(null);
        return { success: false, error: data.error || firebaseError.message };
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // If Google sign-in successful, sync user details to our backend
      const response = await fetchWithAuth('/api/auth/register', { // Use register endpoint for sync
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          firebaseUid: firebaseUser.uid,
          // No password needed for Google sign-in
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        router.push('/chat'); // Redirect after successful Google sign-in
        return { success: true };
      } else {
        console.error('Google sign-in successful, but backend sync failed:', data.error);
        // If backend sync fails, we might still consider them logged in via Firebase
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          fullName: firebaseUser.displayName || 'User',
          firebaseUid: firebaseUser.uid,
        });
        router.push('/chat'); // Redirect even if backend sync fails but Google sign-in is successful
        return { success: true, error: data.error || 'Backend sync failed after Google sign-in.' };
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error.code, error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Try Firebase logout
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Firebase logout error:', error);
    }

    try {
      // Also call custom backend logout (use fetchWithAuth, but skip auth refresh for logout)
      await fetchWithAuth('/api/auth/logout', { method: 'POST', skipAuthRefresh: true });
    } catch (error) {
      console.error('Custom backend logout error:', error);
    }
    finally {
      setUser(null);
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    signInWithGoogle, // Add signInWithGoogle to returned object
  };
};