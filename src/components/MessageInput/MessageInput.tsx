import { useState, FormEvent, KeyboardEvent } from "react";
import { MessageInputProps } from "./types";
import { KEYBOARD, MESSAGE_INPUT } from "../../constants/ui.constants";
import { TEXTAREA } from "../../constants/layout.constants";
import { TEST_IDS } from "../../constants/dom.constants";

export const MessageInput = ({
  onSendMessage,
  disabled = false,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === KEYBOARD.ENTER && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-0">
          <textarea
            rows={1}
            placeholder={MESSAGE_INPUT.PLACEHOLDER}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="
              flex-1 resize-none rounded-l-2xl border border-r-0 border-gray-300
              px-4 py-3 focus:outline-none focus:border-gray-300
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
            style={{
              minHeight: `${TEXTAREA.MIN_HEIGHT_PX}px`,
              maxHeight: `${TEXTAREA.MAX_HEIGHT_PX}px`,
              overflowY: 'auto'
            }}
            data-testid={TEST_IDS.MESSAGE_INPUT}
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="
              rounded-r-2xl bg-primary hover:bg-primary-dark
              text-white px-6 font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            data-testid={TEST_IDS.SEND_BUTTON}
          >
            {MESSAGE_INPUT.SEND_BUTTON_LABEL}
          </button>
        </div>
      </form>
    </div>
  );
};
