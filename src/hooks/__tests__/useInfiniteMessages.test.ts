import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useInfiniteMessages } from '../useInfiniteMessages';
import { WorkerMessageType } from '@constants/app.constants';
import type { Message } from '@models/Message';
import type { Chat } from '@models/Chat';

// Mock the DI container
vi.mock('@di/container', () => ({
  container: {
    get: vi.fn(() => ({
      getChats: vi.fn(() => mockChats),
      getMessages: vi.fn((chatId: string) => mockMessages.filter(m => m.chatId === chatId)),
      getTotalMessageCount: vi.fn(() => mockMessages.length),
      getMessagesPaginated: vi.fn((chatId: string, offset: number, limit: number) => {
        const chatMessages = mockMessages.filter(m => m.chatId === chatId);
        return chatMessages.slice(offset, offset + limit);
      }),
      sendMessage: vi.fn((payload) => {
        const newMessage: Message = {
          id: 'msg_new',
          chatId: payload.chatId,
          content: payload.content,
          sender: payload.sender,
          timestamp: Date.now(),
          isOwn: true,
          status: 'sent',
        };
        mockMessages.push(newMessage);
      }),
      markAsRead: vi.fn(),
      subscribeToMessages: vi.fn(() => vi.fn()),
      subscribeToChats: vi.fn(() => vi.fn()),
    })),
  },
}));

let mockChats: Chat[];
let mockMessages: Message[];

describe('useInfiniteMessages', () => {
  let mockWorker: Worker;

  beforeEach(() => {
    mockChats = [
      {
        id: 'chat_1',
        name: 'Alice',
        lastMessage: 'Hello',
        timestamp: Date.now(),
        unreadCount: 0,
        isOnline: true,
      },
      {
        id: 'chat_2',
        name: 'Bob',
        lastMessage: 'Hi',
        timestamp: Date.now(),
        unreadCount: 1,
        isOnline: false,
      },
    ];

    mockMessages = Array.from({ length: 100 }, (_, i) => ({
      id: `msg_${i}`,
      chatId: 'chat_1',
      content: `Message ${i}`,
      sender: i % 2 === 0 ? 'You' : 'Alice',
      timestamp: Date.now() - i * 1000,
      isOwn: i % 2 === 0,
      status: 'delivered' as const,
    }));

    // Mock worker
    mockWorker = {
      postMessage: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Worker;

    // Clear location mock
    delete (window as Window).location;
    (window as Window).location = { search: '' } as Location;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load initial chats on mount', async () => {
    const { result } = renderHook(() => useInfiniteMessages(null, mockWorker));

    await waitFor(() => {
      expect(result.current.chats).toHaveLength(2);
    });

    expect(result.current.chats[0].name).toBe('Alice');
    expect(result.current.chats[1].name).toBe('Bob');
  });

  it('should load initial messages when chatId is selected', async () => {
    const { result } = renderHook(() => useInfiniteMessages('chat_1', mockWorker));

    // Worker should be called to load messages
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: WorkerMessageType.LOAD_MESSAGES_PAGINATED,
      payload: expect.objectContaining({
        offset: 0,
        limit: 20,
      }),
    });
  });

  it('should handle worker MESSAGES_LOADED response', async () => {
    const { result } = renderHook(() => useInfiniteMessages('chat_1', mockWorker));

    // Get the event listener that was registered
    const addEventListenerCalls = (mockWorker.addEventListener as any).mock.calls;
    const messageHandler = addEventListenerCalls.find((call: any[]) => call[0] === 'message')?.[1];

    // Simulate worker response
    act(() => {
      messageHandler({
        data: {
          type: WorkerMessageType.MESSAGES_LOADED,
          payload: {
            chatId: 'chat_1',
            messages: mockMessages.slice(0, 20),
            hasMore: true,
          },
        },
      });
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(20);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle worker ALL_MESSAGES_LOADED response', async () => {
    const { result } = renderHook(() => useInfiniteMessages('chat_1', mockWorker));

    const addEventListenerCalls = (mockWorker.addEventListener as any).mock.calls;
    const messageHandler = addEventListenerCalls.find((call: any[]) => call[0] === 'message')?.[1];

    // Simulate worker response with all messages
    act(() => {
      messageHandler({
        data: {
          type: WorkerMessageType.ALL_MESSAGES_LOADED,
          payload: {
            chatId: 'chat_1',
            messages: mockMessages,
            hasMore: false,
          },
        },
      });
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(100);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should load all messages when messageId is in URL', async () => {
    delete (window as Window).location;
    (window as Window).location = { search: '?messageId=msg_50' } as Location;

    renderHook(() => useInfiniteMessages('chat_1', mockWorker));

    // Should call LOAD_ALL_MESSAGES instead of LOAD_MESSAGES_PAGINATED
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: WorkerMessageType.LOAD_ALL_MESSAGES,
      payload: {
        chatId: 'chat_1',
        messages: expect.arrayContaining([
          expect.objectContaining({ id: 'msg_50' }),
        ]),
      },
    });
  });

  it('should send message and trigger worker reply', async () => {
    const { result } = renderHook(() => useInfiniteMessages('chat_1', mockWorker));

    act(() => {
      result.current.sendMessage('Hello World');
    });

    // Should send message and trigger worker to generate reply
    await waitFor(() => {
      expect(mockWorker.postMessage).toHaveBeenCalledWith({
        type: WorkerMessageType.GENERATE_REPLY,
        payload: {
          chatId: 'chat_1',
          userMessage: 'Hello World',
        },
      });
    });
  });

  it('should not send empty message', async () => {
    const { result } = renderHook(() => useInfiniteMessages('chat_1', mockWorker));

    const postMessageCallsBefore = (mockWorker.postMessage as any).mock.calls.length;

    act(() => {
      result.current.sendMessage('   ');
    });

    // Should not post new message for empty content
    const postMessageCallsAfter = (mockWorker.postMessage as any).mock.calls.length;
    const generateReplyCalls = (mockWorker.postMessage as any).mock.calls.filter(
      (call: any[]) => call[0]?.type === WorkerMessageType.GENERATE_REPLY
    );

    expect(generateReplyCalls).toHaveLength(0);
  });

  it('should load more messages when loadMore is called', async () => {
    const { result } = renderHook(() => useInfiniteMessages('chat_1', mockWorker));

    // Simulate initial load
    const addEventListenerCalls = (mockWorker.addEventListener as any).mock.calls;
    const messageHandler = addEventListenerCalls.find((call: any[]) => call[0] === 'message')?.[1];

    act(() => {
      messageHandler({
        data: {
          type: WorkerMessageType.MESSAGES_LOADED,
          payload: {
            chatId: 'chat_1',
            messages: mockMessages.slice(0, 20),
            hasMore: true,
          },
        },
      });
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(20);
    });

    // Clear previous calls
    vi.clearAllMocks();

    // Load more
    act(() => {
      result.current.loadMore();
    });

    // Should request next page
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: WorkerMessageType.LOAD_MESSAGES_PAGINATED,
      payload: expect.objectContaining({
        offset: 20,
        limit: 20,
      }),
    });
  });

  it('should not load more if already loading', async () => {
    const { result } = renderHook(() => useInfiniteMessages('chat_1', mockWorker));

    // Set loading to true by not resolving worker response
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    const postMessageCallsBefore = (mockWorker.postMessage as any).mock.calls.length;

    act(() => {
      result.current.loadMore();
    });

    const postMessageCallsAfter = (mockWorker.postMessage as any).mock.calls.length;

    // Should not make additional calls while loading
    expect(postMessageCallsAfter).toBe(postMessageCallsBefore);
  });

  it('should reset state when chatId changes', async () => {
    const { result, rerender } = renderHook(
      ({ chatId }) => useInfiniteMessages(chatId, mockWorker),
      {
        initialProps: { chatId: 'chat_1' },
      }
    );

    // Simulate initial load
    const addEventListenerCalls = (mockWorker.addEventListener as any).mock.calls;
    const messageHandler = addEventListenerCalls.find((call: any[]) => call[0] === 'message')?.[1];

    act(() => {
      messageHandler({
        data: {
          type: WorkerMessageType.MESSAGES_LOADED,
          payload: {
            chatId: 'chat_1',
            messages: mockMessages.slice(0, 20),
            hasMore: true,
          },
        },
      });
    });

    await waitFor(() => {
      expect(result.current.messages.length).toBe(20);
    });

    // Change chat
    rerender({ chatId: 'chat_2' });

    await waitFor(() => {
      // Messages should be reset
      expect(result.current.messages.length).toBe(0);
    });
  });

  it('should work without worker (fallback mode)', async () => {
    const { result } = renderHook(() => useInfiniteMessages('chat_1', null));

    // Should load messages directly without worker
    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });
  });

  it('should handle null chatId', async () => {
    const { result } = renderHook(() => useInfiniteMessages(null, mockWorker));

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.hasMore).toBe(true);
  });
});
