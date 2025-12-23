import useSWR from "swr";
import type { AuthUser } from "./types";
import { endpoints } from "@/config/endpoints";
import { defaultServerInstance } from "@/config/servers";
import { getUserData, getAccessToken, setUserData } from "./utils";

/**
 * Hook to fetch current user with SWR
 * Returns user data, loading state, error, and mutate function
 */
export function useCurrentUser() {
  const { data, error, isLoading, mutate } = useSWR<AuthUser>(
    getAccessToken() ? endpoints.auth.me : null,
    async (url: string) => {
      // Primero intentar obtener datos de localStorage
      const cachedUser = getUserData();
      if (cachedUser) {
        return cachedUser;
      }

      // Si no hay datos en cache, hacer la petición
      const response = await defaultServerInstance.get<AuthUser>(url);

      // Guardar los datos obtenidos
      setUserData(response.data);

      return response.data;
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      fallbackData: getUserData() || undefined,
    }
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to check if user is authenticated
 */
export function useAuth() {
  const { user, isLoading, isError, mutate } = useCurrentUser();

  return {
    user,
    isAuthenticated: !isLoading && !isError && !!user,
    isLoading,
    mutate,
  };
}
