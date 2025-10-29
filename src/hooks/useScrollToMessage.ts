import { useEffect, useRef, type RefObject } from 'react';
import type { Message } from '@models/Message';
import { QUERY_PARAMS, getMessageSelector, CSS_CLASSES, SCROLL_BEHAVIOR } from '../constants/dom.constants';
import { ANIMATION } from '../constants/layout.constants';
import { DEFAULT_VALUES } from '../constants/app.constants';

export const useScrollToMessage = (
  messages: Message[],
  listRef: RefObject<HTMLDivElement | null>
) => {
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    // Check URL for message ID
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get(QUERY_PARAMS.MESSAGE_ID);

    // Skip if no message ID or already scrolled
    if (!messageId || hasScrolledRef.current) {
      return;
    }

    // Skip if messages not loaded yet
    if (messages.length === 0 || !listRef.current) {
      return;
    }

    // Check if the target message is in the loaded messages
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);

    if (messageIndex !== DEFAULT_VALUES.INDEX_NOT_FOUND) {
      // Add a small delay to ensure DOM is fully rendered
      setTimeout(() => {
        const messageElement = document.querySelector(getMessageSelector(messageId));

        if (messageElement) {
          console.log('Scrolling to message:', messageId);

          messageElement.scrollIntoView({
            behavior: SCROLL_BEHAVIOR.BEHAVIOR,
            block: SCROLL_BEHAVIOR.BLOCK
          });

          // Highlight the message
          messageElement.classList.add(CSS_CLASSES.MESSAGE_HIGHLIGHT);
          setTimeout(() => {
            messageElement.classList.remove(CSS_CLASSES.MESSAGE_HIGHLIGHT);
          }, ANIMATION.HIGHLIGHT_DURATION_MS);

          // Mark as scrolled
          hasScrolledRef.current = true;
        } else {
          console.warn('Message element not found in DOM:', messageId);
        }
      }, 100); // Small delay to ensure DOM rendering
    } else {
      console.log('Message not in current page, might need to load more:', messageId);
    }
  }, [messages, listRef]);
};
