import { useState, useEffect, useCallback } from 'react';
import { ChatList } from '@components/ChatList/ChatList';
import { ChatPane } from '@components/ChatPane/ChatPane';
import { container as diContainer } from '@di/container';
import { TYPES } from '@di/types';
import type { IPostMessageService } from '@services/interfaces/IPostMessageService';
import type { IMessageService } from '@services/interfaces/IMessageService';
import type { Chat } from '@models/Chat';
import { WorkerMessageType, DEFAULT_VALUES } from '@constants/app.constants';
import { CHAT_LAYOUT } from '../../constants/ui.constants';
import { QUERY_PARAMS } from '../../constants/dom.constants';
import TransportWorker from '@workers/transport.worker?worker';

const MAX_OPEN_CHATS = 2;

export const ChatLayout = () => {
  // Support up to 2 selected chat IDs
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  // Load chats list directly from MessageService (don't use worker to avoid conflicts)
  useEffect(() => {
    const messageService = diContainer.get<IMessageService>(TYPES.MessageService);
    const initialChats = messageService.getChats();
    setChats(initialChats);

    // Subscribe to chat updates
    const unsubscribe = messageService.subscribeToChats((updatedChats) => {
      setChats(updatedChats);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const selectedChats = selectedChatIds
    .map(id => chats.find(chat => chat.id === id))
    .filter(Boolean);

  // Handle chat selection with replacement logic
  // Always show the 2 most recently selected chats
  const handleChatSelect = useCallback((chatId: string) => {
    setSelectedChatIds(prev => {
      // If chat is already selected, don't add it again
      if (prev.includes(chatId)) {
        return prev;
      }

      // If we have less than MAX_OPEN_CHATS, just add it
      if (prev.length < MAX_OPEN_CHATS) {
        return [...prev, chatId];
      }

      // Replace the leftmost (oldest) chat with the new one
      // This keeps the most recent 2 selections
      return [prev[1], chatId];
    });
  }, []);

  // Handle closing a chat pane
  const handleCloseChat = useCallback((chatId: string) => {
    setSelectedChatIds(prev => prev.filter(id => id !== chatId));
  }, []);

  // Auto-select chat if messageId is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get(QUERY_PARAMS.MESSAGE_ID);

    if (messageId && chats.length > 0 && selectedChatIds.length === 0) {
      // Find which chat contains this message
      const messageService = diContainer.get<IMessageService>(TYPES.MessageService);

      for (const chat of chats) {
        const chatMessages = messageService.getMessages(chat.id);
        const foundMessage = chatMessages.find(msg => msg.id === messageId);

        if (foundMessage) {
          console.log('Auto-selecting chat:', chat.id, 'for message:', messageId);
          handleChatSelect(chat.id);
          break;
        }
      }
    }
  }, [chats, selectedChatIds, handleChatSelect]);

  const handleMarkAsUnread = useCallback((chatId: string) => {
    const messageService = diContainer.get<IMessageService>(TYPES.MessageService);
    messageService.markAsUnread(chatId, DEFAULT_VALUES.UNREAD_COUNT);
  }, []);

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
        {/* Left Navigation */}
        <div className="w-full md:w-1/3 lg:w-1/4 p-0 h-screen border-r border-gray-200">
          <ChatList
            chats={chats}
            selectedChatId={selectedChatIds[0] || null}
            selectedChatIds={selectedChatIds}
            onChatSelect={handleChatSelect}
            onMarkAsUnread={handleMarkAsUnread}
          />
        </div>

        {/* Right Content Area - Dual Chat Display */}
        <div className="w-full md:w-2/3 lg:w-3/4 p-0 h-screen">
          {selectedChatIds.length === 0 ? (
            // Welcome Screen
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50">
              <h4 className="text-xl font-semibold mb-4">{CHAT_LAYOUT.WELCOME_TEXT}</h4>
              <p>{CHAT_LAYOUT.WELCOME_SUBTITLE}</p>
            </div>
          ) : selectedChatIds.length === 1 ? (
            // Single Chat Display
            <ChatPane
              key={selectedChatIds[0]}
              chatId={selectedChatIds[0]}
              chat={selectedChats[0]}
              worker={worker}
            />
          ) : (
            // Dual Chat Display
            <div className="h-full flex">
              {/* Left Chat Pane */}
              <div className="w-1/2 h-full border-r border-gray-300">
                <ChatPane
                  key={selectedChatIds[0]}
                  chatId={selectedChatIds[0]}
                  chat={selectedChats[0]}
                  worker={worker}
                  onClose={() => handleCloseChat(selectedChatIds[0])}
                  showCloseButton
                />
              </div>

              {/* Right Chat Pane */}
              <div className="w-1/2 h-full">
                <ChatPane
                  key={selectedChatIds[1]}
                  chatId={selectedChatIds[1]}
                  chat={selectedChats[1]}
                  worker={worker}
                  onClose={() => handleCloseChat(selectedChatIds[1])}
                  showCloseButton
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
