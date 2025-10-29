import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PostMessageService } from '../PostMessageService';
import type { Message } from '@models/Message';
import { POST_MESSAGE_TYPES, POST_MESSAGE_TARGET_ORIGIN } from '@/constants/app.constants';

describe('PostMessageService', () => {
  let postMessageService: PostMessageService;
  let mockCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    postMessageService = new PostMessageService();
    mockCallback = vi.fn();
  });

  afterEach(() => {
    postMessageService.destroy();
    vi.clearAllMocks();
  });

  describe('init', () => {
    it('should register message event listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      postMessageService.init(mockCallback);

      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should call callback when NEW_MESSAGE received', () => {
      postMessageService.init(mockCallback);

      const mockMessage: Message = {
        id: 'msg_1',
        chatId: 'chat_1',
        content: 'Test message',
        sender: 'User',
        timestamp: Date.now(),
        isOwn: false,
      };

      const event = new MessageEvent('message', {
        data: {
          type: POST_MESSAGE_TYPES.NEW_MESSAGE,
          payload: mockMessage,
        },
      });

      window.dispatchEvent(event);

      expect(mockCallback).toHaveBeenCalledWith(mockMessage);
    });

    it('should not call callback for other message types', () => {
      postMessageService.init(mockCallback);

      const event = new MessageEvent('message', {
        data: {
          type: 'OTHER_TYPE',
          payload: {},
        },
      });

      window.dispatchEvent(event);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle events with no data', () => {
      postMessageService.init(mockCallback);

      const event = new MessageEvent('message', {
        data: null,
      });

      window.dispatchEvent(event);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle events with no type', () => {
      postMessageService.init(mockCallback);

      const event = new MessageEvent('message', {
        data: {
          payload: {},
        },
      });

      window.dispatchEvent(event);

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should post message with correct structure', () => {
      const postMessageSpy = vi.spyOn(window, 'postMessage');

      const mockMessage: Message = {
        id: 'msg_1',
        chatId: 'chat_1',
        content: 'Test message',
        sender: 'You',
        timestamp: Date.now(),
        isOwn: true,
      };

      postMessageService.sendMessage(mockMessage);

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: POST_MESSAGE_TYPES.NEW_MESSAGE,
          payload: mockMessage,
        },
        POST_MESSAGE_TARGET_ORIGIN
      );

      postMessageSpy.mockRestore();
    });

    it('should use correct target origin', () => {
      const postMessageSpy = vi.spyOn(window, 'postMessage');

      const mockMessage: Message = {
        id: 'msg_1',
        chatId: 'chat_1',
        content: 'Test',
        sender: 'You',
        timestamp: Date.now(),
        isOwn: true,
      };

      postMessageService.sendMessage(mockMessage);

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.any(Object),
        POST_MESSAGE_TARGET_ORIGIN
      );

      postMessageSpy.mockRestore();
    });
  });

  describe('destroy', () => {
    it('should remove event listener', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      postMessageService.init(mockCallback);
      postMessageService.destroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should not call callback after destroy', () => {
      postMessageService.init(mockCallback);
      postMessageService.destroy();

      const mockMessage: Message = {
        id: 'msg_1',
        chatId: 'chat_1',
        content: 'Test message',
        sender: 'User',
        timestamp: Date.now(),
        isOwn: false,
      };

      const event = new MessageEvent('message', {
        data: {
          type: POST_MESSAGE_TYPES.NEW_MESSAGE,
          payload: mockMessage,
        },
      });

      window.dispatchEvent(event);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle multiple destroy calls safely', () => {
      postMessageService.init(mockCallback);
      postMessageService.destroy();
      postMessageService.destroy(); // Second call

      // Should not throw error
      expect(true).toBe(true);
    });

    it('should handle destroy without init', () => {
      // Call destroy without init
      postMessageService.destroy();

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('multiple instances', () => {
    it('should allow multiple service instances', () => {
      const service1 = new PostMessageService();
      const service2 = new PostMessageService();

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      service1.init(callback1);
      service2.init(callback2);

      const mockMessage: Message = {
        id: 'msg_1',
        chatId: 'chat_1',
        content: 'Test message',
        sender: 'User',
        timestamp: Date.now(),
        isOwn: false,
      };

      const event = new MessageEvent('message', {
        data: {
          type: POST_MESSAGE_TYPES.NEW_MESSAGE,
          payload: mockMessage,
        },
      });

      window.dispatchEvent(event);

      expect(callback1).toHaveBeenCalledWith(mockMessage);
      expect(callback2).toHaveBeenCalledWith(mockMessage);

      service1.destroy();
      service2.destroy();
    });
  });
});
