import { useRef, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { useScrollToMessage } from "@hooks/useScrollToMessage";
import { MessageAreaProps, MessageRowProps } from "./types";
import { MESSAGE_AREA } from "../../constants/ui.constants";
import { LOCALE, DATE_FORMAT_OPTIONS } from "../../constants/app.constants";
import { MESSAGE_DIMENSIONS, VIRTUAL_LIST } from "../../constants/layout.constants";

const MessageRow = ({ index, style, data }: MessageRowProps) => {
  const message = data[index];

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(LOCALE.DEFAULT, DATE_FORMAT_OPTIONS.TIME);
  };

  return (
    <div style={style} className="flex py-1 px-4">
      <div
        className={`flex ${message.isOwn ? "ml-auto" : "mr-auto"}`}
        style={{ maxWidth: MESSAGE_DIMENSIONS.MAX_WIDTH_PERCENTAGE }}
        data-message-id={message.id}
        data-testid={`message-${message.id}`}
      >
        <div
          className={`
            px-3 py-2 shadow-sm break-words
            ${
              message.isOwn
                ? "bg-own-message rounded-lg rounded-br-none"
                : "bg-white rounded-lg rounded-bl-none"
            }
          `}
        >
          {!message.isOwn && (
            <div className="text-xs font-medium text-primary mb-1">
              {message.sender}
            </div>
          )}
          <div className="text-sm leading-relaxed text-gray-900 mb-1">
            {message.content}
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[11px] text-gray-500">
              {formatTime(message.timestamp)}
            </span>
            {message.isOwn && message.status && (
              <span className="text-[11px] text-gray-500 capitalize">
                {message.status}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MessageArea = ({ messages, chatName }: MessageAreaProps) => {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollToMessage(messages, containerRef);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, "end");
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col bg-chat-bg">
        <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
          <h5 className="text-lg font-semibold m-0">
            {chatName || MESSAGE_AREA.EMPTY_CHAT_TEXT}
          </h5>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 text-base">
          <p>{MESSAGE_AREA.EMPTY_MESSAGES_TEXT}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-chat-bg" ref={containerRef}>
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <h5 className="text-lg font-semibold m-0">{chatName}</h5>
      </div>
      <div className="flex-1 overflow-y-auto p-4" data-testid="messages-list">
        <List
          ref={listRef}
          height={window.innerHeight - VIRTUAL_LIST.HEIGHT_OFFSET}
          itemCount={messages.length}
          itemSize={VIRTUAL_LIST.ITEM_SIZE}
          width="100%"
          itemData={messages}
        >
          {MessageRow}
        </List>
      </div>
    </div>
  );
};
