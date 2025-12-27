import { CURRENCIES } from "@/config/currencies";
import { DEFAULT_LOCALE } from "@/config/locale";

/**
 * Get the currency symbol for a given currency code.
 * @param currencyCode - The ISO 4217 currency code (e.g., "EUR", "USD")
 * @returns The currency symbol (e.g., "€", "$") or "$" as fallback
 */
export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  return currency?.symbol || "$";
}

/**
 * Format an amount with the specified currency using locale formatting.
 * Always uses 2 decimal places and es-ES locale formatting.
 * @param amount - The numeric amount to format
 * @param currencyCode - The ISO 4217 currency code (e.g., "EUR", "USD")
 * @returns Formatted currency string (e.g., "1.234,56 €")
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    const formatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  } catch (error) {
    // Fallback if currency code is invalid
    console.warn(`Invalid currency code: ${currencyCode}`, error);
    return `${getCurrencySymbol(currencyCode)}${amount.toFixed(2)}`;
  }
}
