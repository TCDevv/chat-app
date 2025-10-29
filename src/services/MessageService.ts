import { injectable, inject } from 'inversify';
import type { IMessageService } from './interfaces/IMessageService';
import type { ILocalStorageService } from './interfaces/ILocalStorageService';
import type { Message, MessagePayload } from '@models/Message';
import type { Chat } from '@models/Chat';
import { TYPES } from '@di/types';
import { STORAGE_KEYS, MAX_MESSAGES_PER_CHAT, MessageStatus, ID_PREFIX, DEFAULT_VALUES } from '@constants/app.constants';
import { generateId } from '@utils/helpers';

type MessageCallback = (message: Message) => void;
type ChatsCallback = (chats: Chat[]) => void;

@injectable()
export class MessageService implements IMessageService {
  @inject(TYPES.LocalStorageService)
  private storageService!: ILocalStorageService;

  private messageSubscribers: MessageCallback[] = [];
  private chatsSubscribers: ChatsCallback[] = [];

  getChats(): Chat[] {
    return this.storageService.getItem<Chat[]>(STORAGE_KEYS.CHATS) || [];
  }

  getMessages(chatId: string): Message[] {
    const allMessages = this.storageService.getItem<Message[]>(STORAGE_KEYS.MESSAGES) || [];
    return allMessages.filter((msg) => msg.chatId === chatId);
  }

  getMessagesPaginated(chatId: string, offset: number, limit: number): Message[] {
    const allMessages = this.getMessages(chatId);
    // Sort by timestamp (oldest first for chat history)
    const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp);
    // Return slice for pagination
    return sortedMessages.slice(offset, offset + limit);
  }

  getTotalMessageCount(chatId: string): number {
    return this.getMessages(chatId).length;
  }

  sendMessage(payload: MessagePayload): Message {
    const message: Message = {
      id: generateId(ID_PREFIX.MESSAGE),
      chatId: payload.chatId,
      content: payload.content,
      sender: payload.sender,
      timestamp: Date.now(),
      isOwn: true,
      status: MessageStatus.SENT,
    };

    this.addMessage(message);
    return message;
  }

  addMessage(message: Message): void {
    const updatedMessages = this.enforceMessageLimit(message);
    this.storageService.setItem(STORAGE_KEYS.MESSAGES, updatedMessages);

    this.updateChatLastMessage(message);
    this.notifySubscribers(message);
  }

  private enforceMessageLimit(newMessage: Message): Message[] {
    const allMessages = this.getAllMessages();
    const { chatMessages, otherMessages } = this.partitionMessagesByChat(allMessages, newMessage.chatId);

    chatMessages.push(newMessage);

    const trimmedChatMessages = this.trimToMaxMessages(chatMessages);

    return [...otherMessages, ...trimmedChatMessages];
  }

  private getAllMessages(): Message[] {
    return this.storageService.getItem<Message[]>(STORAGE_KEYS.MESSAGES) || [];
  }

  private partitionMessagesByChat(messages: Message[], chatId: string) {
    const chatMessages = messages.filter(msg => msg.chatId === chatId);
    const otherMessages = messages.filter(msg => msg.chatId !== chatId);
    return { chatMessages, otherMessages };
  }

  private trimToMaxMessages(messages: Message[]): Message[] {
    if (messages.length <= MAX_MESSAGES_PER_CHAT) {
      return messages;
    }

    return messages
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-MAX_MESSAGES_PER_CHAT);
  }

  private notifySubscribers(message: Message): void {
    this.messageSubscribers.forEach((callback) => callback(message));
    this.notifyChatsSubscribers();
  }

  private updateChatLastMessage(message: Message): void {
    const chats = this.getChats();
    const chatIndex = chats.findIndex((chat) => chat.id === message.chatId);

    if (chatIndex !== DEFAULT_VALUES.INDEX_NOT_FOUND) {
      chats[chatIndex].lastMessage = message;
      if (!message.isOwn) {
        chats[chatIndex].unreadCount += DEFAULT_VALUES.UNREAD_INCREMENT;
      }
      this.storageService.setItem(STORAGE_KEYS.CHATS, chats);
    }
  }

  subscribeToMessages(callback: MessageCallback): () => void {
    this.messageSubscribers.push(callback);
    return () => {
      this.messageSubscribers = this.messageSubscribers.filter((cb) => cb !== callback);
    };
  }

  subscribeToChats(callback: ChatsCallback): () => void {
    this.chatsSubscribers.push(callback);
    return () => {
      this.chatsSubscribers = this.chatsSubscribers.filter((cb) => cb !== callback);
    };
  }

  private notifyChatsSubscribers(): void {
    const chats = this.getChats();
    this.chatsSubscribers.forEach((callback) => callback(chats));
  }

  markAsRead(chatId: string): void {
    const chats = this.getChats();
    const chatIndex = chats.findIndex((chat) => chat.id === chatId);

    if (chatIndex !== DEFAULT_VALUES.INDEX_NOT_FOUND) {
      chats[chatIndex].unreadCount = 0;
      this.storageService.setItem(STORAGE_KEYS.CHATS, chats);
      this.notifyChatsSubscribers();
    }
  }

  markAsUnread(chatId: string, count: number = DEFAULT_VALUES.UNREAD_COUNT): void {
    const chats = this.getChats();
    const chatIndex = chats.findIndex((chat) => chat.id === chatId);

    if (chatIndex !== DEFAULT_VALUES.INDEX_NOT_FOUND) {
      chats[chatIndex].unreadCount = count;
      this.storageService.setItem(STORAGE_KEYS.CHATS, chats);
      this.notifyChatsSubscribers();
    }
  }
}
