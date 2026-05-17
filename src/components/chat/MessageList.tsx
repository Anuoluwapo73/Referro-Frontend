import React, { useEffect, useRef } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Message } from '../../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const formatMessageDate = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
};

const formatMessageTime = (dateStr: string): string => {
  return format(parseISO(dateStr), 'h:mm a');
};

// Group messages by date
const groupMessagesByDate = (messages: Message[]): { date: string; messages: Message[] }[] => {
  const groups: Record<string, Message[]> = {};
  for (const msg of messages) {
    const dateKey = msg.createdAt.slice(0, 10); // YYYY-MM-DD
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
  }
  return Object.entries(groups).map(([date, msgs]) => ({
    date: formatMessageDate(`${date}T00:00:00`),
    messages: msgs,
  }));
};

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
        No messages yet. Start the conversation!
      </div>
    );
  }

  const groups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3 gap-1" role="log" aria-label="Messages">
      {groups.map((group) => (
        <div key={group.date}>
          {/* Date separator */}
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">{group.date}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {group.messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                {!isMine && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-semibold mr-2 self-end">
                    {msg.sender?.fullName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isMine && (
                    <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender?.fullName}</span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm break-words ${
                      isMine
                        ? 'bg-primary-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-xs text-gray-400">{formatMessageTime(msg.createdAt)}</span>
                    {isMine && (
                      <span className="text-xs text-gray-400" aria-label={msg.isRead ? 'Read' : 'Sent'}>
                        {msg.isRead ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-primary-400">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-gray-300">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

// Memoised — prevents re-renders when parent chat window re-renders (Requirements: 23.5)
export default React.memo(MessageList);
