import { useState, useEffect, useMemo } from 'react';
import type { Message } from '@models/Message';
import type { Chat } from '@models/Chat';
import { container } from '@di/container';
import { TYPES } from '@di/types';
import type { IMessageService } from '@services/interfaces/IMessageService';

export const useMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const messageService = useMemo(() => container.get<IMessageService>(TYPES.MessageService), []);

  useEffect(() => {
    // Load initial chats
    const initialChats = messageService.getChats();
    setChats(initialChats);

    // Subscribe to chat updates
    const unsubscribeChats = messageService.subscribeToChats((updatedChats) => {
      setChats(updatedChats);
    });

    return () => {
      unsubscribeChats();
    };
  }, [messageService]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Load messages for selected chat
    const chatMessages = messageService.getMessages(chatId);
    setMessages(chatMessages);
    setLoading(false);

    // Mark chat as read
    messageService.markAsRead(chatId);

    // Subscribe to new messages
    const unsubscribe = messageService.subscribeToMessages((newMessage) => {
      if (newMessage.chatId === chatId) {
        setMessages((prev) => [...prev, newMessage]);
        messageService.markAsRead(chatId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, messageService]);

  const sendMessage = (content: string) => {
    if (!chatId || !content.trim()) return;

    messageService.sendMessage({
      content,
      chatId,
      sender: 'You',
    });
  };

  return {
    messages,
    chats,
    loading,
    sendMessage,
  };
};
