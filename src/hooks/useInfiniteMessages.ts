import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Message } from '@models/Message';
import type { Chat } from '@models/Chat';
import { container } from '@di/container';
import { TYPES } from '@di/types';
import type { IMessageService } from '@services/interfaces/IMessageService';
import { MESSAGES_PER_PAGE, WorkerMessageType } from '@constants/app.constants';
import { USER } from '../constants/ui.constants';
import { QUERY_PARAMS } from '../constants/dom.constants';

export const useInfiniteMessages = (chatId: string | null, worker: Worker | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const messageService = useMemo(() => container.get<IMessageService>(TYPES.MessageService), []);

  // Define loadMoreMessages before it's used
  const loadMoreMessages = useCallback((currentChatId: string, currentOffset: number) => {
    setLoading(true);

    const totalMessages = messageService.getTotalMessageCount(currentChatId);
    const allMessages = messageService.getMessages(currentChatId);

    if (worker) {
      // Request paginated load via worker (include chatId)
      worker.postMessage({
        type: WorkerMessageType.LOAD_MESSAGES_PAGINATED,
        payload: {
          chatId: currentChatId,
          messages: allMessages,
          offset: currentOffset,
          limit: MESSAGES_PER_PAGE,
        },
      });
    } else {
      // Fallback without worker
      const newMessages = messageService.getMessagesPaginated(currentChatId, currentOffset, MESSAGES_PER_PAGE);
      setMessages((prev) => [...newMessages, ...prev]);
      setHasMore(currentOffset + MESSAGES_PER_PAGE < totalMessages);
      setOffset(currentOffset + MESSAGES_PER_PAGE);
      setLoading(false);
    }
  }, [messageService, worker]);

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

  // Set up worker message handler
  useEffect(() => {
    if (!worker || !chatId) return;

    const handler = (event: MessageEvent) => {
      const payload = event.data.payload;

      // Filter messages by chatId - only process if it matches this hook's chatId
      if (event.data.type === WorkerMessageType.MESSAGES_LOADED) {
        if (payload.chatId !== chatId) return; // Ignore messages for other chats

        const { messages: loadedMessages, hasMore: more } = payload;
        setMessages((prev) => [...loadedMessages, ...prev]);
        setHasMore(more);
        setOffset((prevOffset) => prevOffset + MESSAGES_PER_PAGE);
        setLoading(false);
      } else if (event.data.type === WorkerMessageType.ALL_MESSAGES_LOADED) {
        if (payload.chatId !== chatId) return; // Ignore messages for other chats

        const { messages: loadedMessages, hasMore: more } = payload;
        console.log('All messages loaded from worker:', loadedMessages.length);
        setMessages(loadedMessages);
        setHasMore(more);
        setOffset(loadedMessages.length);
        setLoading(false);
      }
    };

    worker.addEventListener('message', handler);

    return () => {
      worker.removeEventListener('message', handler);
    };
  }, [worker, chatId]);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setLoading(false);
      setHasMore(true);
      setOffset(0);
      return;
    }

    // Reset state when chat changes
    setMessages([]);
    setOffset(0);
    setHasMore(true);

    // Check if there's a messageId in URL - if so, load ALL messages
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get(QUERY_PARAMS.MESSAGE_ID);

    if (messageId) {
      console.log('MessageId detected in URL:', messageId, '- Loading all messages for chat:', chatId);
      setLoading(true);

      const allMessages = messageService.getMessages(chatId);

      if (worker) {
        // Use worker to load all messages (include chatId)
        worker.postMessage({
          type: WorkerMessageType.LOAD_ALL_MESSAGES,
          payload: {
            chatId,
            messages: allMessages,
          },
        });
      } else {
        // Fallback without worker - load all messages directly
        console.log('Loading all messages directly (no worker):', allMessages.length);
        setMessages(allMessages);
        setHasMore(false);
        setOffset(allMessages.length);
        setLoading(false);
      }
    } else {
      // Normal paginated load
      loadMoreMessages(chatId, 0);
    }

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
  }, [chatId, messageService, loadMoreMessages, worker]);

  const sendMessage = useCallback((content: string) => {
    if (!chatId || !content.trim()) return;

    messageService.sendMessage({
      content,
      chatId,
      sender: USER.DEFAULT_SENDER_NAME,
    });

    // Trigger mock reply via worker
    if (worker) {
      worker.postMessage({
        type: WorkerMessageType.GENERATE_REPLY,
        payload: {
          chatId,
          userMessage: content,
        },
      });
    }
  }, [chatId, messageService, worker]);

  const loadMore = useCallback(() => {
    if (chatId && hasMore && !loading) {
      loadMoreMessages(chatId, offset);
    }
  }, [chatId, hasMore, loading, offset, loadMoreMessages]);

  return {
    messages,
    chats,
    loading,
    hasMore,
    sendMessage,
    loadMore,
  };
};
