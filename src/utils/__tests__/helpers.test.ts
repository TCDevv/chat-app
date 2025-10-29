import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatTime,
  formatRelativeTime,
  formatDate,
  isDifferentDay,
  generateId,
  getRandomItem,
  getRandomDelay,
} from '../helpers';

describe('helpers', () => {
  beforeEach(() => {
    // Reset Date mock before each test
    vi.useRealTimers();
  });

  describe('formatTime', () => {
    it('should format timestamp to time string', () => {
      const timestamp = new Date('2024-01-15T14:30:00').getTime();
      const result = formatTime(timestamp);
      expect(result).toMatch(/\d{2}:\d{2}\s[AP]M/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should return empty string for undefined timestamp', () => {
      expect(formatRelativeTime(undefined)).toBe('');
    });

    it('should return time for messages within 24 hours', () => {
      const now = Date.now();
      const timestamp = now - 1000 * 60 * 60; // 1 hour ago
      const result = formatRelativeTime(timestamp);
      expect(result).toMatch(/\d{2}:\d{2}\s[AP]M/);
    });

    it('should return date for messages older than 24 hours', () => {
      const now = Date.now();
      const timestamp = now - 1000 * 60 * 60 * 25; // 25 hours ago
      const result = formatRelativeTime(timestamp);
      expect(result).toMatch(/[A-Za-z]{3}\s\d{1,2}/); // e.g., "Jan 15"
    });
  });

  describe('formatDate', () => {
    it('should format timestamp to date string', () => {
      const timestamp = new Date('2024-01-15T14:30:00').getTime();
      const result = formatDate(timestamp);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
    });
  });

  describe('isDifferentDay', () => {
    it('should return false for timestamps on same day', () => {
      const timestamp1 = new Date('2024-01-15T10:00:00').getTime();
      const timestamp2 = new Date('2024-01-15T14:00:00').getTime();
      expect(isDifferentDay(timestamp1, timestamp2)).toBe(false);
    });

    it('should return true for timestamps on different days', () => {
      const timestamp1 = new Date('2024-01-15T10:00:00').getTime();
      const timestamp2 = new Date('2024-01-16T10:00:00').getTime();
      expect(isDifferentDay(timestamp1, timestamp2)).toBe(true);
    });
  });

  describe('generateId', () => {
    it('should generate unique ID with prefix', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');

      expect(id1).toMatch(/^test_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^test_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });

    it('should include timestamp in ID', () => {
      const beforeTime = Date.now();
      const id = generateId('msg');
      const afterTime = Date.now();

      const timestamp = parseInt(id.split('_')[1]);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('getRandomItem', () => {
    it('should return an item from the array', () => {
      const array = ['a', 'b', 'c', 'd', 'e'];
      const item = getRandomItem(array);
      expect(array).toContain(item);
    });

    it('should handle single item array', () => {
      const array = ['only'];
      expect(getRandomItem(array)).toBe('only');
    });

    it('should work with readonly arrays', () => {
      const array = ['a', 'b', 'c'] as const;
      const item = getRandomItem(array);
      expect(array).toContain(item);
    });
  });

  describe('getRandomDelay', () => {
    it('should return value within range', () => {
      const min = 100;
      const max = 500;
      const delay = getRandomDelay(min, max);

      expect(delay).toBeGreaterThanOrEqual(min);
      expect(delay).toBeLessThanOrEqual(max);
    });

    it('should return min when min equals max', () => {
      const value = 100;
      const delay = getRandomDelay(value, value);
      expect(delay).toBe(value);
    });

    it('should generate different values', () => {
      const delays = new Set();
      for (let i = 0; i < 10; i++) {
        delays.add(getRandomDelay(1, 1000));
      }
      // With high probability, at least 5 different values
      expect(delays.size).toBeGreaterThan(5);
    });
  });
});
