// ChipGPT OAuth Hook - Drop-in replacement for Supabase auth
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface ChipGPTUser {
  id: string;
  email: string;
  name: string;
  role: string;
  agents: string[];
}

export interface UseChipGPTAuthReturn {
  user: ChipGPTUser | null;
  session: any;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasAgentAccess: (agentName: string) => boolean;
}

export function useChipGPTAuth(): UseChipGPTAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(status === 'loading');
  }, [status]);

  const handleSignIn = async () => {
    try {
      const result = await signIn('chipgpt', {
        callbackUrl: '/dashboard',
        redirect: true,
      });
      
      if (result?.error) {
        console.error('Sign in error:', result.error);
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true,
      });
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const hasAgentAccess = (agentName: string): boolean => {
    if (!session?.user?.agents) return false;
    return session.user.agents.includes(agentName) || session.user.role === 'admin';
  };

  return {
    user: session?.user as ChipGPTUser || null,
    session,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!session?.user,
    hasAgentAccess,
  };
}

// Migration helper to replace useSupabaseAuth
export function useAuth() {
  return useChipGPTAuth();
}