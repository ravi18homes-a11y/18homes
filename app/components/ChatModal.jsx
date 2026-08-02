"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, Send, MessageSquare, Clock, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

export default function ChatModal({ conversationId, isOpen, onClose, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    // Fetch conversation details & message history
    const fetchChatData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${databaseUrl}/api/chat/messages/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setConversation(data.data.conversation);
            setMessages(data.data.messages || []);
          }
        }
      } catch (err) {
        console.error("Error fetching chat data:", err);
        toast.error("Could not load chat messages");
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchChatData();

    // Connect socket
    socketRef.current = io(databaseUrl);
    socketRef.current.emit("join_room", conversationId);

    socketRef.current.on("receive_message", (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isOpen, conversationId, databaseUrl]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const textToSend = input.trim();
    setInput("");
    setSending(true);

    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("send_message", {
          conversationId,
          senderId: currentUser?._id || currentUser?.id,
          text: textToSend,
        });
      } else {
        // Fallback REST call
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${databaseUrl}/api/chat/messages/${conversationId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: textToSend }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.message) {
            setMessages((prev) => [...prev, data.data.message]);
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  if (!isOpen) return null;

  const isAccepted = conversation?.status === "accepted";
  const isPending = conversation?.status === "pending";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[600px] border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm leading-tight">
                {conversation?.property?.title || "Real-Time Property Chat"}
              </h3>
              <p className="text-[11px] text-indigo-100 flex items-center gap-1">
                {isAccepted ? (
                  <span className="flex items-center gap-1 text-emerald-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Chat Active
                  </span>
                ) : isPending ? (
                  <span className="text-amber-200 font-semibold">
                    Awaiting Dealer Acceptance
                  </span>
                ) : (
                  <span className="text-red-200 font-semibold">
                    Chat Request Declined
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {loading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span>Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <p className="text-xs font-semibold">
                No messages yet. Send a message to start chatting!
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const senderId = msg.sender?._id || msg.sender;
              const currentId = currentUser?._id || currentUser?.id;
              const isMine = String(senderId) === String(currentId);

              return (
                <div
                  key={msg._id || idx}
                  className={`flex flex-col ${
                    isMine ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium ${
                      isMine
                        ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-100"
                        : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Banner Status / Input */}
        {isPending ? (
          <div className="bg-amber-50 border-t border-amber-200 p-4 text-center">
            <p className="text-xs text-amber-800 font-semibold flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Chat request sent! Waiting for dealer to accept.</span>
            </p>
          </div>
        ) : conversation?.status === "rejected" ? (
          <div className="bg-red-50 border-t border-red-200 p-4 text-center">
            <p className="text-xs text-red-700 font-semibold flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>This chat request was declined.</span>
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl font-bold transition shadow-md flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
