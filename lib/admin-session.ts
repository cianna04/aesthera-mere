export const ADMIN_LOGIN_PATH = "/admin/login";
export const ADMIN_SESSION_KEY = "aesthera-admin-session";
export const ADMIN_INACTIVITY_MS = 15 * 60 * 1000;

export function createAdminSession() {
  return JSON.stringify({ lastActive: Date.now() });
}

export function isAdminSessionActive(value: string | null, now = Date.now()) {
  if (!value) return false;
  if (value === "1") return true;
  try {
    const session = JSON.parse(value) as { lastActive?: number };
    return typeof session.lastActive === "number" && now - session.lastActive < ADMIN_INACTIVITY_MS;
  } catch {
    return false;
  }
}
