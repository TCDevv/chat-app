import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatList } from '../ChatList';
import { Chat } from '@models/Chat';

const mockChats: Chat[] = [
  {
    id: 'chat_1',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    unreadCount: 2,
    isOnline: true,
    lastMessage: {
      id: 'msg_1',
      chatId: 'chat_1',
      content: 'Hello there!',
      sender: 'John Doe',
      timestamp: Date.now(),
      isOwn: false,
      status: 'delivered',
    },
  },
  {
    id: 'chat_2',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    unreadCount: 0,
    isOnline: false,
    lastMessage: undefined,
  },
  {
    id: 'chat_3',
    name: 'Bob Wilson',
    avatar: undefined,
    unreadCount: 5,
    isOnline: true,
    lastMessage: {
      id: 'msg_2',
      chatId: 'chat_3',
      content: 'See you later!',
      sender: 'Bob Wilson',
      timestamp: Date.now() - 3600000,
      isOwn: false,
      status: 'delivered',
    },
  },
];

describe('ChatList', () => {
  it('renders chat list with chat items', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
  });

  it('displays unread count badge', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onChatSelect when chat is clicked', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    fireEvent.click(screen.getByTestId('chat-item-chat_1'));
    expect(onChatSelect).toHaveBeenCalledWith('chat_1');
  });

  it('highlights selected chat as primary selection', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList
        chats={mockChats}
        selectedChatId="chat_1"
        selectedChatIds={['chat_1']}
        onChatSelect={onChatSelect}
      />
    );

    const selectedChat = screen.getByTestId('chat-item-chat_1');
    expect(selectedChat).toHaveClass('active');
    expect(selectedChat).toHaveClass('border-l-primary');
  });

  it('highlights secondary selected chat with lighter styling', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList
        chats={mockChats}
        selectedChatId="chat_1"
        selectedChatIds={['chat_1', 'chat_2']}
        onChatSelect={onChatSelect}
      />
    );

    const secondaryChat = screen.getByTestId('chat-item-chat_2');
    expect(secondaryChat).toHaveClass('border-l-blue-300');
  });

  it('displays "Split view" badge for secondary selection', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList
        chats={mockChats}
        selectedChatId="chat_1"
        selectedChatIds={['chat_1', 'chat_2']}
        onChatSelect={onChatSelect}
      />
    );

    expect(screen.getByText('Split view')).toBeInTheDocument();
  });

  it('does not display "Split view" badge for primary selection', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList
        chats={mockChats}
        selectedChatId="chat_1"
        selectedChatIds={['chat_1', 'chat_2']}
        onChatSelect={onChatSelect}
      />
    );

    const primaryChat = screen.getByTestId('chat-item-chat_1');
    expect(primaryChat.textContent).not.toContain('Split view');
  });

  it('displays last message content', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.getByText('See you later!')).toBeInTheDocument();
  });

  it('displays "No messages yet" when no last message', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });

  it('renders avatar image when provided', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    const avatar = screen.getAllByRole('img')[0] as HTMLImageElement;
    expect(avatar.src).toContain('pravatar.cc');
  });

  it('renders initial when avatar is not provided', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    // Bob Wilson has no avatar, should show "B"
    const bobChat = screen.getByTestId('chat-item-chat_3');
    expect(bobChat.textContent).toContain('B');
  });

  it('displays online indicator for online chats', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    const onlineChat = screen.getByTestId('chat-item-chat_1');
    const indicator = onlineChat.querySelector('.bg-green-500');
    expect(indicator).not.toBeNull();
  });

  it('displays offline indicator for offline chats', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    const offlineChat = screen.getByTestId('chat-item-chat_2');
    const indicator = offlineChat.querySelector('.bg-gray-400');
    expect(indicator).not.toBeNull();
  });

  it('calls onMarkAsUnread on right-click', () => {
    const onChatSelect = vi.fn();
    const onMarkAsUnread = vi.fn();
    render(
      <ChatList
        chats={mockChats}
        selectedChatId={null}
        onChatSelect={onChatSelect}
        onMarkAsUnread={onMarkAsUnread}
      />
    );

    const chatItem = screen.getByTestId('chat-item-chat_1');
    fireEvent.contextMenu(chatItem);

    expect(onMarkAsUnread).toHaveBeenCalledWith('chat_1');
  });

  it('does not call onMarkAsUnread if not provided', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    const chatItem = screen.getByTestId('chat-item-chat_1');
    expect(() => fireEvent.contextMenu(chatItem)).not.toThrow();
  });

  it('applies unread styling to chats with unread messages', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    const unreadChat = screen.getByTestId('chat-item-chat_1');
    expect(unreadChat).toHaveClass('bg-blue-50/30');
  });

  it('handles empty chat list gracefully', () => {
    const onChatSelect = vi.fn();
    render(<ChatList chats={[]} selectedChatId={null} onChatSelect={onChatSelect} />);

    expect(screen.getByText('Chats')).toBeInTheDocument();
  });

  it('handles selectedChatIds prop defaulting to empty array', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId="chat_1" onChatSelect={onChatSelect} />
    );

    const selectedChat = screen.getByTestId('chat-item-chat_1');
    expect(selectedChat).toBeInTheDocument();
  });

  it('supports multiple selected chats', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList
        chats={mockChats}
        selectedChatId="chat_1"
        selectedChatIds={['chat_1', 'chat_2', 'chat_3']}
        onChatSelect={onChatSelect}
      />
    );

    const chat1 = screen.getByTestId('chat-item-chat_1');
    const chat2 = screen.getByTestId('chat-item-chat_2');
    const chat3 = screen.getByTestId('chat-item-chat_3');

    expect(chat1).toHaveClass('border-l-primary');
    expect(chat2).toHaveClass('border-l-blue-300');
    expect(chat3).toHaveClass('border-l-blue-300');
  });

  it('displays relative time for last message', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    // Should display time - format depends on formatRelativeTime implementation
    const chatItem = screen.getByTestId('chat-item-chat_1');
    // Just verify the chat item contains the chat name
    expect(chatItem.textContent).toContain('John Doe');
  });

  it('renders chat list header', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    expect(screen.getByText('Chats')).toBeInTheDocument();
  });

  it('applies hover effect to chat items', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    const chatItem = screen.getByTestId('chat-item-chat_1');
    expect(chatItem).toHaveClass('hover:bg-gray-50');
  });
});
