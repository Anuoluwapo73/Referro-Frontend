import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat.api';
import { useAuthStore } from '../store/authStore';
import { Message } from '../types';
import toast from 'react-hot-toast';

const MESSAGES_POLL_INTERVAL = 5000;   // 5s for active chat
const CONVERSATIONS_POLL_INTERVAL = 10000; // 10s for conversation list

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

interface UseChatOptions {
    jobId?: string;
}

/**
 * useChat hook — manages messages and conversations for the Chat page.
 * Handles polling, sending, marking as read, and unread counts.
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export function useChat({ jobId }: UseChatOptions = {}) {
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);

    // ── Conversations ──────────────────────────────────────────────────────────
    const {
        data: conversationsData,
        isLoading: conversationsLoading,
        error: conversationsError,
    } = useQuery({
        queryKey: ['chat-conversations'],
        queryFn: async () => {
            const res = await chatApi.getConversations() as any;
            return (res?.conversations ?? []) as Conversation[];
        },
        refetchInterval: CONVERSATIONS_POLL_INTERVAL,
    });

    const conversations = conversationsData ?? [];

    // Total unread count across all conversations
    const unreadCount = conversations.reduce((sum, conv) => {
        const isUnread =
            conv.unreadCount > 0 && conv.lastMessage?.senderId !== user?.id;
        return sum + (isUnread ? conv.unreadCount : 0);
    }, 0);

    // ── Messages for a specific job ────────────────────────────────────────────
    const {
        data: messagesData,
        isLoading: messagesLoading,
        error: messagesError,
    } = useQuery({
        queryKey: ['chat-messages', jobId],
        queryFn: async () => {
            if (!jobId) return [] as Message[];
            const res = await chatApi.getMessages(jobId) as any;
            return (res?.messages ?? res ?? []) as Message[];
        },
        enabled: !!jobId,
        refetchInterval: jobId ? MESSAGES_POLL_INTERVAL : false,
        staleTime: 0,
    });

    const messages = messagesData ?? [];

    // ── Send message ───────────────────────────────────────────────────────────
    const sendMutation = useMutation({
        mutationFn: ({
            targetJobId,
            receiverId,
            content,
        }: {
            targetJobId: string;
            receiverId: string;
            content: string;
        }) => chatApi.sendMessage({ jobId: targetJobId, receiverId, content }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['chat-messages', variables.targetJobId],
            });
            queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        },
        onError: () => {
            toast.error('Failed to send message. Please try again.');
        },
    });

    const sendMessage = useCallback(
        (targetJobId: string, receiverId: string, content: string) => {
            sendMutation.mutate({ targetJobId, receiverId, content });
        },
        [sendMutation]
    );

    // ── Mark as read ───────────────────────────────────────────────────────────
    const markReadMutation = useMutation({
        mutationFn: (targetJobId: string) => chatApi.markAsRead(targetJobId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        },
    });

    const markAsRead = useCallback(
        (targetJobId: string) => {
            markReadMutation.mutate(targetJobId);
        },
        [markReadMutation]
    );

    return {
        // Conversations
        conversations,
        conversationsLoading,
        conversationsError,
        unreadCount,

        // Messages
        messages,
        messagesLoading,
        messagesError,

        // Actions
        sendMessage,
        isSending: sendMutation.isPending,
        markAsRead,
    };
}
