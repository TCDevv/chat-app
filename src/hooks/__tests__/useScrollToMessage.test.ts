import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useScrollToMessage } from '../useScrollToMessage';
import type { Message } from '@models/Message';
import { QUERY_PARAMS, CSS_CLASSES } from '../../constants/dom.constants';
import { ANIMATION } from '../../constants/layout.constants';

describe('useScrollToMessage', () => {
  let mockMessages: Message[];
  let mockListRef: { current: HTMLDivElement | null };
  let mockMessageElement: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();

    mockMessages = [
      {
        id: 'msg_1',
        chatId: 'chat_1',
        content: 'Message 1',
        sender: 'User',
        timestamp: Date.now(),
        isOwn: true,
      },
      {
        id: 'msg_2',
        chatId: 'chat_1',
        content: 'Message 2',
        sender: 'Bot',
        timestamp: Date.now(),
        isOwn: false,
      },
      {
        id: 'msg_3',
        chatId: 'chat_1',
        content: 'Message 3',
        sender: 'User',
        timestamp: Date.now(),
        isOwn: true,
      },
    ];

    mockMessageElement = document.createElement('div');
    mockMessageElement.setAttribute('data-message-id', 'msg_2');
    mockMessageElement.scrollIntoView = vi.fn();
    mockMessageElement.classList.add = vi.fn();
    mockMessageElement.classList.remove = vi.fn();
    document.body.appendChild(mockMessageElement);

    mockListRef = { current: document.createElement('div') };

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should scroll to message when messageId is in URL', () => {
    // Set URL with messageId
    delete (window as Window).location;
    (window as Window).location = {
      search: `?${QUERY_PARAMS.MESSAGE_ID}=msg_2`,
    } as Location;

    renderHook(() => useScrollToMessage(mockMessages, mockListRef));

    // Fast-forward timers to trigger setTimeout
    vi.advanceTimersByTime(100);

    expect(mockMessageElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
    expect(mockMessageElement.classList.add).toHaveBeenCalledWith(CSS_CLASSES.MESSAGE_HIGHLIGHT);
    expect(console.log).toHaveBeenCalledWith('Scrolling to message:', 'msg_2');
  });

  it('should remove highlight class after animation duration', () => {
    delete (window as Window).location;
    (window as Window).location = {
      search: `?${QUERY_PARAMS.MESSAGE_ID}=msg_2`,
    } as Location;

    renderHook(() => useScrollToMessage(mockMessages, mockListRef));

    // Fast-forward past initial delay
    vi.advanceTimersByTime(100);

    expect(mockMessageElement.classList.add).toHaveBeenCalledWith(CSS_CLASSES.MESSAGE_HIGHLIGHT);

    // Fast-forward past highlight duration
    vi.advanceTimersByTime(ANIMATION.HIGHLIGHT_DURATION_MS);

    expect(mockMessageElement.classList.remove).toHaveBeenCalledWith(CSS_CLASSES.MESSAGE_HIGHLIGHT);
  });

  it('should not scroll if no messageId in URL', () => {
    delete (window as Window).location;
    (window as Window).location = {
      search: '',
    } as Location;

    renderHook(() => useScrollToMessage(mockMessages, mockListRef));

    vi.advanceTimersByTime(100);

    expect(mockMessageElement.scrollIntoView).not.toHaveBeenCalled();
  });

  it('should not scroll if messages array is empty', () => {
    delete (window as Window).location;
    (window as Window).location = {
      search: `?${QUERY_PARAMS.MESSAGE_ID}=msg_2`,
    } as Location;

    renderHook(() => useScrollToMessage([], mockListRef));

    vi.advanceTimersByTime(100);

    expect(mockMessageElement.scrollIntoView).not.toHaveBeenCalled();
  });

  it('should not scroll if listRef is null', () => {
    delete (window as Window).location;
    (window as Window).location = {
      search: `?${QUERY_PARAMS.MESSAGE_ID}=msg_2`,
    } as Location;

    const nullListRef = { current: null };

    renderHook(() => useScrollToMessage(mockMessages, nullListRef));

    vi.advanceTimersByTime(100);

    expect(mockMessageElement.scrollIntoView).not.toHaveBeenCalled();
  });

  it('should warn if message element not found in DOM', () => {
    delete (window as Window).location;
    (window as Window).location = {
      search: `?${QUERY_PARAMS.MESSAGE_ID}=msg_999`,
    } as Location;

    // Add message to data but not to DOM
    const messagesWithExtra = [
      ...mockMessages,
      {
        id: 'msg_999',
        chatId: 'chat_1',
        content: 'Message 999',
        sender: 'User',
        timestamp: Date.now(),
        isOwn: true,
      },
    ];

    renderHook(() => useScrollToMessage(messagesWithExtra, mockListRef));

    vi.advanceTimersByTime(100);

    expect(console.warn).toHaveBeenCalledWith('Message element not found in DOM:', 'msg_999');
  });

  it('should log message if message not in current page', () => {
    delete (window as Window).location;
    (window as Window).location = {
      search: `?${QUERY_PARAMS.MESSAGE_ID}=msg_not_loaded`,
    } as Location;

    renderHook(() => useScrollToMessage(mockMessages, mockListRef));

    vi.advanceTimersByTime(100);

    expect(console.log).toHaveBeenCalledWith(
      'Message not in current page, might need to load more:',
      'msg_not_loaded'
    );
  });

  it('should not scroll twice if hook re-renders', () => {
    delete (window as Window).location;
    (window as Window).location = {
      search: `?${QUERY_PARAMS.MESSAGE_ID}=msg_2`,
    } as Location;

    const { rerender } = renderHook(() => useScrollToMessage(mockMessages, mockListRef));

    // First render
    vi.advanceTimersByTime(100);
    expect(mockMessageElement.scrollIntoView).toHaveBeenCalledTimes(1);

    // Clear the mock
    vi.clearAllMocks();

    // Re-render
    rerender();
    vi.advanceTimersByTime(100);

    // Should not scroll again
    expect(mockMessageElement.scrollIntoView).not.toHaveBeenCalled();
  });

  it('should handle messages array updates', () => {
    delete (window as Window).location;
    (window as Window).location = {
      search: `?${QUERY_PARAMS.MESSAGE_ID}=msg_new`,
    } as Location;

    // Create new message element
    const newMessageElement = document.createElement('div');
    newMessageElement.setAttribute('data-message-id', 'msg_new');
    newMessageElement.scrollIntoView = vi.fn();
    newMessageElement.classList.add = vi.fn();
    document.body.appendChild(newMessageElement);

    const { rerender } = renderHook(
      ({ messages }) => useScrollToMessage(messages, mockListRef),
      {
        initialProps: { messages: mockMessages },
      }
    );

    // Initially, message not found
    vi.advanceTimersByTime(100);
    expect(newMessageElement.scrollIntoView).not.toHaveBeenCalled();

    // Update messages to include the new message
    const updatedMessages = [
      ...mockMessages,
      {
        id: 'msg_new',
        chatId: 'chat_1',
        content: 'New Message',
        sender: 'User',
        timestamp: Date.now(),
        isOwn: true,
      },
    ];

    rerender({ messages: updatedMessages });
    vi.advanceTimersByTime(100);

    expect(newMessageElement.scrollIntoView).toHaveBeenCalled();
  });
});
