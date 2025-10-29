// Storage keys
export const STORAGE_KEYS = {
  MESSAGES: 'chat_messages',
  CHATS: 'chat_chats',
} as const;

// Pagination
export const MESSAGES_PER_PAGE = 20;
export const MAX_MESSAGES_PER_CHAT = 1000;

// Worker message types
export enum WorkerMessageType {
  LOAD_MESSAGES_PAGINATED = 'LOAD_MESSAGES_PAGINATED',
  LOAD_ALL_MESSAGES = 'LOAD_ALL_MESSAGES',
  MESSAGES_LOADED = 'MESSAGES_LOADED',
  ALL_MESSAGES_LOADED = 'ALL_MESSAGES_LOADED',
  GENERATE_REPLY = 'GENERATE_REPLY',
  MOCK_REPLY = 'MOCK_REPLY',
}

// Message status
export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

// Mock reply messages
export const MOCK_REPLIES = [
  "That's interesting! Tell me more.",
  'I see what you mean.',
  'Got it! Thanks for letting me know.',
  'That sounds great!',
  'Absolutely! I agree with you.',
  'Hmm, let me think about that...',
  "Sure thing! I'll get back to you on that.",
  'Thanks for sharing that with me!',
  'Interesting point of view!',
  'I appreciate you reaching out!',
] as const;

// Reply delay range (in milliseconds)
export const REPLY_DELAY_MIN = 1000;
export const REPLY_DELAY_MAX = 3000;

// Worker processing delay
export const WORKER_PROCESSING_DELAY = 100;

// ID Generation Constants
export const ID_PREFIX = {
  MESSAGE: 'msg_',
  REPLY: 'reply',
} as const;

// Random ID Generation
export const RANDOM_ID = {
  RADIX: 36,
  SUBSTR_START: 2,
  SUBSTR_END: 11,
} as const;

// Default Values
export const DEFAULT_VALUES = {
  UNREAD_COUNT: 1,
  INDEX_NOT_FOUND: -1,
  UNREAD_INCREMENT: 1,
  MOCK_MESSAGES_PER_CHAT: 1000,
} as const;

// Locale and Formatting
export const LOCALE = {
  DEFAULT: 'en-US',
} as const;

export const DATE_FORMAT_OPTIONS = {
  TIME: { hour: '2-digit', minute: '2-digit' } as const,
  DATE: { weekday: 'short', month: 'short', day: 'numeric' } as const,
} as const;

// PostMessage Event Types
export const POST_MESSAGE_TYPES = {
  NEW_MESSAGE: 'NEW_MESSAGE',
} as const;

// PostMessage Target Origin (consider making this configurable for production)
export const POST_MESSAGE_TARGET_ORIGIN = '*';
