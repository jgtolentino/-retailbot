// ChipGPT OAuth2 Integration for Scout Dashboard
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export interface ChipGPTProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  agents: string[];
}

export interface ChipGPTToken extends JWT {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: ChipGPTProfile;
}

export const CHIPGPT_OAUTH_CONFIG = {
  clientId: process.env.CHIPGPT_CLIENT_ID!,
  clientSecret: process.env.CHIPGPT_CLIENT_SECRET!,
  authorizationUrl: `${process.env.CHIPGPT_MCP_URL}/oauth/authorize`,
  tokenUrl: `${process.env.CHIPGPT_MCP_URL}/oauth/token`,
  userInfoUrl: `${process.env.CHIPGPT_MCP_URL}/oauth/userinfo`,
  scopes: ['read', 'write', 'agents:execute'],
};

export function createChipGPTProvider() {
  return {
    id: 'chipgpt',
    name: 'ChipGPT OAuth',
    type: 'oauth' as const,
    version: '2.0',
    authorization: {
      url: CHIPGPT_OAUTH_CONFIG.authorizationUrl,
      params: {
        scope: CHIPGPT_OAUTH_CONFIG.scopes.join(' '),
        grant_type: 'authorization_code',
      },
    },
    token: {
      url: CHIPGPT_OAUTH_CONFIG.tokenUrl,
      async request(context: any) {
        const response = await fetch(CHIPGPT_OAUTH_CONFIG.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${CHIPGPT_OAUTH_CONFIG.clientId}:${CHIPGPT_OAUTH_CONFIG.clientSecret}`
            ).toString('base64')}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: context.params.code!,
            redirect_uri: context.provider.callbackUrl,
          }),
        });

        const tokens = await response.json();
        return { tokens };
      },
    },
    userinfo: {
      url: CHIPGPT_OAUTH_CONFIG.userInfoUrl,
      async request(context: any) {
        const response = await fetch(CHIPGPT_OAUTH_CONFIG.userInfoUrl, {
          headers: {
            Authorization: `Bearer ${context.tokens.access_token}`,
          },
        });
        return await response.json();
      },
    },
    clientId: CHIPGPT_OAUTH_CONFIG.clientId,
    clientSecret: CHIPGPT_OAUTH_CONFIG.clientSecret,
    profile(profile: any) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        role: profile.role || 'user',
        agents: profile.agents || [],
      };
    },
  };
}