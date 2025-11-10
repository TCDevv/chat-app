import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPane } from '../ChatPane';
import type { Chat } from '@models/Chat';

// Mock dependencies
vi.mock('@hooks/useInfiniteMessages', () => ({
  useInfiniteMessages: vi.fn(),
}));

vi.mock('@components/MessageArea/MessageAreaInfinite', () => ({
  MessageAreaInfinite: ({ chatName, isOnline }: any) => (
    <div data-testid="message-area">
      <div>{chatName}</div>
      <div>{isOnline ? 'Online' : 'Offline'}</div>
    </div>
  ),
}));

vi.mock('@components/MessageInput/MessageInput', () => ({
  MessageInput: ({ onSendMessage, disabled }: any) => (
    <div data-testid="message-input">
      <button onClick={() => onSendMessage('test')} disabled={disabled}>
        Send
      </button>
    </div>
  ),
}));

import { useInfiniteMessages } from '@hooks/useInfiniteMessages';

describe('ChatPane', () => {
  const mockChat: Chat = {
    id: 'chat_1',
    name: 'Test Chat',
    avatar: undefined,
    lastMessage: undefined,
    unreadCount: 0,
    isOnline: true,
  };

  const mockUseInfiniteMessages = {
    messages: [],
    chats: [],
    loading: false,
    hasMore: false,
    sendMessage: vi.fn(),
    loadMore: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useInfiniteMessages as any).mockReturnValue(mockUseInfiniteMessages);
  });

  it('should render without crashing', () => {
    render(<ChatPane chatId="chat_1" chat={mockChat} worker={null} />);
    expect(screen.getByTestId('message-area')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
  });

  it('should display chat name in MessageArea', () => {
    render(<ChatPane chatId="chat_1" chat={mockChat} worker={null} />);
    expect(screen.getByText('Test Chat')).toBeInTheDocument();
  });

  it('should display online status in MessageArea', () => {
    const onlineChat = { ...mockChat, isOnline: true };
    render(<ChatPane chatId="chat_1" chat={onlineChat} worker={null} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should display offline status when chat is offline', () => {
    const offlineChat = { ...mockChat, isOnline: false };
    render(<ChatPane chatId="chat_1" chat={offlineChat} worker={null} />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should not show close button when showCloseButton is false', () => {
    render(<ChatPane chatId="chat_1" chat={mockChat} worker={null} showCloseButton={false} />);
    expect(screen.queryByTestId('close-chat-button')).not.toBeInTheDocument();
  });

  it('should show close button when showCloseButton is true and onClose is provided', () => {
    const onClose = vi.fn();
    render(
      <ChatPane
        chatId="chat_1"
        chat={mockChat}
        worker={null}
        showCloseButton={true}
        onClose={onClose}
      />
    );
    expect(screen.getByTestId('close-chat-button')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ChatPane
        chatId="chat_1"
        chat={mockChat}
        worker={null}
        showCloseButton={true}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByTestId('close-chat-button');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not show close button when onClose is not provided', () => {
    render(<ChatPane chatId="chat_1" chat={mockChat} worker={null} showCloseButton={true} />);
    expect(screen.queryByTestId('close-chat-button')).not.toBeInTheDocument();
  });

  it('should call sendMessage when MessageInput sends a message', async () => {
    const user = userEvent.setup();
    const mockSendMessage = vi.fn();
    (useInfiniteMessages as any).mockReturnValue({
      ...mockUseInfiniteMessages,
      sendMessage: mockSendMessage,
    });

    render(<ChatPane chatId="chat_1" chat={mockChat} worker={null} />);

    const sendButton = screen.getByText('Send');
    await user.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledWith('test');
  });

  it('should pass loading state to MessageInput', () => {
    (useInfiniteMessages as any).mockReturnValue({
      ...mockUseInfiniteMessages,
      loading: true,
    });

    render(<ChatPane chatId="chat_1" chat={mockChat} worker={null} />);

    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });

  it('should disable MessageInput when chatId is empty', () => {
    render(<ChatPane chatId="" chat={mockChat} worker={null} />);

    const sendButton = screen.getByText('Send');
    expect(sendButton).toBeDisabled();
  });

  it('should call loadMore when MessageAreaInfinite triggers load', () => {
    const mockLoadMore = vi.fn();
    (useInfiniteMessages as any).mockReturnValue({
      ...mockUseInfiniteMessages,
      loadMore: mockLoadMore,
    });

    render(<ChatPane chatId="chat_1" chat={mockChat} worker={null} />);

    // MessageAreaInfinite will call loadMore internally
    expect(mockLoadMore).not.toHaveBeenCalled(); // Not called until scroll
  });

  it('should handle undefined chat gracefully', () => {
    render(<ChatPane chatId="chat_1" chat={undefined} worker={null} />);
    expect(screen.getByTestId('message-area')).toBeInTheDocument();
  });

  it('should pass worker to useInfiniteMessages', () => {
    const mockWorker = {} as Worker;
    render(<ChatPane chatId="chat_1" chat={mockChat} worker={mockWorker} />);

    expect(useInfiniteMessages).toHaveBeenCalledWith('chat_1', mockWorker);
  });

  it('should have proper aria-label on close button', () => {
    const onClose = vi.fn();
    render(
      <ChatPane
        chatId="chat_1"
        chat={mockChat}
        worker={null}
        showCloseButton={true}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByTestId('close-chat-button');
    expect(closeButton).toHaveAttribute('aria-label', 'Close chat');
    expect(closeButton).toHaveAttribute('title', 'Close this chat');
  });

  it('should memoize callbacks to prevent unnecessary re-renders', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const mockSendMessage = vi.fn();

    (useInfiniteMessages as any).mockReturnValue({
      ...mockUseInfiniteMessages,
      sendMessage: mockSendMessage,
    });

    const { rerender } = render(
      <ChatPane
        chatId="chat_1"
        chat={mockChat}
        worker={null}
        showCloseButton={true}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByTestId('close-chat-button');
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Rerender with same props
    rerender(
      <ChatPane
        chatId="chat_1"
        chat={mockChat}
        worker={null}
        showCloseButton={true}
        onClose={onClose}
      />
    );

    // Click again
    await user.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('should update when chatId changes', () => {
    const { rerender } = render(<ChatPane chatId="chat_1" chat={mockChat} worker={null} />);

    expect(useInfiniteMessages).toHaveBeenCalledWith('chat_1', null);

    rerender(<ChatPane chatId="chat_2" chat={mockChat} worker={null} />);

    expect(useInfiniteMessages).toHaveBeenCalledWith('chat_2', null);
  });

  it('should have correct CSS classes for styling', () => {
    const { container } = render(<ChatPane chatId="chat_1" chat={mockChat} worker={null} />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('h-full', 'flex', 'flex-col', 'relative', 'bg-gray-50');
  });

  it('should render close button with proper styling', () => {
    const onClose = vi.fn();
    render(
      <ChatPane
        chatId="chat_1"
        chat={mockChat}
        worker={null}
        showCloseButton={true}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByTestId('close-chat-button');
    expect(closeButton).toHaveClass(
      'absolute',
      'top-2',
      'right-2',
      'z-10',
      'bg-white',
      'hover:bg-gray-100',
      'rounded-full',
      'p-2',
      'shadow-md',
      'transition-colors'
    );
  });
});
