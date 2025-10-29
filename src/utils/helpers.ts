import { LOCALE, DATE_FORMAT_OPTIONS, RANDOM_ID } from '../constants/app.constants';
import { TIME } from '../constants/layout.constants';

/**
 * Format timestamp to time string (HH:MM AM/PM)
 */
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString(LOCALE.DEFAULT, DATE_FORMAT_OPTIONS.TIME);
};

/**
 * Format timestamp to relative time or date
 * Returns time if within 24 hours, otherwise returns date
 */
export const formatRelativeTime = (timestamp?: number): string => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / TIME.MILLISECONDS_PER_HOUR;

  if (diffInHours < TIME.HOURS_THRESHOLD) {
    return formatTime(timestamp);
  }

  return date.toLocaleDateString(LOCALE.DEFAULT, { month: 'short', day: 'numeric' });
};

/**
 * Format timestamp to date string (Day, Mon DD)
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString(LOCALE.DEFAULT, DATE_FORMAT_OPTIONS.DATE);
};

/**
 * Check if two timestamps are on different days
 */
export const isDifferentDay = (timestamp1: number, timestamp2: number): boolean => {
  return new Date(timestamp1).toDateString() !== new Date(timestamp2).toDateString();
};

/**
 * Generate unique ID
 */
export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(RANDOM_ID.RADIX).substring(RANDOM_ID.SUBSTR_START, RANDOM_ID.SUBSTR_END)}`;
};

/**
 * Get random item from array
 */
export const getRandomItem = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Get random delay within range
 */
export const getRandomDelay = (min: number, max: number): number => {
  return min + Math.random() * (max - min);
};
