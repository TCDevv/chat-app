import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageArea } from '../MessageArea';
import { Message } from '@models/Message';

// Mock react-window
vi.mock('react-window', () => ({
  FixedSizeList: ({ children, itemData, itemCount }: any) => (
    <div data-testid="messages-list">
      {itemData.map((item: Message, index: number) =>
        <div key={item.id}>{children({ index, style: {}, data: itemData })}</div>
      )}
    </div>
  ),
}));

const mockMessages: Message[] = [
  {
    id: 'msg_1',
    chatId: 'chat_1',
    content: 'Hello!',
    sender: 'John Doe',
    timestamp: Date.now(),
    isOwn: false,
  },
  {
    id: 'msg_2',
    chatId: 'chat_1',
    content: 'Hi there!',
    sender: 'You',
    timestamp: Date.now(),
    isOwn: true,
    status: 'sent',
  },
];

describe('MessageArea', () => {
  beforeEach(() => {
    // Mock window.innerHeight
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  it('renders messages', () => {
    render(<MessageArea messages={mockMessages} chatName="John Doe" />);

    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('displays chat name in header', () => {
    render(<MessageArea messages={mockMessages} chatName="John Doe" />);

    const header = screen.getByRole('heading', { name: 'John Doe' });
    expect(header).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    render(<MessageArea messages={[]} chatName="John Doe" />);

    expect(screen.getByText('No messages yet. Start the conversation!')).toBeInTheDocument();
  });

  it('displays sender name for received messages', () => {
    render(<MessageArea messages={mockMessages} chatName="Test Chat" />);

    // Check for sender name in message (not in header)
    const senderElements = screen.getAllByText('John Doe');
    expect(senderElements.length).toBeGreaterThan(0);
  });

  it('displays message status for own messages', () => {
    render(<MessageArea messages={mockMessages} chatName="John Doe" />);

    expect(screen.getByText('sent')).toBeInTheDocument();
  });

  it('applies correct CSS class for own messages', () => {
    render(<MessageArea messages={mockMessages} chatName="John Doe" />);

    const ownMessage = screen.getByTestId('message-msg_2');
    // Check that the message has proper alignment class
    expect(ownMessage).toHaveClass('ml-auto');
  });

  it('applies correct CSS class for received messages', () => {
    render(<MessageArea messages={mockMessages} chatName="John Doe" />);

    const receivedMessage = screen.getByTestId('message-msg_1');
    // Check that the message has proper alignment class
    expect(receivedMessage).toHaveClass('mr-auto');
  });
});
