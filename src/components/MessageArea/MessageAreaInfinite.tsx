import { useRef, useEffect, useState } from "react";
import { formatTime, formatDate, isDifferentDay } from "@utils/helpers";
import { MessageStatus } from "@/constants/app.constants";
import { MessageAreaInfiniteProps } from "./types";
import { MESSAGE_AREA, MESSAGE_INDICATORS } from "../../constants/ui.constants";
import { MESSAGE_DIMENSIONS, ANIMATION, INTERSECTION_OBSERVER } from "../../constants/layout.constants";
import { DEFAULT_VALUES } from "../../constants/app.constants";
import { useScrollToMessage } from "@hooks/useScrollToMessage";

export const MessageAreaInfinite = ({
  messages,
  chatName,
  isOnline,
  loading,
  hasMore,
  onLoadMore,
}: MessageAreaInfiniteProps) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [previousScrollHeight, setPreviousScrollHeight] = useState(DEFAULT_VALUES.INDEX_NOT_FOUND + 1);

  // Scroll to message from URL parameter
  useScrollToMessage(messages, messagesContainerRef);

  // Maintain scroll position when loading more messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && loading) {
      setPreviousScrollHeight(container.scrollHeight);
    }
  }, [loading]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container && !loading && previousScrollHeight > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - previousScrollHeight;
      container.scrollTop = container.scrollTop + scrollDiff;
      setPreviousScrollHeight(0);
    }
  }, [loading, previousScrollHeight]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: INTERSECTION_OBSERVER.THRESHOLD }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col bg-chat-bg min-h-0">
        <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
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
    <div className="flex-1 flex flex-col bg-chat-bg min-h-0">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <h5 className="text-lg font-semibold m-0 flex-1">{chatName}</h5>
          {isOnline !== undefined && (
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              <span className="text-sm text-gray-600">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1"
        data-testid="messages-list"
        ref={messagesContainerRef}
      >
        {/* Load more trigger at top */}
        <div
          ref={observerTarget}
          className="h-10 flex items-center justify-center mb-2"
        >
          {loading && (
            <div className="text-sm text-gray-500 bg-white rounded-full px-4 py-2 shadow-sm">
              <div className="animate-pulse flex items-center gap-2">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${ANIMATION.STAGGER_DELAYS.FIRST}ms` }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${ANIMATION.STAGGER_DELAYS.SECOND}ms` }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${ANIMATION.STAGGER_DELAYS.THIRD}ms` }}
                />
              </div>
            </div>
          )}
          {hasMore && !loading && messages.length > 0 && (
            <div className="text-xs text-gray-400 bg-white rounded-full px-3 py-1 shadow-sm">
              {MESSAGE_AREA.LOAD_MORE_TEXT}
            </div>
          )}
        </div>

        {messages.map((message, index) => {
          const showDate =
            index === 0 ||
            isDifferentDay(messages[index - 1].timestamp, message.timestamp);

          return (
            <div key={message.id}>
              {/* Date separator */}
              {showDate && (
                <div className="flex items-center justify-center my-4">
                  <div className="bg-white rounded-full px-3 py-1 text-xs text-gray-500 shadow-sm">
                    {formatDate(message.timestamp)}
                  </div>
                </div>
              )}

              {/* Message bubble */}
              <div
                className={`flex mb-1 ${
                  message.isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`${message.isOwn ? "" : ""}`}
                  style={{ maxWidth: MESSAGE_DIMENSIONS.INFINITE_SCROLL_MAX_WIDTH }}
                  data-message-id={message.id}
                  data-testid={`message-${message.id}`}
                >
                  <div
                    className={`
                      px-3 py-2 shadow-sm break-words transition-all duration-200 hover:shadow-md
                      ${
                        message.isOwn
                          ? "bg-primary text-white rounded-2xl rounded-br-md"
                          : "bg-white rounded-2xl rounded-bl-md"
                      }
                    `}
                  >
                    {!message.isOwn && (
                      <div className="text-xs font-semibold text-primary-dark mb-1">
                        {message.sender}
                      </div>
                    )}
                    <div
                      className={`text-[15px] leading-relaxed mb-1 ${
                        message.isOwn ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span
                        className={`text-[11px] ${
                          message.isOwn ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </span>
                      {message.isOwn && message.status && (
                        <span className="text-[11px] text-white/80">
                          {message.status === MessageStatus.DELIVERED
                            ? MESSAGE_INDICATORS.DELIVERED
                            : MESSAGE_INDICATORS.SENT}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
