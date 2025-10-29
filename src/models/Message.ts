export interface Message {
  id: string;
  chatId: string;
  content: string;
  sender: string;
  timestamp: number;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface MessagePayload {
  content: string;
  chatId: string;
  sender: string;
}
