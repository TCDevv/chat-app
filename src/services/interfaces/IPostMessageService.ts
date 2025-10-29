import type { Message } from '@models/Message';

export interface IPostMessageService {
  init(onMessage: (message: Message) => void): void;
  sendMessage(message: Message): void;
  destroy(): void;
}
