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
    lastMessage: {
      id: 'msg_1',
      chatId: 'chat_1',
      content: 'Hello there!',
      sender: 'John Doe',
      timestamp: Date.now(),
      isOwn: false,
    },
  },
  {
    id: 'chat_2',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    unreadCount: 0,
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
  });

  it('displays unread count badge', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onChatSelect when chat is clicked', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    fireEvent.click(screen.getByTestId('chat-item-chat_1'));
    expect(onChatSelect).toHaveBeenCalledWith('chat_1');
  });

  it('highlights selected chat', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId="chat_1" onChatSelect={onChatSelect} />
    );

    const selectedChat = screen.getByTestId('chat-item-chat_1');
    expect(selectedChat).toHaveClass('active');
  });

  it('displays last message content', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    expect(screen.getByText('Hello there!')).toBeInTheDocument();
  });

  it('displays "No messages yet" when no last message', () => {
    const onChatSelect = vi.fn();
    render(
      <ChatList chats={mockChats} selectedChatId={null} onChatSelect={onChatSelect} />
    );

    expect(screen.getByText('No messages yet')).toBeInTheDocument();
  });
});
