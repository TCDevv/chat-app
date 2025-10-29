/**
 * DOM Constants
 * Contains DOM selectors, query parameters, scroll behavior, and test IDs
 */

// Query Parameters
export const QUERY_PARAMS = {
  MESSAGE_ID: 'messageId',
} as const;

// DOM Selectors
export const DOM_SELECTORS = {
  MESSAGE_BY_ID_PREFIX: '[data-message-id="',
  MESSAGE_BY_ID_SUFFIX: '"]',
} as const;

// Helper function to build message selector
export const getMessageSelector = (messageId: string): string => {
  return `${DOM_SELECTORS.MESSAGE_BY_ID_PREFIX}${messageId}${DOM_SELECTORS.MESSAGE_BY_ID_SUFFIX}`;
};

// CSS Classes
export const CSS_CLASSES = {
  MESSAGE_HIGHLIGHT: 'highlighted-message',
} as const;

// Scroll Behavior
export const SCROLL_BEHAVIOR = {
  BEHAVIOR: 'smooth' as ScrollBehavior,
  BLOCK: 'center' as ScrollLogicalPosition,
} as const;

// Test IDs for Testing
export const TEST_IDS = {
  MESSAGE_INPUT: 'message-input',
  SEND_BUTTON: 'send-button',
} as const;
