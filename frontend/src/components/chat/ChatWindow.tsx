import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage } from '../../types/chat.types';
import { chatService } from '../../services/chat.service';
import { useSocket, useRequestRoom } from '../../sockets/useSocket';
import { SOCKET_EVENTS } from '../../sockets/socketEvents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { BloodBadge } from '../ui/BloodBadge';
import { formatDate } from '../../lib/utils';
import { Send, MessageSquare, ShieldAlert, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  requestId: string;
  patientName?: string;
  hospitalName?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  requestId,
  patientName,
  hospitalName,
}) => {
  const { user } = useAuth();
  const socket = useSocket();
  const toast = useToast();
  useRequestRoom(requestId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch initial message history
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!requestId || requestId === 'undefined' || requestId.length !== 24) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await chatService.getMessages(requestId);
        if (isMounted) {
          setMessages(data);
          setTimeout(scrollToBottom, 100);
        }
      } catch (err: any) {
        console.error('Failed to load chat history:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [requestId, scrollToBottom]);

  // Real-time socket message reception
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: ChatMessage) => {
      if (newMsg.requestId === requestId) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m._id === newMsg._id)) {
            return prev;
          }
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);
      }
    };

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);
    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, handleNewMessage);
    };
  }, [socket, requestId, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    try {
      setIsSending(true);
      setInputText('');

      // Send via HTTP endpoint which persists and emits via socket
      const sentMsg = await chatService.sendMessage(requestId, { message: trimmed });

      // Add optimistically if not already added by socket
      setMessages((prev) => {
        if (prev.some((m) => m._id === sentMsg._id)) {
          return prev;
        }
        return [...prev, sentMsg];
      });

      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      setInputText(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blood-50 border border-blood-100 flex items-center justify-center text-blood-700">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#17212B]">
              Emergency Coordination Chat
            </h3>
            <p className="text-xs text-slate-500">
              {patientName ? `Patient: ${patientName}` : 'Patient Coordination'}{' '}
              {hospitalName && `• ${hospitalName}`}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
          <span>Room Encrypted</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#F7F8FA]/50">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin text-blood-700" />
              <span>Loading emergency messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[#17212B]">No messages yet</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Coordinate arrival, hospital entrance, blood bank desk, or delays directly in real-time.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId?._id === user?._id;
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender name & blood group */}
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500 px-1">
                  <span className="font-semibold text-slate-700">
                    {isMe ? 'You' : msg.senderId?.fullName || 'Participant'}
                  </span>
                  {msg.senderId?.bloodGroup && (
                    <BloodBadge bloodGroup={msg.senderId.bloodGroup} size="sm" showIcon={false} />
                  )}
                  <span>•</span>
                  <span>{formatDate(msg.createdAt)}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm break-words ${
                    isMe
                      ? 'bg-blood-700 text-white rounded-br-xs'
                      : 'bg-white text-[#17212B] border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Footer */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type an emergency message or coordinate arrival..."
          maxLength={1000}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#17212B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blood-100 focus:border-blood-700 transition-colors"
        />
        <Button
          type="submit"
          variant="primary"
          isLoading={isSending}
          disabled={!inputText.trim()}
          className="shrink-0 px-4 py-2.5"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

