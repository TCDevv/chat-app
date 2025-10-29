import { injectable } from 'inversify';
import type { IPostMessageService } from './interfaces/IPostMessageService';
import type { Message } from '@models/Message';
import { POST_MESSAGE_TYPES, POST_MESSAGE_TARGET_ORIGIN } from '../constants/app.constants';

@injectable()
export class PostMessageService implements IPostMessageService {
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  init(onMessage: (message: Message) => void): void {
    this.messageHandler = (event: MessageEvent) => {
      // Validate message origin if needed
      // if (event.origin !== 'expected-origin') return;

      if (event.data && event.data.type === POST_MESSAGE_TYPES.NEW_MESSAGE) {
        const message: Message = event.data.payload;
        onMessage(message);
      }
    };

    window.addEventListener('message', this.messageHandler);
  }

  sendMessage(message: Message): void {
    window.postMessage(
      {
        type: POST_MESSAGE_TYPES.NEW_MESSAGE,
        payload: message,
      },
      POST_MESSAGE_TARGET_ORIGIN
    );
  }

  destroy(): void {
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
  }
}
