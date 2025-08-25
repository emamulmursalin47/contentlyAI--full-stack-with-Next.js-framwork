import React, { useState, useCallback, memo } from 'react';
import { Send } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import heavy components
const DynamicSelect = dynamic(
  () => import('@radix-ui/react-select').then(mod => mod.Select),
  { loading: () => <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" /> }
);

const DynamicSelectTrigger = dynamic(
  () => import('@radix-ui/react-select').then(mod => mod.SelectTrigger),
  { loading: () => <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" /> }
);

const DynamicSelectContent = dynamic(
  () => import('@radix-ui/react-select').then(mod => mod.SelectContent),
  { ssr: false }
);

const DynamicSelectItem = dynamic(
  () => import('@radix-ui/react-select').then(mod => mod.SelectItem),
  { ssr: false }
);

const DynamicSelectValue = dynamic(
  () => import('@radix-ui/react-select').then(mod => mod.SelectValue),
  { ssr: false }
);

interface OptimizedChatInputProps {
  onSendMessage: (message: string, options?: { model?: string; platform?: string }) => void;
  isGenerating?: boolean;
  placeholder?: string;
}

const OptimizedChatInput = memo<OptimizedChatInputProps>(({
  onSendMessage,
  isGenerating = false,
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('llama-3.1-8b-instant');
  const [selectedPlatform, setSelectedPlatform] = useState('general');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isGenerating) {
      onSendMessage(message.trim(), {
        model: selectedModel,
        platform: selectedPlatform
      });
      setMessage('');
    }
  }, [message, selectedModel, selectedPlatform, onSendMessage, isGenerating]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const models = [
    { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    { value: 'gemma-7b-it', label: 'Gemma 7B' },
    { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1' },
  ];

  const platforms = [
    { value: 'general', label: 'General' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
  ];

  return (
    <div className="border-t border-indigo-800/30 bg-[#1a1633]/80 backdrop-blur-sm p-4">
      {/* Model and Platform Selection */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1">
          <label className="block text-xs text-indigo-300 mb-1">Model</label>
          <DynamicSelect value={selectedModel} onValueChange={setSelectedModel}>
            <DynamicSelectTrigger className="w-full h-8 px-2 bg-[#0f0c29] border border-indigo-700/50 rounded text-xs text-indigo-100">
              <DynamicSelectValue />
            </DynamicSelectTrigger>
            <DynamicSelectContent className="bg-[#1a1633] border border-indigo-700/50 rounded">
              {models.map((model) => (
                <DynamicSelectItem 
                  key={model.value} 
                  value={model.value}
                  className="text-xs text-indigo-100 hover:bg-indigo-700/30 px-2 py-1"
                >
                  {model.label}
                </DynamicSelectItem>
              ))}
            </DynamicSelectContent>
          </DynamicSelect>
        </div>

        <div className="flex-1">
          <label className="block text-xs text-indigo-300 mb-1">Platform</label>
          <DynamicSelect value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <DynamicSelectTrigger className="w-full h-8 px-2 bg-[#0f0c29] border border-indigo-700/50 rounded text-xs text-indigo-100">
              <DynamicSelectValue />
            </DynamicSelectTrigger>
            <DynamicSelectContent className="bg-[#1a1633] border border-indigo-700/50 rounded">
              {platforms.map((platform) => (
                <DynamicSelectItem 
                  key={platform.value} 
                  value={platform.value}
                  className="text-xs text-indigo-100 hover:bg-indigo-700/30 px-2 py-1"
                >
                  {platform.label}
                </DynamicSelectItem>
              ))}
            </DynamicSelectContent>
          </DynamicSelect>
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isGenerating}
          className="flex-1 min-h-[44px] max-h-32 px-4 py-3 bg-[#0f0c29] border border-indigo-700/50 rounded-lg text-indigo-100 placeholder-indigo-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-indigo-600/50 hover:scrollbar-thumb-indigo-500/70"
          rows={1}
          style={{ overflowY: 'auto' }}
        />
        <button
          type="submit"
          disabled={!message.trim() || isGenerating}
          className="px-4 py-3 bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] text-white rounded-lg hover:from-[#6741d9] hover:to-[#5f3dc4] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[44px]"
          title={isGenerating ? "Generating..." : "Send message"}
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Character count and tips */}
      <div className="flex justify-between items-center mt-2 text-xs text-indigo-400">
        <span>{message.length} characters</span>
        <span>Press Enter to send, Shift+Enter for new line</span>
      </div>
    </div>
  );
});

OptimizedChatInput.displayName = 'OptimizedChatInput';

export default OptimizedChatInput;
