import React, { useState } from 'react';
import Image from 'next/image'; // Import Image
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  User, 
  LogOut, 
  Menu,
  Trash2,
  Edit3,
  ChevronLeft, // New icon for collapse/expand
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
  currentLlmModel?: string; // New prop
  currentTargetPlatform?: string; // New prop
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
  const [isCollapsed, setIsCollapsed] = useState(false); // New state for desktop collapse
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
    const date = formatDate(conversation.updated_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(conversation);
    return groups;
  }, {});
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-20 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white transition-all duration-300 ease-in-out shadow-lg
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isCollapsed ? 'w-16' : 'w-72'} 
          lg:static lg:translate-x-0 lg:block`} // Ensure it's always block on large screens
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            {!isCollapsed && ( // Conditionally render logo and title
              <div className="flex items-center space-x-2"> {/* Added div for logo and text */}
                <Image src="/logo.png" alt=" Logo" width={160} height={50} /> {/* Added logo */}
               
              </div>
            )}
            <button
              onClick={() => {
                if (window.innerWidth < 1024) { // Check if on mobile breakpoint
                  onToggle(); // Use onToggle for mobile
                } else {
                  setIsCollapsed(!isCollapsed); // Use isCollapsed for desktop
                }
              }}
              className={`rounded-lg p-2 text-gray-400 hover:bg-gray-100 lg:block ${isCollapsed ? 'mx-auto' : ''}`} // Added mx-auto when collapsed
            >
              {window.innerWidth < 1024 ? ( // Show Menu icon on mobile
                <Menu className="h-5 w-5" />
              ) : ( // Show Chevron icon on desktop
                <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>
          
          {/* New Chat Button */}
          <div className="p-4">
            <Button
              onClick={() => onNewConversation(currentLlmModel, currentTargetPlatform)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md transition-all duration-200"
              variant="default"
            >
              <Plus className={`${isCollapsed ? 'mx-auto' : 'mr-2'} h-4 w-4`} /> {/* Center icon when collapsed */}
              {!isCollapsed && 'New Conversation'} {/* Conditionally render text */}
            </Button>
          </div>
          
          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-5">
              {Object.entries(groupedConversations).map(([date, convs]) => (
                <div key={date}>
                  {!isCollapsed && ( // Conditionally render date
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 pl-1">
                      {date}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {convs.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group relative rounded-lg transition-all duration-200 ${
                          currentConversationId === conversation.id
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 shadow-sm'
                            : 'hover:bg-gray-50'
                        } ${isCollapsed ? 'p-3' : 'p-3'}`} // Added consistent padding for collapsed state
                      >
                        <Link
                          href={`/chat/${conversation.id}`}
                          className="block"
                        >
                          <div className={`flex ${isCollapsed ? 'items-center justify-center' : 'items-center'}`}>
                            <MessageSquare className={`${isCollapsed ? '' : 'mr-3'} h-4 w-4 text-blue-500 flex-shrink-0`} />
                            <div className="flex-1 min-w-0 overflow-hidden"> {/* Added overflow-hidden */}
                              {editingId === conversation.id ? (
                                <input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onBlur={saveEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                  className="w-full bg-white text-sm rounded px-2 py-1 border border-gray-200 outline-none focus:ring-1 focus:ring-blue-500"
                                  autoFocus
                                  onClick={(e) => e.preventDefault()}
                                />
                              ) : (
                                !isCollapsed && ( // Conditionally render title
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {conversation.title}
                                  </p>
                                )
                              )}
                              {!isCollapsed && ( // Conditionally render platform/model
                                <p className="text-xs text-gray-500 truncate mt-1">
                                  {conversation.targetPlatform} • {conversation.llmModel}
                                </p>
                              )}
                              {!isCollapsed && ( // Conditionally render updated at time
                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                  Updated: {format(new Date(conversation.updated_at), 'MMM d, yyyy HH:mm')}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                        
                        {/* Action buttons */}
                        {!isCollapsed && ( // Hide action buttons when collapsed
                          <div className="absolute right-2 top-2 transition-opacity duration-200"> {/* Removed opacity-0 group-hover:opacity-100 */}
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  startEditing(conversation);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (window.confirm('Are you sure you want to delete this conversation?')) {
                                    onDeleteConversation(conversation.id);
                                  }
                                }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col items-start"> {/* Changed to flex-col, items-start */}
              <div className="flex items-center space-x-3 w-full"> {/* User info group, w-full to take space */}
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                {!isCollapsed && ( // Conditionally render user info
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user.fullName || user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
              {!isCollapsed && ( // Only show buttons when not collapsed
                <div className="flex items-center mt-3 w-full justify-center"> {/* Buttons group, mt-3 for spacing, justify-center to center */}
                  <Link href="/settings">
                    <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors mr-1">
                      <Settings className="h-4 w-4" />
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
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