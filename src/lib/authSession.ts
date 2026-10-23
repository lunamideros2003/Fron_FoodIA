const TOKEN_KEY = "foodmood.authToken";

/**
 * The bearer token of the session lives alone in localStorage. It is small,
 * auditable and the profile id it belongs to arrives with each API answer.
 */
export function readAuthToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token && token.trim().length > 0 ? token.trim() : null;
  } catch {
    return null;
  }
}

export function saveAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token.trim());
  } catch {
    // Private browsing can refuse storage; the session simply does not
    // survive a reload.
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to recover from: the token is already unusable.
  }
}
