/* eslint-disable @typescript-eslint/naming-convention */
const issuer = process.env.AUTH0_VSCODE_EXTENSION_ISSUER || 'https://auth0.auth0.com';
const client_id = process.env.AUTH0_VSCODE_EXTENSION_CLIENT_ID || 'w94YV1qvYFMH2PnmFSIQVxkGJwk0tBGt';
const audience = process.env.AUTH0_VSCODE_EXTENSION_AUDIENCE || 'https://*.auth0.com/api/v2/';
const scope = 'openid offline_access read:client_grants delete:client_grants create:client_grants update:client_grants read:clients update:clients delete:clients create:clients read:client_keys update:client_keys delete:client_keys create:client_keys read:connections update:connections delete:connections create:connections read:resource_servers update:resource_servers delete:resource_servers create:resource_servers read:rules update:rules delete:rules create:rules read:hooks update:hooks delete:hooks create:hooks read:rules_configs update:rules_configs delete:rules_configs read:actions update:actions delete:actions read:email_provider update:email_provider delete:email_provider create:email_provider read:tenant_settings update:tenant_settings read:grants delete:grants read:guardian_factors update:guardian_factors read:mfa_policies update:mfa_policies read:email_templates create:email_templates update:email_templates read:roles update:roles delete:roles create:roles read:prompts update:prompts read:branding update:branding read:organizations update:organizations';

interface I_OIDC_CONFIG {
  ISSUER: string;
  CLIENT_ID: string;
  AUDIENCE: string;
  SCOPE: string;
}

export const OIDC_CONFIG: I_OIDC_CONFIG = {
  ISSUER: issuer,
  CLIENT_ID: client_id,
  AUDIENCE: audience,
  SCOPE: scope
};
