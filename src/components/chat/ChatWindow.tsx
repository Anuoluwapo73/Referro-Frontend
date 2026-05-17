import React, { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../../api/chat.api';
import { useAuthStore } from '../../store/authStore';
import { Message } from '../../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  jobId: string;
  receiverId: string;
}

const POLL_INTERVAL = 5000; // 5 seconds

const ChatWindow: React.FC<ChatWindowProps> = ({ jobId, receiverId }) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const hasMarkedRead = useRef(false);

  // Fetch messages with polling
  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-messages', jobId],
    queryFn: async () => {
      const res = await chatApi.getMessages(jobId) as any;
      return (res?.messages ?? res ?? []) as Message[];
    },
    refetchInterval: POLL_INTERVAL,
    staleTime: 0,
  });

  const messages = data ?? [];

  // Mark messages as read when window is opened
  const markReadMutation = useMutation({
    mutationFn: () => chatApi.markAsRead(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });

  useEffect(() => {
    if (messages.length > 0 && !hasMarkedRead.current) {
      const hasUnread = messages.some(
        (m) => !m.isRead && m.receiverId === user?.id
      );
      if (hasUnread) {
        markReadMutation.mutate();
        hasMarkedRead.current = true;
      }
    }
  }, [messages, user?.id]);

  // Also mark as read when new messages arrive
  useEffect(() => {
    const hasUnread = messages.some(
      (m) => !m.isRead && m.receiverId === user?.id
    );
    if (hasUnread) {
      markReadMutation.mutate();
    }
  }, [messages.length]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      chatApi.sendMessage({ jobId, receiverId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', jobId] });
    },
    onError: () => {
      toast.error('Failed to send message. Please try again.');
    },
  });

  const handleSend = useCallback(
    (content: string) => {
      sendMutation.mutate(content);
    },
    [sendMutation]
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center h-64">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center h-64 text-red-500 text-sm">
        Failed to load messages. Please try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-700">Job Chat</span>
        <span className="ml-auto text-xs text-gray-400">
          Updates every {POLL_INTERVAL / 1000}s
        </span>
      </div>

      {/* Messages */}
      <MessageList messages={messages} currentUserId={user?.id ?? ''} />

      {/* Input */}
      <MessageInput onSend={handleSend} disabled={sendMutation.isPending} />
    </div>
  );
};

export default ChatWindow;
