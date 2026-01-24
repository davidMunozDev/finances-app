import type { LoginBody, RegisterBody, AuthResponse, AuthUser } from "./types";
import { mutate } from "swr";

import { defaultServerInstance } from "@/config/servers";
import { endpoints } from "@/config/endpoints";
import {
  setAccessToken,
  setUserData,
  removeAccessToken,
  removeUserData,
} from "@/auth/utils";
import { paths } from "@/config/paths";

/**
 * Register a new user
 */
export async function registerUser(data: RegisterBody): Promise<AuthResponse> {
  const response = await defaultServerInstance.post<AuthResponse>(
    endpoints.auth.register,
    data
  );

  // Guardar el access token y user data automáticamente
  setAccessToken(response.data.access_token);
  setUserData(response.data.user);

  // Actualizar cache de SWR con los datos del usuario
  await mutate(endpoints.auth.me, response.data.user, false);

  return response.data;
}

/**
 * Login user
 */
export async function loginUser(data: LoginBody): Promise<AuthResponse> {
  const response = await defaultServerInstance.post<AuthResponse>(
    endpoints.auth.login,
    data
  );

  // Guardar el access token y user data automáticamente
  setAccessToken(response.data.access_token);
  setUserData(response.data.user);

  // Actualizar cache de SWR con los datos del usuario
  await mutate(endpoints.auth.me, response.data.user, false);

  return response.data;
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  await defaultServerInstance.post(endpoints.auth.logout);
  window.location.href = paths.auth.signIn;

  // Eliminar el access token y user data del localStorage
  removeAccessToken();
  removeUserData();
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await defaultServerInstance.get<AuthUser>(endpoints.auth.me);
  return response.data;
}

/**
 * Delete current user account
 */
export async function deleteUserAccount(): Promise<void> {
  await defaultServerInstance.delete(endpoints.auth.delete);
  window.location.href = paths.auth.signIn;

  // Eliminar el access token y user data del localStorage
  removeAccessToken();
  removeUserData();
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(): Promise<{ access_token: string }> {
  const response = await defaultServerInstance.post<{ access_token: string }>(
    endpoints.auth.refresh
  );

  // Guardar el nuevo access token
  setAccessToken(response.data.access_token);

  return response.data;
}
