export interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}