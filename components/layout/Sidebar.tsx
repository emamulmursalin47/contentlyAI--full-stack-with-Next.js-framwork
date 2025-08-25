import React, { useState } from 'react';

import { 
  MessageSquare, 
  Plus, 
  Settings, 
  User, 
  LogOut, 
  Menu,
  Trash2,
  Edit3,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isToday, isYesterday } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Conversation {
  id: string;
  title: string;
  updated_at: Date;
  targetPlatform: string;
  llmModel: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  conversations: Conversation[];
  currentConversationId?: string;
  user: User;
  onNewConversation: (llmModel?: string, targetPlatform?: string) => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  currentLlmModel?: string;
  currentTargetPlatform?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  conversations,
  currentConversationId,
  user,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  currentLlmModel,
  currentTargetPlatform,
}) => {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  const groupedConversations = conversations.reduce((groups: { [key: string]: Conversation[] }, conversation) => {
    const date = formatDate(new Date(conversation.updated_at));
    if (!groups[date]) groups[date] = [];
    groups[date].push(conversation);
    return groups;
  }, {});

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-[#0f0c29] text-indigo-100 transition-all duration-300 ease-in-out shadow-2xl border-r border-indigo-700/30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-16' : 'w-72'} 
          lg:static lg:translate-x-0 lg:block`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-indigo-700/30">
            {!isCollapsed && (
              
              <Link href="/">
          <div className="flex items-center ml-14 justify-center h-16 w-32 rounded-2xl bg-transparent backdrop-blur-xl border border-white/20 cursor-pointer"
            style={{
              boxShadow: "0 4px 16px rgba(122, 28, 172, 0.3)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)"
            }}
          >
           <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xl">Contently</span>
              </div>
          </div>
        </Link>
             
            )}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onToggle();
                } else {
                  setIsCollapsed(!isCollapsed);
                }
              }}
              className={`rounded-lg p-2 text-indigo-300 hover:bg-[#302b63]/50 lg:block ${isCollapsed ? 'mx-auto' : ''}`}
            >
              {typeof window !== 'undefined' && window.innerWidth < 1024 ? (
                <Menu className="h-5 w-5" />
              ) : (
                <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>
          
          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={() => onNewConversation(currentLlmModel, currentTargetPlatform)}
              className="w-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] text-white hover:from-[#6a40e1] hover:to-[#502ca3] shadow-lg hover:shadow-[0_0_20px_5px_rgba(124,58,237,0.3)] transition-all duration-300"
              variant="default"
            >
              <Plus className={`${isCollapsed ? 'mx-auto' : 'mr-2'} h-4 w-4`} />
              {!isCollapsed && 'New Conversation'}
            </Button>
          </div>
          
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-indigo-600/30 hover:scrollbar-thumb-indigo-500/50">
            <div className="space-y-5">
              {Object.entries(groupedConversations).map(([date, convs]) => (
                <div key={date}>
                  {!isCollapsed && (
                    <h3 className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-2 pl-1">
                      {date}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {convs.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group relative rounded-lg transition-all duration-200 ${
                          currentConversationId === conversation.id
                            ? 'bg-[#302b63]/50 border border-[#7950f2]/50 shadow-md'
                            : 'hover:bg-[#302b63]/30'
                        } ${isCollapsed ? 'p-3' : 'p-3'}`}
                      >
                        {!isCollapsed && (
                          <div className="absolute right-2 top-2 z-10">
                            <div className="flex space-x-1 bg-[#0f0c29]/90 p-1 rounded-md border border-indigo-700/30 shadow-sm">
                              <button
                                onClick={(e) => { e.preventDefault(); startEditing(conversation); }}
                                className="p-1 text-indigo-300 hover:text-[#9775fa] hover:bg-[#302b63]/50 rounded transition-colors"
                                title="Edit conversation"
                              >
                                <Edit3 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (window.confirm('Are you sure?')) {
                                    onDeleteConversation(conversation.id);
                                  }
                                }}
                                className="p-1 text-indigo-300 hover:text-red-400 hover:bg-red-900/30 rounded transition-colors"
                                title="Delete conversation"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <Link
                          href={`/chat/${conversation.id}`}
                          className="block"
                        >
                          <div className={`flex ${isCollapsed ? 'items-center justify-center' : 'items-center'} ${!isCollapsed ? 'pr-16' : ''}`}>
                            <MessageSquare className={`${isCollapsed ? '' : 'mr-3'} h-4 w-4 text-[#9775fa] flex-shrink-0`} />
                            <div className="flex-1 min-w-0 overflow-hidden">
                              {editingId === conversation.id ? (
                                <input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onBlur={saveEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  className="w-full bg-[#0f0c29] text-sm rounded px-2 py-1 border border-indigo-700/50 outline-none focus:ring-1 focus:ring-[#7950f2]"
                                  autoFocus
                                  onClick={(e) => e.preventDefault()}
                                />
                              ) : (
                                !isCollapsed && (
                                  <p className="text-sm font-medium text-indigo-100 truncate">
                                    {conversation.title}
                                  </p>
                                )
                              )}
                              {!isCollapsed && (
                                <p className="text-xs text-indigo-300 truncate mt-1">
                                  {conversation.targetPlatform} • {conversation.llmModel}
                                </p>
                              )}
                              {!isCollapsed && (
                                <p className="text-xs text-indigo-400 truncate mt-0.5">
                                  Updated: {format(new Date(conversation.updated_at), 'MMM d, yyyy HH:mm')}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-indigo-700/30 bg-[#1a1633]">
            <div className="flex flex-col items-start">
              <div className="flex items-center space-x-3 w-full">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-[#7950f2] to-[#5f3dc4] flex items-center justify-center shadow-sm flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-indigo-100 truncate">
                      {user.fullName || user.email}
                    </p>
                    <p className="text-xs text-indigo-300 truncate">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex items-center mt-3 w-full justify-center">
                  <Link href="/settings">
                    <button className="rounded-lg p-2 text-indigo-300 hover:bg-[#302b63]/50 hover:text-white transition-colors mr-1">
                      <Settings className="h-4 w-4" />
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg p-2 text-indigo-300 hover:bg-[#302b63]/50 hover:text-white transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
