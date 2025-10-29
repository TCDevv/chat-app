/**
 * Layout Constants
 * Contains all dimension, sizing, timing, and animation-related constants
 */

// Message Display Dimensions
export const MESSAGE_DIMENSIONS = {
  MAX_WIDTH_PERCENTAGE: '65%',
  INFINITE_SCROLL_MAX_WIDTH: '70%',
} as const;

// Textarea Dimensions (in pixels)
export const TEXTAREA = {
  MIN_HEIGHT_PX: 44,
  MAX_HEIGHT_PX: 120,
} as const;

// Avatar Dimensions (Tailwind scale)
export const AVATAR = {
  SIZE: 12, // represents w-12 h-12 in Tailwind (48px)
} as const;

// Virtual List Configuration
export const VIRTUAL_LIST = {
  HEIGHT_OFFSET: 180, // window.innerHeight - 180
  ITEM_SIZE: 120, // Item height in react-window
} as const;

// Animation Timing (in milliseconds)
export const ANIMATION = {
  HIGHLIGHT_DURATION_MS: 2000,
  STAGGER_DELAYS: {
    FIRST: 0,
    SECOND: 150,
    THIRD: 300,
  },
} as const;

// Intersection Observer Configuration
export const INTERSECTION_OBSERVER = {
  THRESHOLD: 0.1, // 10% visibility triggers intersection
} as const;

// Responsive Breakpoints (Tailwind classes)
export const RESPONSIVE_BREAKPOINTS = {
  CHAT_LIST: {
    MOBILE: 'w-full',
    TABLET: 'md:w-1/3',
    DESKTOP: 'lg:w-1/4',
  },
  MESSAGE_AREA: {
    MOBILE: 'w-full',
    TABLET: 'md:w-2/3',
    DESKTOP: 'lg:w-3/4',
  },
} as const;

// Time-related Constants
export const TIME = {
  HOURS_THRESHOLD: 24, // Hours in a day for date comparison
  MILLISECONDS_PER_HOUR: 1000 * 60 * 60,
  MOCK_MESSAGE_INTERVAL_MS: 60000, // 60 seconds for mock data
} as const;
