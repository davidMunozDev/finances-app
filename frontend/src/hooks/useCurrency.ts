"use client";

import { useCallback } from "react";
import { useCurrentUser } from "@/data/auth/hooks";
import {
  formatCurrency as formatCurrencyUtil,
  getCurrencySymbol as getCurrencySymbolUtil,
} from "@/utils/currency";

/**
 * Hook to get currency information and formatting functions.
 * Works in both onboarding flow and main application.
 * Defaults to "EUR" if currency is not found to prevent errors.
 *
 * @returns Object with currencyCode, formatCurrency function, and symbol
 */
export function useCurrency() {
  const { user } = useCurrentUser();
  const currencyCode = user?.default_currency || "EUR";
  const symbol = getCurrencySymbolUtil(currencyCode);
  const formatCurrency = useCallback(
    (amount: number) => formatCurrencyUtil(amount, currencyCode),
    [currencyCode]
  );

  return {
    currencyCode,
    formatCurrency,
    symbol,
  };
}
