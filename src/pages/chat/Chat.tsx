import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import ConversationList from '../../components/chat/ConversationList';
import ChatWindow from '../../components/chat/ChatWindow';

/**
 * Chat page — job-based messaging with conversation list and chat window.
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export default function ChatPage() {
  const { jobId: routeJobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();

  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(routeJobId);
  const [selectedReceiverId, setSelectedReceiverId] = useState<string | undefined>();

  const { conversations, unreadCount, markAsRead } = useChat({ jobId: selectedJobId });

  // Sync URL param → selected conversation
  useEffect(() => {
    if (routeJobId && routeJobId !== selectedJobId) {
      setSelectedJobId(routeJobId);
      // Try to find the receiver from conversations list
      const conv = conversations.find((c) => c.jobId === routeJobId);
      if (conv) setSelectedReceiverId(conv.otherUser.id);
    }
  }, [routeJobId, conversations]);

  // Mark messages as read when a conversation is selected
  useEffect(() => {
    if (selectedJobId) {
      markAsRead(selectedJobId);
    }
  }, [selectedJobId]);

  const handleSelectConversation = (jobId: string, receiverId: string) => {
    setSelectedJobId(jobId);
    setSelectedReceiverId(receiverId);
    navigate(`/chat/${jobId}`, { replace: true });
  };

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-0 sm:px-4">
      {/* Header — hidden on mobile when a conversation is open */}
      <div className={`px-4 sm:px-0 mb-4 ${selectedJobId ? 'hidden sm:block' : 'block'}`}>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        {unreadCount > 0 && (
          <p className="text-sm text-primary-600 mt-0.5">
            {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="flex h-[calc(100vh-160px)] sm:h-[calc(100vh-220px)] min-h-[400px] sm:border sm:border-gray-200 sm:rounded-xl overflow-hidden bg-white sm:shadow-sm">
        {/* Conversation list — full screen on mobile when no conversation selected */}
        <aside
          className={`flex-shrink-0 border-r border-gray-200 overflow-y-auto
            ${selectedJobId ? 'hidden sm:block sm:w-80' : 'w-full sm:w-80'}
          `}
          aria-label="Conversations"
        >
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Conversations
            </h2>
          </div>
          <ConversationList
            onSelect={handleSelectConversation}
            selectedJobId={selectedJobId}
          />
        </aside>

        {/* Chat window — full screen on mobile when conversation selected */}
        <main className={`flex-col ${selectedJobId ? 'flex flex-1' : 'hidden sm:flex sm:flex-1'}`}>
          {selectedJobId && selectedReceiverId ? (
            <>
              {/* Mobile back button */}
              <div className="sm:hidden px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedJobId(undefined);
                    setSelectedReceiverId(undefined);
                    navigate('/chat', { replace: true });
                  }}
                  className="text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded min-w-[44px] min-h-[44px] flex items-center"
                  aria-label="Back to conversations"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700">Back to conversations</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatWindow jobId={selectedJobId} receiverId={selectedReceiverId} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
              <div className="text-center px-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-3 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
