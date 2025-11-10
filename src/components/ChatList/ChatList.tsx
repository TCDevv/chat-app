import { formatRelativeTime } from "@utils/helpers";
import { ChatListProps } from "./types";
import { CHAT_LIST } from "../../constants/ui.constants";

export const ChatList = ({
  chats,
  selectedChatId,
  selectedChatIds = [],
  onChatSelect,
  onMarkAsUnread,
}: ChatListProps) => {
  const handleContextMenu = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    onMarkAsUnread?.(chatId);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h5 className="text-lg font-semibold m-0 text-gray-800">{CHAT_LIST.HEADER}</h5>
      </div>
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => {
          const hasUnread = chat.unreadCount > 0;
          const isSelected = selectedChatIds.includes(chat.id);
          const isPrimarySelection = chat.id === selectedChatId;

          return (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              onContextMenu={(e) => handleContextMenu(e, chat.id)}
              className={`
                cursor-pointer p-3 px-4 transition-all duration-200 border-b border-gray-100
                hover:bg-gray-50
                ${
                  isPrimarySelection
                    ? "bg-blue-50 border-l-4 border-l-primary active"
                    : isSelected
                    ? "bg-blue-50/60 border-l-4 border-l-blue-300"
                    : hasUnread
                    ? "bg-blue-50/30"
                    : ""
                }
              `}
              data-testid={`chat-item-${chat.id}`}
              title={CHAT_LIST.UNREAD_TOOLTIP}
            >
              <div className="flex gap-3">
                {/* Avatar with online indicator */}
                <div className="w-12 h-12 flex-shrink-0 relative">
                  {chat.avatar ? (
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                      {chat.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Online/Offline indicator */}
                  {chat.isOnline !== undefined && (
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        chat.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  )}
                </div>

                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-[15px] ${
                        hasUnread
                          ? "font-bold text-gray-900"
                          : "font-medium text-gray-800"
                      }`}
                    >
                      {chat.name}
                    </span>
                    <span
                      className={`text-xs ${
                        hasUnread
                          ? "text-primary font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {formatRelativeTime(chat.lastMessage?.timestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span
                      className={`text-sm text-truncate flex-1 ${
                        hasUnread
                          ? "font-semibold text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {chat.lastMessage?.content || CHAT_LIST.EMPTY_MESSAGE}
                    </span>
                    {hasUnread && (
                      <span className="bg-primary text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-2 flex items-center justify-center flex-shrink-0">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  {/* Show indicator for secondary selection */}
                  {isSelected && !isPrimarySelection && (
                    <div className="mt-1">
                      <span className="text-[10px] text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                        Split view
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
