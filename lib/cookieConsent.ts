export const COOKIE_CONSENT_KEY = "aesthera-cookie-consent";
export const COOKIE_CONSENT_EVENT = "aesthera-cookie-consent";

export type CookieConsent = "accepted" | "rejected" | null;

export function readCookieConsent(): CookieConsent {
  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function saveCookieConsent(choice: Exclude<CookieConsent, null>) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    // Keep the choice active for this page even if browser storage is blocked.
  }

  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: choice }));
}
