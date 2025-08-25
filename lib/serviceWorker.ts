// Service Worker registration and management
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered successfully:', registration);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available
            console.log('New service worker available');
            
            // Optionally notify user about update
            if (window.confirm('A new version is available. Reload to update?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      }
    });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('Service worker updated');
      }
    });

  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
};

// Unregister service worker (for development/testing)
export const unregisterServiceWorker = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    console.log('Service workers unregistered');
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
  }
};

// Optimize for back/forward cache
export const optimizeForBFCache = (): void => {
  if (typeof window === 'undefined') return;

  // Prevent common issues that break back/forward cache
  
  // 1. Clean up event listeners on page hide
  const cleanupListeners = () => {
    // Remove any global event listeners that might prevent BF cache
    window.removeEventListener('beforeunload', cleanupListeners);
    window.removeEventListener('pagehide', cleanupListeners);
  };

  // 2. Handle page visibility changes
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Clean up any ongoing operations
      // Close WebSocket connections, cancel fetch requests, etc.
    }
  };

  // 3. Handle page show/hide events
  const handlePageShow = (event: PageTransitionEvent) => {
    if (event.persisted) {
      // Page was restored from back/forward cache
      console.log('Page restored from BF cache');
      
      // Refresh any stale data
      window.dispatchEvent(new CustomEvent('bfcache-restore'));
    }
  };

  const handlePageHide = (event: PageTransitionEvent) => {
    if (event.persisted) {
      // Page is being stored in back/forward cache
      console.log('Page stored in BF cache');
    }
  };

  // Add event listeners
  window.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pageshow', handlePageShow);
  window.addEventListener('pagehide', handlePageHide);
  window.addEventListener('beforeunload', cleanupListeners);

  // Cleanup function
  return () => {
    window.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pageshow', handlePageShow);
    window.removeEventListener('pagehide', handlePageHide);
    window.removeEventListener('beforeunload', cleanupListeners);
  };
};
