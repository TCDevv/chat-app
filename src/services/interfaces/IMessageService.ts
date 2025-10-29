import type { Message, MessagePayload } from '@models/Message';
import type { Chat } from '@models/Chat';

export interface IMessageService {
  getChats(): Chat[];
  getMessages(chatId: string): Message[];
  getMessagesPaginated(chatId: string, offset: number, limit: number): Message[];
  getTotalMessageCount(chatId: string): number;
  sendMessage(payload: MessagePayload): Message;
  addMessage(message: Message): void;
  subscribeToMessages(callback: (message: Message) => void): () => void;
  subscribeToChats(callback: (chats: Chat[]) => void): () => void;
  markAsRead(chatId: string): void;
  markAsUnread(chatId: string, count?: number): void;
}
