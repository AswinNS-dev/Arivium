import { useAuthStore } from '../store/authStore';
import { apiBaseUrl } from './apiConfig';

const AUTH_TOKEN_KEY = 'arivium:authToken';
const AUTH_USER_KEY = 'arivium:authUser';

function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveSession(token: string, user: AuthUser) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  useAuthStore.getState().setAuth(token, user);
}

function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  useAuthStore.getState().clearAuth();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${apiBaseUrl}/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.message || 'Auth request failed');
  return payload.data as T;
}

export async function signUp(name: string, email: string, password: string) {
  const data = await request<{ token: string; user: AuthUser }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  saveSession(data.token, data.user);
  return data.user;
}

export async function login(email: string, password: string) {
  const data = await request<{ token: string; user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  saveSession(data.token, data.user);
  return data.user;
}

export function getGoogleOAuthUrl() {
  const currentUrl = window.location.origin;
  return `${apiBaseUrl}/api/v1/auth/google?redirectTo=${encodeURIComponent(currentUrl + '/auth/callback')}`;
}

export function setAuthSession(token: string, user: AuthUser) {
  saveSession(token, user);
}

export async function me() {
  const data = await request<{ user: AuthUser }>('/auth/me');
  saveSession(getStoredToken() || '', data.user);
  return data.user;
}

export async function logout() {
  try {
    await request<{ message: string }>('/auth/logout', { method: 'POST' });
  } finally {
    clearSession();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
  }
}

export function getAuthUser() {
  return useAuthStore.getState().user || getStoredUser();
}

export function getAuthToken() {
  return useAuthStore.getState().token || getStoredToken();
}

export function restoreAuthState() {
  const token = getStoredToken();
  const user = getStoredUser();
  if (token && user) {
    useAuthStore.getState().setAuth(token, user);
  }
}
