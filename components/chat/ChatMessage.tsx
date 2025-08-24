import React, { useState, useMemo } from 'react';
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
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [showThinking, setShowThinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  // Memoize formatted timestamp to avoid recalculating on every render
  const formattedTimestamp = useMemo(() => {
    try {
      return format(new Date(message.created_at), 'MMM d, h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, [message.created_at]);

  // Parse and structure AI response content
  const structuredContent = useMemo(() => {
    if (isUser || !message.content) return null;
    
    try {
      // Split content into sections based on markdown-like headers
      const sections: {title: string, content: string, id: string}[] = [];
      const content = message.content;
      
      // Look for markdown headers (##, ###, etc.)
      const headerRegex = /(#{2,6})\s+(.+)/g;
      let lastIndex = 0;
      let match;
      
      while ((match = headerRegex.exec(content)) !== null) {
        // If we found a header and there was content before it
        if (match.index > lastIndex) {
          sections.push({
            title: 'Response',
            content: content.substring(lastIndex, match.index).trim(),
            id: `section-${sections.length}`
          });
        }
        
        // Add the header section
        sections.push({
          title: match[2],
          content: '',
          id: `section-${sections.length}`
        });
        
        lastIndex = headerRegex.lastIndex;
      }
      
      // Add the remaining content after the last header
      if (lastIndex < content.length) {
        sections.push({
          title: sections.length === 0 ? 'Content' : 'Additional Information',
          content: content.substring(lastIndex).trim(),
          id: `section-${sections.length}`
        });
      }
      
      // If no headers were found, treat the whole content as one section
      if (sections.length === 0) {
        sections.push({
          title: 'Response',
          content: content.trim(),
          id: 'main-content'
        });
      }
      
      return sections;
    } catch (error) {
      console.error('Error parsing content:', error);
      return [{ title: 'Content', content: message.content, id: 'main-content' }];
    }
  }, [message.content, isUser]);

  const handleCopy = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopiedSection(sectionId);
      setTimeout(() => {
        setCopied(false);
        setCopiedSection(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  };

  return (
    <div 
      className={`flex gap-3 p-4 sm:p-6 ${isUser ? 'justify-end' : 'justify-start'} border-b border-gray-100`}
      role="listitem"
      aria-label={`${isUser ? 'User' : 'AI'} message`}
    >
      <div className={`flex flex-col max-w-[90%] sm:max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message header with timestamp and sender */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-500">
            {formattedTimestamp}
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {isUser ? 'You' : 'ContentlyAI'}
          </span>
        </div>
        
        {/* Message content container */}
        <div className={`prose prose-sm max-w-none ${
          isUser ? 'rounded-br-none' : 'rounded-bl-none'
        }`}>
          {message.isThinking ? (
            // Thinking indicator
            <div className="flex items-center space-x-2 py-2">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          ) : (
            <>
              {/* Main message content */}
              <div className={`whitespace-pre-wrap break-words text-sm sm:text-base p-0 rounded-lg relative ${
                isUser ? 'bg-blue-600 text-white p-3' : 'bg-white text-gray-800'
              }`}>
                {isUser ? (
                  message.content
                ) : (
                  <div className="space-y-4">
                    {structuredContent && structuredContent.map((section) => (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {section.title}
                          </h3>
                          <button
                            onClick={() => handleCopy(section.content, section.id)}
                            className="p-1 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                            title={copied && copiedSection === section.id ? "Copied!" : `Copy ${section.title}`}
                            aria-label={copied && copiedSection === section.id ? "Copied to clipboard" : `Copy ${section.title} to clipboard`}
                          >
                            {copied && copiedSection === section.id ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                        <div className="text-gray-800 whitespace-pre-wrap">
                          {section.content || 'Thinking...'}
                        </div>
                      </div>
                    ))}
                    
                    {/* Copy button for the entire AI message */}
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => handleCopy(message.content, 'full-message')}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        title={copied && copiedSection === 'full-message' ? "Copied!" : "Copy entire response"}
                      >
                        {copied && copiedSection === 'full-message' ? (
                          <>
                            <Check size={14} className="text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy entire response
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Thinking content section (collapsible) */}
              {message.thinkingContent && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowThinking(!showThinking)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    aria-expanded={showThinking}
                    aria-controls="thinking-content"
                  >
                    {showThinking ? 'Hide thoughts' : 'Show thoughts'}
                    {showThinking ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {showThinking && (
                    <div 
                      id="thinking-content"
                      className="mt-1 p-2 bg-gray-100 rounded-md text-gray-700 text-xs whitespace-pre-wrap"
                    >
                      {message.thinkingContent}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          ) : (
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
};