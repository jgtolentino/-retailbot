import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import { createChipGPTProvider } from '@/lib/auth/chipgpt-oauth';

export const authOptions: NextAuthOptions = {
  providers: [
    createChipGPTProvider(),
  ],
  
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account && profile) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          user: {
            id: profile.sub || profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role || 'user',
            agents: profile.agents || [],
          },
        };
      }

      // Return previous token if not expired
      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Token has expired, try to refresh
      try {
        const response = await fetch(`${process.env.CHIPGPT_MCP_URL}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken as string,
            client_id: process.env.CHIPGPT_CLIENT_ID!,
            client_secret: process.env.CHIPGPT_CLIENT_SECRET!,
          }),
        });

        const refreshedTokens = await response.json();

        if (!response.ok) {
          throw refreshedTokens;
        }

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
        };
      } catch (error) {
        console.error('Error refreshing access token', error);
        return { ...token, error: 'RefreshAccessTokenError' };
      }
    },
    
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = token.user as any;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);