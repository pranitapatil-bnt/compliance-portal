import "server-only";

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

function issuerFromTokenUrl(tokenUrl: string | undefined): string | undefined {
  if (!tokenUrl) {
    return undefined;
  }

  const marker = "/protocol/openid-connect/token";
  const index = tokenUrl.indexOf(marker);
  return index === -1 ? undefined : tokenUrl.slice(0, index);
}

const keycloakTokenUrl = readEnv("KEYCLOAK_TOKEN_URL");
const keycloakIssuer =
  readEnv("KEYCLOAK_ISSUER") ?? issuerFromTokenUrl(keycloakTokenUrl);
const keycloakPortalClientId =
  readEnv("KEYCLOAK_PORTAL_CLIENT_ID") ?? "compliance-portal-web";
const keycloakPortalClientSecret = readEnv("KEYCLOAK_PORTAL_CLIENT_SECRET");

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiBaseUrl: readEnv("API_BASE_URL"),
  complianceApiBase: readEnv("COMPLIANCE_API_BASE"),
  portalJsessionId: readEnv("PORTAL_JSESSIONID"),
  portalSsoUsername: readEnv("PORTAL_SSO_USERNAME") ?? "ethos.comp.system",
  portalSsoPassword: readEnv("PORTAL_SSO_PASSWORD"),
  sessionSecret: readEnv("SESSION_SECRET") ?? "dev-only-change-me",
  isProduction: process.env.NODE_ENV === "production",
  keycloak: {
    issuer: keycloakIssuer,
    portalClientId: keycloakPortalClientId,
    portalClientSecret: keycloakPortalClientSecret,
    tokenUrl: keycloakTokenUrl,
    apiClientId: readEnv("KEYCLOAK_CLIENT_ID"),
    apiClientSecret: readEnv("KEYCLOAK_CLIENT_SECRET"),
    apiUsername: readEnv("KEYCLOAK_USERNAME"),
    apiPassword: readEnv("KEYCLOAK_PASSWORD"),
  },
} as const;

export function isKeycloakLoginConfigured(): boolean {
  return Boolean(
    env.keycloak.issuer &&
    env.keycloak.portalClientId &&
    env.keycloak.portalClientSecret,
  );
}

export function isKeycloakApiConfigured(): boolean {
  return Boolean(
    env.keycloak.tokenUrl &&
    env.keycloak.apiClientId &&
    env.keycloak.apiClientSecret &&
    env.keycloak.apiUsername &&
    env.keycloak.apiPassword,
  );
}
