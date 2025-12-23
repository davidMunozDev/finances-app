import type { AxiosRequestConfig } from "axios";

import axios from "axios";
import { forceLogout } from "@/auth/utils";
import { endpoints } from "./endpoints";

// You can create your own server instance

export const defaultServerInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "",
});

// Request interceptor to add access token
defaultServerInstance.interceptors.request.use(
  (config) => {
    // Import dynamically to avoid circular dependency
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
defaultServerInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("error", error);
    if (
      error.response?.status === 401 &&
      !error.config.url?.includes(endpoints.auth.login)
    ) {
      // Import dynamically to avoid circular dependency
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        forceLogout();
      }
    }
    return Promise.reject(
      (error.response && error.response.data) || "Something went wrong"
    );
  }
);

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await defaultServerInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error("Failed to fetch:", error);
    throw error;
  }
};

export default defaultServerInstance;
