import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Type helper for Tailwind class names
export type ClassName = string | undefined | null | false;

// Helper to conditionally join class names
export function classNames(...classes: ClassName[]): string {
  return classes.filter(Boolean).join(' ');
}
