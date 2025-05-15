import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleError(error: unknown): never {
  if (error instanceof Error) {
    throw error
  }
  throw new Error(typeof error === 'string' ? error : JSON.stringify(error))
}