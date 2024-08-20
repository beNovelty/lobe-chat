import type { NextAuthConfig } from 'next-auth';

import { authEnv } from '@/config/auth';

import { ssoProviders } from './sso-providers';

export const initSSOProviders = () => {
  return authEnv.NEXT_PUBLIC_ENABLE_NEXT_AUTH
    ? authEnv.NEXT_AUTH_SSO_PROVIDERS.split(/[,，]/).map((provider) => {
        const validProvider = ssoProviders.find((item) => item.id === provider);

        if (validProvider) return validProvider.provider;

        throw new Error(`[NextAuth] provider ${provider} is not supported`);
      })
    : [];
};

// Notice this is only an object, not a full Auth.js instance
export default {
  callbacks: {
    async signIn({ profile }) {
      const isAllowedToSignIn = typeof profile?.email === 'string' && profile?.email !== '';
      if (isAllowedToSignIn) {
        return true
      } else {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },  
    // Note: Data processing order of callback: authorize --> jwt --> session
    async jwt({ token, user }) {
      // ref: https://authjs.dev/guides/extending-the-session#with-jwt
      if (user?.id) {
        token.userId = user?.id;
      }
      // user.providerAccountId is the keycloak (or other providers) user id
      // need to store this in server session
      if (user?.providerAccountId) {
        token.providerAccountId = user?.providerAccountId;
      }
      return token;
    },
    async session({ session, token, user }) {
      if (session.user) {
        // ref: https://authjs.dev/guides/extending-the-session#with-database
        if (user) {
          session.user.id = user.id;
        } else {
          // since we are using jwt session, user must be undefined, and token will be used
          // token.userId is just a random uuid in browser's IndexDB, not the keycloak user id. It will change over time when the same user login multiple times.
          // token.sub is the keycloak (or other provider's) user id
          session.user.id = (token.providerAccountId ?? session.user.id) as string;
        }
      }
      return session;
    },
  },
  providers: initSSOProviders(),
  secret: authEnv.NEXT_AUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
