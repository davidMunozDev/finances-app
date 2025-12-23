import { paths } from "@/config/paths";
import type { AuthUser } from "./types";

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user_data";

/**
 * Save access token to localStorage
 */
export function setAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
}

/**
 * Remove access token from localStorage
 */
export function removeAccessToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

/**
 * Save user data to localStorage
 */
export function setUserData(user: AuthUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Get user data from localStorage
 */
export function getUserData(): AuthUser | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(USER_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Remove user data from localStorage
 */
export function removeUserData(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Force logout - clear tokens and redirect to login
 */
export function forceLogout(): void {
  removeAccessToken();
  removeUserData();
  if (typeof window !== "undefined") {
    window.location.href = paths.auth.signIn;
  }
}

/**
 * Check if user is authenticated (has access token)
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
