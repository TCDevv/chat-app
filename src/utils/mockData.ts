import { MessageStatus, STORAGE_KEYS, ID_PREFIX, DEFAULT_VALUES } from '@/constants/app.constants';
import { TIME } from '../constants/layout.constants';
import { USER } from '../constants/ui.constants';
import { Chat } from '@models/Chat';
import { Message } from '@models/Message';

export const MOCK_CHATS: Chat[] = [
  {
    id: 'chat_1',
    name: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    unreadCount: 5,
    isOnline: true,
  },
  {
    id: 'chat_2',
    name: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: 'chat_3',
    name: 'Team Development',
    avatar: 'https://i.pravatar.cc/150?img=3',
    unreadCount: 2,
    isOnline: false,
  },
  {
    id: 'chat_4',
    name: 'Alice Johnson',
    avatar: 'https://i.pravatar.cc/150?img=4',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: 'chat_5',
    name: 'Bob Wilson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    unreadCount: 1,
    isOnline: false,
  },
];

export const generateMockMessages = (chatId: string, count: number): Message[] => {
  const messages: Message[] = [];
  const startTime = Date.now() - count * TIME.MOCK_MESSAGE_INTERVAL_MS; // Start from 'count' minutes ago

  for (let i = 0; i < count; i++) {
    const isOwn = i % 3 === 0;
    messages.push({
      id: `${ID_PREFIX.MESSAGE}${chatId}_${i}`,
      chatId,
      content: `Message ${i + 1}: ${isOwn ? 'This is my message' : 'This is a received message'}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      sender: isOwn ? USER.DEFAULT_SENDER_NAME : `User ${(i % 5) + 1}`,
      timestamp: startTime + i * TIME.MOCK_MESSAGE_INTERVAL_MS,
      isOwn,
      status: MessageStatus.DELIVERED,
    });
  }

  return messages;
};

export const initializeMockData = (): void => {
  const existingChats = localStorage.getItem(STORAGE_KEYS.CHATS);
  const existingMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES);

  if (!existingChats) {
    const chatsWithMessages = MOCK_CHATS.map((chat) => {
      const messages = generateMockMessages(chat.id, DEFAULT_VALUES.MOCK_MESSAGES_PER_CHAT);
      const lastMessage = messages[messages.length - 1];
      return {
        ...chat,
        lastMessage,
      };
    });

    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chatsWithMessages));
  }

  if (!existingMessages) {
    const allMessages: Message[] = [];
    MOCK_CHATS.forEach((chat) => {
      const messages = generateMockMessages(chat.id, DEFAULT_VALUES.MOCK_MESSAGES_PER_CHAT);
      allMessages.push(...messages);
    });

    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
  }
};
