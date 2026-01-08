"use client";

import { useCallback } from "react";
import { DEFAULT_LOCALE } from "@/config/locale";
import { date } from "zod";

/**
 * Hook to get locale information and date formatting functions.
 * Uses es-ES locale for Spanish formatting.
 *
 * @returns Object with formatDate and formatRelativeDate functions
 */
export function useLocale() {
  /**
   * Format a date string to locale format
   * @param dateString - ISO date string (YYYY-MM-DD)
   * @returns Formatted date (e.g., "25 dic 2025")
   */
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      const formatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      return formatter.format(date);
    } catch (error) {
      console.warn(`Invalid date string: ${dateString}`, error);
      return dateString;
    }
  }, []);

  /**
   * Format a date string to relative format (Hoy, Ayer, or formatted date)
   * @param dateString - ISO date string (YYYY-MM-DD)
   * @returns Relative date (e.g., "Hoy", "Ayer", "25 dic 2025")
   */
  const formatRelativeDate = useCallback(
    (dateString: string): string => {
      try {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time to compare only dates
        const dateOnly = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );
        const todayOnly = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const yesterdayOnly = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate()
        );

        if (dateOnly.getTime() === todayOnly.getTime()) {
          return "Hoy";
        } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
          return "Ayer";
        } else {
          return formatDate(dateString);
        }
      } catch (error) {
        console.warn(`Invalid date string: ${dateString}`, error);
        return dateString;
      }
    },
    [formatDate]
  );

  const formatStrDate = useCallback((date: Date, mask: string): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    return mask.replace("DD", day).replace("MM", month).replace("YYYY", year);
  }, []);

  return {
    formatDate,
    formatRelativeDate,
    formatStrDate,
  };
}
