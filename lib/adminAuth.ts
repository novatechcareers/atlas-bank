export const ADMIN_ID = "admin";
export const ADMIN_PASSWORD = "Atlas@2026";
const STORAGE_KEY = "atlas_admin_authenticated";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function setAdminAuthenticated(value: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
}

export function clearAdminAuthentication() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function validateAdminCredentials(adminId: string, password: string) {
  return adminId === ADMIN_ID && password === ADMIN_PASSWORD;
}
