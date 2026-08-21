export const SESSION_COOKIE_NAME = "cp_session";
export const OIDC_COOKIE_NAME = "cp_oidc";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
export const OIDC_MAX_AGE_SECONDS = 60 * 10;

export const authErrors = {
  not_configured: "Sign-in is not set up. Ask an admin to configure Keycloak.",
  access_denied: "Sign-in was cancelled.",
  invalid_state: "Sign-in expired. Please try again.",
  token_exchange: "Could not complete sign-in. Please try again.",
  missing_code: "Could not complete sign-in. Please try again.",
} as const;

export type AuthErrorCode = keyof typeof authErrors;

export function authErrorMessage(
  code: string | null | undefined,
): string | null {
  if (!code) {
    return null;
  }

  if (code in authErrors) {
    return authErrors[code as AuthErrorCode];
  }

  return "Could not sign in. Please try again.";
}
