/**
 * Admin Authentication Service
 * Manages administrator login sessions for Groom, Read & Beyond (Stall #09).
 */

export interface AdminUser {
  username: string;
  email: string;
  role: 'Stall Lead' | 'Inventory Admin' | 'BizVenture Coordinator';
  stall: string;
  loginTime: string;
}

const STORAGE_KEY_AUTH = 'bizventure_admin_session';
const STORAGE_KEY_CUSTOM_PWD = 'bizventure_admin_custom_password';

// Standard allowed administrative users
const ALLOWED_ADMIN_ACCOUNTS = [
  { username: 'admin', email: 'jnnancy345@gmail.com', name: 'Stall #09 Lead Admin' },
  { username: 'nancy', email: 'jnnancy345@gmail.com', name: 'Nancy (Stall Lead)' },
  { username: 'groom', email: 'groomreadbeyond@gmail.com', name: 'Groom, Read & Beyond' },
];

// Pre-configured passwords
const DEFAULT_PASSWORDS = ['bizventure2026', 'admin', 'admin123', 'stall09', 'isu2026'];

export function isAuthenticated(): boolean {
  try {
    const session = localStorage.getItem(STORAGE_KEY_AUTH) || sessionStorage.getItem(STORAGE_KEY_AUTH);
    if (!session) return false;
    const parsed = JSON.parse(session);
    return Boolean(parsed && parsed.authenticated);
  } catch {
    return false;
  }
}

export function getAuthenticatedUser(): AdminUser | null {
  try {
    const session = localStorage.getItem(STORAGE_KEY_AUTH) || sessionStorage.getItem(STORAGE_KEY_AUTH);
    if (!session) return null;
    const parsed = JSON.parse(session);
    return parsed?.user || null;
  } catch {
    return null;
  }
}

export function loginAdmin(
  identifier: string,
  passwordAttempt: string,
  rememberMe = true
): { success: boolean; message: string; user?: AdminUser } {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (passwordAttempt || '').trim();

  if (!cleanId) {
    return { success: false, message: 'Please enter your username or admin email.' };
  }

  if (!cleanPass) {
    return { success: false, message: 'Please enter your admin password.' };
  }

  // Check username/email match
  const matchedAccount = ALLOWED_ADMIN_ACCOUNTS.find(
    (acc) => acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId
  );

  // Allow 'admin' or matching known account or any email starting with admin
  const isValidUser = Boolean(matchedAccount) || cleanId === 'admin';

  if (!isValidUser) {
    return {
      success: false,
      message: 'Unrecognized administrator username or email. Please use "admin" or "jnnancy345@gmail.com".',
    };
  }

  // Check password against custom password or pre-configured defaults
  const customPass = localStorage.getItem(STORAGE_KEY_CUSTOM_PWD);
  const isValidPassword =
    (customPass && cleanPass === customPass) ||
    DEFAULT_PASSWORDS.includes(cleanPass.toLowerCase());

  if (!isValidPassword) {
    return {
      success: false,
      message: 'Incorrect password. Default credentials: password "bizventure2026" or "admin".',
    };
  }

  const user: AdminUser = {
    username: matchedAccount ? matchedAccount.username : 'admin',
    email: matchedAccount ? matchedAccount.email : 'jnnancy345@gmail.com',
    role: 'Stall Lead',
    stall: 'Stall #09 (ISU Library Lawn)',
    loginTime: new Date().toISOString(),
  };

  const payload = JSON.stringify({ authenticated: true, user });

  try {
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY_AUTH, payload);
    } else {
      sessionStorage.setItem(STORAGE_KEY_AUTH, payload);
    }
  } catch (e) {
    console.warn('Storage quota issue while saving admin session', e);
  }

  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('bizventure-auth-changed', { detail: { authenticated: true, user } }));
  }, 0);

  return { success: true, message: 'Login successful! Welcome to Stall #09 Admin Portal.', user };
}

export function logoutAdmin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
  } catch (e) {
    console.error('Error clearing admin session', e);
  }
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('bizventure-auth-changed', { detail: { authenticated: false } }));
  }, 0);
}

export function setCustomAdminPassword(newPassword: string): boolean {
  if (!newPassword || newPassword.length < 4) return false;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PWD, newPassword.trim());
    return true;
  } catch {
    return false;
  }
}
