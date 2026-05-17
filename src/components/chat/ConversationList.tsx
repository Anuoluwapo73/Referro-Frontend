import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { chatApi } from '../../api/chat.api';
import { useAuthStore } from '../../store/authStore';
import Spinner from '../common/Spinner';

interface Conversation {
  jobId: string;
  jobTitle?: string;
  otherUser: {
    id: string;
    fullName: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

interface ConversationListProps {
  onSelect: (jobId: string, receiverId: string) => void;
  selectedJobId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelect, selectedJobId }) => {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-conversations'],
    queryFn: async () => {
      const res = await chatApi.getConversations() as any;
      return (res?.conversations ?? []) as Conversation[];
    },
    refetchInterval: 10000, // poll every 10s for conversation list
  });

  const conversations = data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-500">Failed to load conversations.</div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-400">
        No conversations yet.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100" role="list" aria-label="Conversations">
      {conversations.map((conv) => {
        const isSelected = conv.jobId === selectedJobId;
        const isUnread =
          conv.unreadCount > 0 &&
          conv.lastMessage?.senderId !== user?.id;

        return (
          <li key={conv.jobId}>
            <button
              onClick={() => onSelect(conv.jobId, conv.otherUser.id)}
              aria-current={isSelected ? 'true' : undefined}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 ${
                isSelected ? 'bg-primary-50' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                {conv.otherUser.fullName?.[0]?.toUpperCase() ?? '?'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm truncate ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                    {conv.otherUser.fullName}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatDistanceToNow(parseISO(conv.lastMessage.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {conv.jobTitle && (
                  <span className="text-xs text-primary-600 truncate block">{conv.jobTitle}</span>
                )}
                {conv.lastMessage && (
                  <p className={`text-xs truncate mt-0.5 ${isUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                    {conv.lastMessage.senderId === user?.id ? 'You: ' : ''}
                    {conv.lastMessage.content}
                  </p>
                )}
              </div>

              {/* Unread badge */}
              {isUnread && (
                <span
                  className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-white text-xs font-bold"
                  aria-label={`${conv.unreadCount} unread messages`}
                >
                  {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

// Memoised — prevents unnecessary re-renders from parent layout (Requirements: 23.5)
export default React.memo(ConversationList);
