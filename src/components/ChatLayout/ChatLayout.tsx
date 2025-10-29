import { useState, useEffect } from 'react';
import { ChatList } from '@components/ChatList/ChatList';
import { MessageAreaInfinite } from '@components/MessageArea/MessageAreaInfinite';
import { MessageInput } from '@components/MessageInput/MessageInput';
import { useInfiniteMessages } from '@hooks/useInfiniteMessages';
import { container as diContainer } from '@di/container';
import { TYPES } from '@di/types';
import type { IPostMessageService } from '@services/interfaces/IPostMessageService';
import type { IMessageService } from '@services/interfaces/IMessageService';
import { WorkerMessageType, DEFAULT_VALUES } from '@constants/app.constants';
import { CHAT_LAYOUT } from '../../constants/ui.constants';
import { QUERY_PARAMS } from '../../constants/dom.constants';
import TransportWorker from '@workers/transport.worker?worker';

export const ChatLayout = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const { messages, chats, loading, hasMore, sendMessage, loadMore } = useInfiniteMessages(
    selectedChatId,
    worker
  );

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  // Auto-select chat if messageId is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get(QUERY_PARAMS.MESSAGE_ID);

    if (messageId && chats.length > 0 && !selectedChatId) {
      // Find which chat contains this message
      const messageService = diContainer.get<IMessageService>(TYPES.MessageService);

      for (const chat of chats) {
        const chatMessages = messageService.getMessages(chat.id);
        const foundMessage = chatMessages.find(msg => msg.id === messageId);

        if (foundMessage) {
          console.log('Auto-selecting chat:', chat.id, 'for message:', messageId);
          setSelectedChatId(chat.id);
          break;
        }
      }
    }
  }, [chats, selectedChatId]);

  const handleMarkAsUnread = (chatId: string) => {
    const messageService = diContainer.get<IMessageService>(TYPES.MessageService);
    messageService.markAsUnread(chatId, DEFAULT_VALUES.UNREAD_COUNT);
  };

  // Initialize PostMessage service
  useEffect(() => {
    const postMessageService = diContainer.get<IPostMessageService>(TYPES.PostMessageService);
    const messageService = diContainer.get<IMessageService>(TYPES.MessageService);

    postMessageService.init((message) => {
      messageService.addMessage(message);
    });

    return () => {
      postMessageService.destroy();
    };
  }, []);

  // Initialize Web Worker
  useEffect(() => {
    const transportWorker = new TransportWorker();

    transportWorker.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === WorkerMessageType.MOCK_REPLY) {
        const messageService = diContainer.get<IMessageService>(TYPES.MessageService);
        messageService.addMessage(payload);
      }
    };

    setWorker(transportWorker);

    return () => {
      transportWorker.terminate();
    };
  }, []);

  return (
    <div className="h-screen w-screen p-0 m-0">
      <div className="h-full flex">
        <div className="w-full md:w-1/3 lg:w-1/4 p-0 h-screen">
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onChatSelect={setSelectedChatId}
            onMarkAsUnread={handleMarkAsUnread}
          />
        </div>
        <div className="w-full md:w-2/3 lg:w-3/4 p-0 h-screen">
          {selectedChatId ? (
            <div className="h-full flex flex-col">
              <MessageAreaInfinite
                messages={messages}
                chatName={selectedChat?.name}
                isOnline={selectedChat?.isOnline}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={loadMore}
              />
              <MessageInput
                onSendMessage={sendMessage}
                disabled={loading || !selectedChatId}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <h4 className="text-xl font-semibold mb-4">{CHAT_LAYOUT.WELCOME_TEXT}</h4>
              <p>{CHAT_LAYOUT.WELCOME_SUBTITLE}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
