import type { Message } from '../models/Message';
import {
  WorkerMessageType,
  MOCK_REPLIES,
  REPLY_DELAY_MIN,
  REPLY_DELAY_MAX,
  WORKER_PROCESSING_DELAY,
  MessageStatus,
  ID_PREFIX,
} from '../constants/app.constants';
import { USER } from '../constants/ui.constants';
import { generateId, getRandomItem, getRandomDelay } from '../utils/helpers';

interface WorkerMessage {
  type: WorkerMessageType;
  payload?: unknown;
}

interface LoadMessagesPaginatedPayload {
  messages: Message[];
  offset: number;
  limit: number;
}

interface LoadAllMessagesPayload {
  messages: Message[];
}

interface GenerateReplyPayload {
  chatId: string;
  userMessage: string;
}

interface WorkerResponse {
  type: WorkerMessageType;
  payload: unknown;
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<WorkerMessage>): void => {
  const { type, payload } = event.data;

  switch (type) {
    case WorkerMessageType.LOAD_MESSAGES_PAGINATED:
      handleLoadMessages(payload as LoadMessagesPaginatedPayload);
      break;
    case WorkerMessageType.LOAD_ALL_MESSAGES:
      handleLoadAllMessages(payload as LoadAllMessagesPayload);
      break;
    case WorkerMessageType.GENERATE_REPLY:
      handleGenerateReply(payload as GenerateReplyPayload);
      break;
    default:
      console.warn('Unknown worker message type:', type);
  }
};

/**
 * Load messages in pages for infinite scroll
 */
function handleLoadMessages(payload: LoadMessagesPaginatedPayload): void {
  const { messages, offset, limit } = payload;

  setTimeout(() => {
    const paginatedMessages = messages.slice(offset, offset + limit);
    const hasMore = offset + limit < messages.length;

    const response: WorkerResponse = {
      type: WorkerMessageType.MESSAGES_LOADED,
      payload: {
        messages: paginatedMessages,
        offset,
        hasMore,
      },
    };

    self.postMessage(response);
  }, WORKER_PROCESSING_DELAY);
}

/**
 * Load ALL messages at once (used when scrolling to a specific message from URL)
 */
function handleLoadAllMessages(payload: LoadAllMessagesPayload): void {
  const { messages } = payload;

  setTimeout(() => {
    const response: WorkerResponse = {
      type: WorkerMessageType.ALL_MESSAGES_LOADED,
      payload: {
        messages,
        hasMore: false,
      },
    };

    self.postMessage(response);
  }, WORKER_PROCESSING_DELAY);
}

/**
 * Generate mock reply with random delay
 */
function handleGenerateReply(payload: GenerateReplyPayload): void {
  const { chatId } = payload;
  const delay = getRandomDelay(REPLY_DELAY_MIN, REPLY_DELAY_MAX);

  setTimeout(() => {
    const replyMessage: Message = {
      id: generateId(ID_PREFIX.REPLY),
      chatId,
      content: getRandomItem(MOCK_REPLIES),
      sender: USER.BOT_SENDER_NAME,
      timestamp: Date.now(),
      isOwn: false,
      status: MessageStatus.DELIVERED,
    };

    const response: WorkerResponse = {
      type: WorkerMessageType.MOCK_REPLY,
      payload: replyMessage,
    };

    self.postMessage(response);
  }, delay);
}

export {};
