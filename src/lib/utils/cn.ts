import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tiện ích kết hợp class Tailwind CSS an toàn
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

