import { createContext, useContext, useEffect, useState } from 'react';
import { Clerk } from '@clerk/clerk-js';

interface ClerkContextType {
  clerk: Clerk | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: any | null;
  signOut: () => Promise<void>;
}

const ClerkContext = createContext<ClerkContextType>({
  clerk: null,
  isLoaded: false,
  isSignedIn: false,
  user: null,
  signOut: async () => {},
});

const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXRlcm5hbC1waWdsZXQtNDIuY2xlcmsuYWNjb3VudHMuZGV2JA';

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const [clerk, setClerk] = useState<Clerk | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Initialize the Clerk instance
    const clerkInstance = new Clerk(CLERK_PUBLISHABLE_KEY);
    
    clerkInstance
      .load()
      .then(() => {
        setClerk(clerkInstance);
        setIsLoaded(true);
        setIsSignedIn(!!clerkInstance.session);
        setUser(clerkInstance.user);

        // Listen for session/user transitions to update context states reactively
        clerkInstance.addListener((resources) => {
          setIsSignedIn(!!resources.session);
          setUser(resources.user);
        });
      })
      .catch((err) => {
        console.error('Failed to load Clerk JS SDK:', err);
        setIsLoaded(true);
      });
  }, []);

  const signOut = async () => {
    if (clerk) {
      await clerk.signOut();
    }
  };

  return (
    <ClerkContext.Provider value={{ clerk, isLoaded, isSignedIn, user, signOut }}>
      {children}
    </ClerkContext.Provider>
  );
}

export function useClerkContext() {
  return useContext(ClerkContext);
}
