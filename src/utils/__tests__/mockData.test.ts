import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MOCK_CHATS, generateMockMessages, initializeMockData } from '../mockData';
import { STORAGE_KEYS } from '@/constants/app.constants';

describe('mockData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('MOCK_CHATS', () => {
    it('should have 5 mock chats', () => {
      expect(MOCK_CHATS).toHaveLength(5);
    });

    it('should have proper chat structure', () => {
      MOCK_CHATS.forEach((chat) => {
        expect(chat).toHaveProperty('id');
        expect(chat).toHaveProperty('name');
        expect(chat).toHaveProperty('avatar');
        expect(chat).toHaveProperty('unreadCount');
        expect(chat).toHaveProperty('isOnline');
      });
    });
  });

  describe('generateMockMessages', () => {
    it('should generate specified number of messages', () => {
      const messages = generateMockMessages('chat_1', 10);
      expect(messages).toHaveLength(10);
    });

    it('should generate messages with correct structure', () => {
      const messages = generateMockMessages('chat_1', 5);

      messages.forEach((message) => {
        expect(message).toHaveProperty('id');
        expect(message).toHaveProperty('chatId');
        expect(message).toHaveProperty('content');
        expect(message).toHaveProperty('sender');
        expect(message).toHaveProperty('timestamp');
        expect(message).toHaveProperty('isOwn');
        expect(message).toHaveProperty('status');
      });
    });

    it('should assign correct chatId to all messages', () => {
      const chatId = 'test_chat';
      const messages = generateMockMessages(chatId, 5);

      messages.forEach((message) => {
        expect(message.chatId).toBe(chatId);
      });
    });

    it('should alternate message ownership', () => {
      const messages = generateMockMessages('chat_1', 6);

      expect(messages[0].isOwn).toBe(true); // 0 % 3 === 0
      expect(messages[1].isOwn).toBe(false); // 1 % 3 !== 0
      expect(messages[2].isOwn).toBe(false); // 2 % 3 !== 0
      expect(messages[3].isOwn).toBe(true); // 3 % 3 === 0
    });

    it('should have incrementing timestamps', () => {
      const messages = generateMockMessages('chat_1', 5);

      for (let i = 1; i < messages.length; i++) {
        expect(messages[i].timestamp).toBeGreaterThan(messages[i - 1].timestamp);
      }
    });

    it('should use correct sender names', () => {
      const messages = generateMockMessages('chat_1', 3);

      expect(messages[0].sender).toBe('You'); // isOwn = true
      expect(messages[1].sender).toMatch(/^User \d+$/); // isOwn = false
    });

    it('should handle empty count', () => {
      const messages = generateMockMessages('chat_1', 0);
      expect(messages).toHaveLength(0);
    });

    it('should set all messages to DELIVERED status', () => {
      const messages = generateMockMessages('chat_1', 5);

      messages.forEach((message) => {
        expect(message.status).toBe('delivered');
      });
    });
  });

  describe('initializeMockData', () => {
    it('should initialize chats in localStorage when none exist', () => {
      initializeMockData();

      const chatsData = localStorage.getItem(STORAGE_KEYS.CHATS);
      expect(chatsData).not.toBeNull();

      if (chatsData) {
        const chats = JSON.parse(chatsData);
        expect(chats).toHaveLength(5);
      }
    });

    it('should initialize messages in localStorage when none exist', () => {
      initializeMockData();

      const messagesData = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      expect(messagesData).not.toBeNull();

      if (messagesData) {
        const messages = JSON.parse(messagesData);
        expect(messages.length).toBeGreaterThan(0);
      }
    });

    it('should add lastMessage to each chat', () => {
      initializeMockData();

      const chatsData = localStorage.getItem(STORAGE_KEYS.CHATS);
      expect(chatsData).not.toBeNull();

      if (chatsData) {
        const chats = JSON.parse(chatsData);

        chats.forEach((chat: any) => {
          expect(chat).toHaveProperty('lastMessage');
          expect(chat.lastMessage).toHaveProperty('id');
          expect(chat.lastMessage).toHaveProperty('content');
        });
      }
    });

    it('should not overwrite existing chats', () => {
      const existingChats = [{ id: 'custom_chat', name: 'Custom' }];
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(existingChats));

      initializeMockData();

      const chatsData = localStorage.getItem(STORAGE_KEYS.CHATS);
      if (chatsData) {
        const chats = JSON.parse(chatsData);
        expect(chats).toEqual(existingChats);
      }
    });

    it('should not overwrite existing messages', () => {
      const existingMessages = [{ id: 'msg_1', content: 'Test' }];
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(existingMessages));

      initializeMockData();

      const messagesData = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (messagesData) {
        const messages = JSON.parse(messagesData);
        expect(messages).toEqual(existingMessages);
      }
    });

    it('should generate 1000 messages per chat', () => {
      initializeMockData();

      const messagesData = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      expect(messagesData).not.toBeNull();

      if (messagesData) {
        const messages = JSON.parse(messagesData);
        // 5 chats * 1000 messages each = 5000 total
        expect(messages).toHaveLength(5000);
      }
    });

    it('should correctly associate messages with chats', () => {
      initializeMockData();

      const messagesData = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      expect(messagesData).not.toBeNull();

      if (messagesData) {
        const messages = JSON.parse(messagesData);

        const chat1Messages = messages.filter((m: any) => m.chatId === 'chat_1');
        expect(chat1Messages).toHaveLength(1000);

        const chat2Messages = messages.filter((m: any) => m.chatId === 'chat_2');
        expect(chat2Messages).toHaveLength(1000);
      }
    });
  });
});
