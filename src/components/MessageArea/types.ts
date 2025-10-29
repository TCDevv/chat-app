import { Message } from "@/models/Message";

export interface MessageAreaInfiniteProps {
  messages: Message[];
  chatName?: string;
  isOnline?: boolean;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export interface MessageAreaProps {
  messages: Message[];
  chatName?: string;
}

export interface MessageRowProps {
  index: number;
  style: React.CSSProperties;
  data: Message[];
}