import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message here..."
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <div className="p-3 sm:p-4 bg-[#0f0c29] border-t border-indigo-700/30">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              disabled={disabled}
              className="w-full resize-none rounded-xl border border-indigo-700/50 bg-[#302b63]/50 px-4 py-3 pr-12 text-indigo-100 placeholder:text-indigo-400 focus:border-[#7950f2] focus:ring-2 focus:ring-[#7950f2] focus:ring-opacity-50 disabled:bg-gray-500/10 disabled:opacity-50 shadow-sm transition-all duration-200"
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
          </div>
          
          <Button
            type="submit"
            disabled={!message.trim() || isLoading || disabled}
            className="h-12 w-12 sm:w-auto sm:px-4 rounded-xl bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] text-white hover:from-[#6a40e1] hover:to-[#502ca3] shadow-lg hover:shadow-[0_0_20px_5px_rgba(124,58,237,0.3)] transition-all duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
        
        <div className="mt-2 text-center">
          <p className="text-xs text-indigo-400">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};
