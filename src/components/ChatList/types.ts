import { Chat } from "@/models/Chat";

export interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  selectedChatIds?: string[];
  onChatSelect: (chatId: string) => void;
  onMarkAsUnread?: (chatId: string) => void;
}