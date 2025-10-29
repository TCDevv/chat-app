import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '../MessageInput';

describe('MessageInput', () => {
  it('renders message input and send button', () => {
    const onSendMessage = vi.fn();
    render(<MessageInput onSendMessage={onSendMessage} />);

    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('calls onSendMessage with message content when send button is clicked', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    await user.type(input, 'Hello, World!');
    await user.click(sendButton);

    expect(onSendMessage).toHaveBeenCalledWith('Hello, World!');
  });

  it('clears input after sending message', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId('message-input') as HTMLTextAreaElement;

    await user.type(input, 'Test message');
    await user.click(screen.getByTestId('send-button'));

    expect(input.value).toBe('');
  });

  it('does not send empty messages', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={onSendMessage} />);

    await user.click(screen.getByTestId('send-button'));

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it('trims whitespace from messages', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId('message-input');

    await user.type(input, '  Test message  ');
    await user.click(screen.getByTestId('send-button'));

    expect(onSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('disables input and button when disabled prop is true', () => {
    const onSendMessage = vi.fn();
    render(<MessageInput onSendMessage={onSendMessage} disabled={true} />);

    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('sends message on Enter key press', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();

    render(<MessageInput onSendMessage={onSendMessage} />);

    const input = screen.getByTestId('message-input');

    await user.type(input, 'Test message{Enter}');

    expect(onSendMessage).toHaveBeenCalledWith('Test message');
  });
});
