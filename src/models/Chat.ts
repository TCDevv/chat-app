import { Message } from './Message';

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isOnline?: boolean;
}
