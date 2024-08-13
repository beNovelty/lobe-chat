import Auth0 from './auth0';
import Authentik from './authentik';
import AzureAD from './azure-ad';
import Github from './github';
import Keycloak from './keycloak';
import Zitadel from './zitadel';

export const ssoProviders = [Auth0, Authentik, AzureAD, Github, Keycloak, Zitadel];
