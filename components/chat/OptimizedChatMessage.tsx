import React, { useState, useMemo, memo } from 'react';
import { User, Bot, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
  isThinking?: boolean;
  isStreaming?: boolean;
  thinkingContent?: string;
}

interface ChatMessageProps {
  message: Message;
}

// Memoized timestamp formatter
const useFormattedTimestamp = (timestamp: Date) => {
  return useMemo(() => {
    try {
      return format(new Date(timestamp), 'MMM d, h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, [timestamp]);
};

// Memoized content parser
const useStructuredContent = (content: string, isUser: boolean) => {
  return useMemo(() => {
    if (isUser || !content) return null;
    
    try {
      const sections: {title: string, content: string, id: string}[] = [];
      const headerRegex = /(#{2,6})\s+(.+)/g;
      let lastIndex = 0;
      let match;
      
      while ((match = headerRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          sections.push({
            title: 'Response',
            content: content.substring(lastIndex, match.index).trim(),
            id: `section-${sections.length}`
          });
        }
        sections.push({ title: match[2], content: '', id: `section-${sections.length}` });
        lastIndex = headerRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        sections.push({
          title: sections.length === 0 ? 'Content' : 'Additional Information',
          content: content.substring(lastIndex).trim(),
          id: `section-${sections.length}`
        });
      }
      
      if (sections.length === 0) {
        sections.push({ title: 'Response', content: content.trim(), id: 'main-content' });
      }
      
      return sections;
    } catch (error) {
      console.error('Error parsing content:', error);
      return [{ title: 'Content', content: content, id: 'main-content' }];
    }
  }, [content, isUser]);
};

// Memoized copy button component
const CopyButton = memo(({ 
  text, 
  sectionId, 
  title, 
  copied, 
  copiedSection, 
  onCopy 
}: {
  text: string;
  sectionId: string;
  title: string;
  copied: boolean;
  copiedSection: string | null;
  onCopy: (text: string, sectionId: string) => void;
}) => {
  const isCopied = copied && copiedSection === sectionId;
  
  return (
    <button
      onClick={() => onCopy(text, sectionId)}
      className="p-1 rounded-md text-indigo-300 hover:bg-[#302b63]/50 hover:text-white transition-colors"
      title={isCopied ? "Copied!" : `Copy ${title}`}
      aria-label={isCopied ? "Copied to clipboard" : `Copy ${title} to clipboard`}
    >
      {isCopied ? (
        <Check size={16} className="text-green-400" />
      ) : (
        <Copy size={16} />
      )}
    </button>
  );
});

CopyButton.displayName = 'CopyButton';

// Main component with React.memo for performance
export const OptimizedChatMessage = memo<ChatMessageProps>(({ message }) => {
  const isUser = message.role === 'user';
  const [showThinking, setShowThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const formattedTimestamp = useFormattedTimestamp(message.created_at);
  const structuredContent = useStructuredContent(message.content, isUser);

  const handleCopy = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopiedSection(sectionId);
      setTimeout(() => { setCopied(false); setCopiedSection(null); }, 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  // Memoized thinking toggle
  const thinkingToggle = useMemo(() => {
    if (!message.thinkingContent) return null;
    
    return (
      <div className="mt-2">
        <button
          onClick={() => setShowThinking(!showThinking)}
          className="text-xs text-[#9775fa] hover:underline flex items-center gap-1"
          aria-expanded={showThinking}
          aria-controls="thinking-content"
        >
          {showThinking ? 'Hide thoughts' : 'Show thoughts'}
          {showThinking ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showThinking && (
          <div 
            id="thinking-content"
            className="mt-1 p-2 bg-[#1a1633] border border-indigo-700/30 rounded-md text-indigo-300 text-xs whitespace-pre-wrap"
          >
            {message.thinkingContent}
          </div>
        )}
      </div>
    );
  }, [message.thinkingContent, showThinking]);

  return (
    <div 
      className={`flex gap-3 p-4 sm:p-6 ${isUser ? 'justify-end' : 'justify-start'}`}
      role="listitem"
      aria-label={`${isUser ? 'User' : 'AI'} message`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </div>
        </div>
      )}

      <div className={`flex flex-col max-w-[90%] sm:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-indigo-100">
            {isUser ? 'You' : 'ContentlyAI'}
          </span>
          <span className="text-xs text-indigo-400">
            {formattedTimestamp}
          </span>
        </div>
        
        <div className={`prose prose-sm max-w-none rounded-lg shadow-md ${
          isUser ? 'rounded-br-none bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] text-white' : 'rounded-bl-none bg-[#1a1633] text-indigo-100'
        }`}>
          {message.isThinking ? (
            <div className="flex items-center space-x-2 py-3 px-4">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm text-indigo-300">Thinking...</span>
            </div>
          ) : (
            <div className={`whitespace-pre-wrap break-words text-sm sm:text-base p-3`}>
              {isUser ? (
                message.content
              ) : (
                <div className="space-y-4">
                  {structuredContent && structuredContent.map((section) => (
                    <div key={section.id} className="border border-indigo-700/30 rounded-lg p-4 bg-[#0f0c29]/50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-indigo-100">
                          {section.title}
                        </h3>
                        <CopyButton
                          text={section.content}
                          sectionId={section.id}
                          title={section.title}
                          copied={copied}
                          copiedSection={copiedSection}
                          onCopy={handleCopy}
                        />
                      </div>
                      <div className="text-indigo-200 whitespace-pre-wrap">
                        {section.content || 'Thinking...'}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => handleCopy(message.content, 'full-message')}
                      className="flex items-center gap-1 text-xs text-[#9775fa] hover:text-[#b794f4] transition-colors"
                      title={copied && copiedSection === 'full-message' ? "Copied!" : "Copy entire response"}
                    >
                      {copied && copiedSection === 'full-message' ? (
                        <><Check size={14} className="text-green-400" /> Copied!</>
                      ) : (
                        <><Copy size={14} /> Copy entire response</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {thinkingToggle}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] text-white">
            <User className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.isThinking === nextProps.message.isThinking &&
    prevProps.message.thinkingContent === nextProps.message.thinkingContent
  );
});

OptimizedChatMessage.displayName = 'OptimizedChatMessage';
