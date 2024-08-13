import Keycloak from 'next-auth/providers/keycloak';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'keycloak',
  provider: Keycloak({
    ...CommonProviderConfig,
    // authorization scope is by default correct
    clientId: authEnv.KEYCLOAK_CLIENT_ID,
    clientSecret: authEnv.KEYCLOAK_CLIENT_SECRET,
    issuer: authEnv.KEYCLOAK_ISSUER,
    // Specify auth scope, at least include 'openid email'
    profile(profile) {
      return {
        email: profile.email,
        image: profile.picture,
        name: profile.name ?? profile.preferred_username,
        providerAccountId: profile.sub,
      };
    },
  }),
};

export default provider;