/**
 * UI Constants
 * Contains all user-facing text strings, keyboard events, and UI-related constants
 */

// Keyboard Events
export const KEYBOARD = {
  ENTER: 'Enter',
} as const;

// Chat List UI Text
export const CHAT_LIST = {
  HEADER: 'Chats',
  EMPTY_MESSAGE: 'No messages yet',
  UNREAD_TOOLTIP: 'Right-click to mark as unread',
} as const;

// Message Area UI Text
export const MESSAGE_AREA = {
  EMPTY_CHAT_TEXT: 'Select a chat',
  EMPTY_MESSAGES_TEXT: 'No messages yet. Start the conversation!',
  LOAD_MORE_TEXT: 'Scroll up to load more',
} as const;

// Message Input UI Text
export const MESSAGE_INPUT = {
  PLACEHOLDER: 'Type a message...',
  SEND_BUTTON_LABEL: 'Send',
} as const;

// Chat Layout UI Text
export const CHAT_LAYOUT = {
  WELCOME_TEXT: 'Welcome to Chat App',
  WELCOME_SUBTITLE: 'Select a chat from the left sidebar to start messaging',
} as const;

// Message Status Indicators
export const MESSAGE_INDICATORS = {
  DELIVERED: '✓✓',
  SENT: '✓',
} as const;

// User Identifiers
export const USER = {
  DEFAULT_SENDER_NAME: 'You',
  BOT_SENDER_NAME: 'Chat Bot',
} as const;
