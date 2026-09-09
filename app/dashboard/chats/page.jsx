"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import DashboardLayout from "../DashboardLayout";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Building,
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Loader2,
  ArrowLeft,
  ExternalLink,
  Phone,
  Mail,
  Sparkles,
  Filter,
  Check,
  X,
  MessageCircle,
} from "lucide-react";

const BASE_API_URL = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";
const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif";

function formatTimeAgo(dateString) {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatMessageTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatPropertyPrice(prop) {
  if (!prop) return "Price N/A";
  if (prop.priceText && String(prop.priceText).trim() !== "") {
    const text = String(prop.priceText).trim();
    return text.includes("₹") ? text : `₹ ${text}`;
  }

  const rawPrice = prop.priceValue !== undefined && prop.priceValue !== null ? prop.priceValue : prop.price;
  if (typeof rawPrice === "object" && rawPrice !== null && rawPrice.value) {
    return `₹ ${rawPrice.value} ${rawPrice.unit || ""}`;
  }

  const numPrice = Number(rawPrice);
  if (!isNaN(numPrice) && numPrice > 0) {
    if (numPrice >= 10000000) return `₹ ${(numPrice / 10000000).toFixed(2)} Cr`;
    if (numPrice >= 100000) return `₹ ${(numPrice / 100000).toFixed(2)} Lac`;
    return `₹ ${numPrice.toLocaleString("en-IN")}`;
  }

  return "Price N/A";
}

export default function DashboardChatsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [respondingReq, setRespondingReq] = useState(false);

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'pending' | 'accepted' | 'rejected'

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 1. Initial Load & Setup
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error loading user data:", e);
    }

    fetchConversations();
  }, []);

  // 2. Fetch Conversations
  const fetchConversations = async () => {
    setLoadingConvs(true);
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch(`${BASE_API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const fetchedConvs = data.data || [];
        setConversations(fetchedConvs);

        // Auto select conversation if conversationId is provided in URL
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const queryConvId = urlParams.get("conversationId");
          if (queryConvId) {
            const matched = fetchedConvs.find((c) => String(c._id) === String(queryConvId));
            if (matched) {
              setSelectedConv(matched);
            }
          }
        }
      } else {
        toast.error(data.message || "Failed to load chat conversations");
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      toast.error("Network error loading conversations");
    } finally {
      setLoadingConvs(false);
    }
  };

  // 3. Connect Socket & Fetch Messages when selectedConv changes
  useEffect(() => {
    if (!selectedConv?._id) return;

    const conversationId = selectedConv._id;
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const fetchChatMessages = async () => {
      setLoadingMsgs(true);
      try {
        const res = await fetch(
          `${BASE_API_URL}/api/chat/messages/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setMessages(data.data.messages || []);
          if (data.data.conversation) {
            setSelectedConv(data.data.conversation);
          }
        }
      } catch (err) {
        console.error("Error loading chat messages:", err);
        toast.error("Could not fetch chat messages");
      } finally {
        setLoadingMsgs(false);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchChatMessages();

    // Socket.io connection setup
    socketRef.current = io(BASE_API_URL);
    socketRef.current.emit("join_room", conversationId);

    const handleReceiveMessage = (newMsg) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });

      // Update last message in local conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: newMsg.text,
                lastMessageAt: new Date().toISOString(),
              }
            : c
        )
      );

      setTimeout(scrollToBottom, 100);
    };

    socketRef.current.on("receive_message", handleReceiveMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_message", handleReceiveMessage);
        socketRef.current.disconnect();
      }
    };
  }, [selectedConv?._id]);

  // 4. Handle Sending a Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConv?._id || sendingMsg) return;

    const textToSend = messageInput.trim();
    setMessageInput("");
    setSendingMsg(true);

    const conversationId = selectedConv._id;

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
          `${BASE_API_URL}/api/chat/messages/${conversationId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ text: textToSend }),
          }
        );
        const data = await res.json();
        if (res.ok && data.success && data.data?.message) {
          setMessages((prev) => [...prev, data.data.message]);
        }
      }

      // Update conversations list state locally
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: textToSend,
                lastMessageAt: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setSendingMsg(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // 5. Dealer Action: Respond to Chat Request (Accept/Reject)
  const handleRespondRequest = async (conversationId, action) => {
    if (!conversationId || respondingReq) return;
    setRespondingReq(true);

    const token = localStorage.getItem("authToken");
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/chat/request/${conversationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Chat request ${action} successfully!`);
        const updatedConv = data.data;

        // Update local state
        setConversations((prev) =>
          prev.map((c) => (c._id === conversationId ? updatedConv : c))
        );

        if (selectedConv?._id === conversationId) {
          setSelectedConv(updatedConv);
        }
      } else {
        toast.error(data.message || "Failed to update chat request");
      }
    } catch (err) {
      console.error("Error responding to chat request:", err);
      toast.error("Network error updating request status");
    } finally {
      setRespondingReq(false);
    }
  };

  // Helper to determine chat partner (Buyer vs Dealer/Owner)
  const getOtherParticipant = (conv) => {
    if (!conv || !currentUser) return null;
    const currentUserId = currentUser._id || currentUser.id;
    const buyerId = conv.buyer?._id || conv.buyer;
    const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";

    if (isAdmin) {
      const isDealerAdmin = String(conv.dealer?._id || conv.dealer) === String(currentUserId);
      return {
        isAdminView: true,
        buyer: conv.buyer,
        dealer: conv.dealer,
        isForAdmin: isDealerAdmin,
        user: isDealerAdmin ? conv.buyer : conv.dealer,
      };
    }

    if (String(buyerId) === String(currentUserId)) {
      return {
        isAdminView: false,
        user: conv.dealer,
        roleLabel: "Property Owner / Dealer",
      };
    } else {
      return {
        isAdminView: false,
        user: conv.buyer,
        roleLabel: "Property Inquirer / Buyer",
      };
    }
  };

  // Check if current user is dealer/owner for a conversation
  const isDealerOrOwner = (conv) => {
    if (!conv || !currentUser) return false;
    const currentUserId = currentUser._id || currentUser.id;
    const dealerId = conv.dealer?._id || conv.dealer;
    return String(dealerId) === String(currentUserId) || currentUser.role === "admin";
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const buyerName = conv.buyer?.name || "";
    const dealerName = conv.dealer?.name || "";
    const propertyTitle = conv.property?.title || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      buyerName.toLowerCase().includes(query) ||
      dealerName.toLowerCase().includes(query) ||
      propertyTitle.toLowerCase().includes(query);

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    return conv.status === statusFilter;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* TOP HEADER CARD */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white shadow-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner flex-shrink-0">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                  Messages & Inquiries
                </h1>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                  {conversations.length} {conversations.length === 1 ? "Chat" : "Chats"}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                Connect directly with property buyers, dealers, and owners in real time.
              </p>
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchConversations}
            disabled={loadingConvs}
            className="self-start sm:self-auto bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Loader2 className={`w-3.5 h-3.5 ${loadingConvs ? "animate-spin" : ""}`} />
            <span>Sync Inbox</span>
          </button>
        </div>

        {/* MAIN DUAL PANE CHAT CONTAINER */}
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden flex flex-col md:grid md:grid-cols-12 h-[calc(100vh-210px)] min-h-[500px] max-h-[820px]">

          {/* ================= LEFT PANE: CONVERSATION LIST ================= */}
          <div
            className={`
              md:col-span-5 lg:col-span-4 border-r border-slate-200/80 flex flex-col bg-slate-50/50 h-full overflow-hidden
              ${selectedConv ? "hidden md:flex" : "flex flex-1"}
            `}
          >
            {/* SEARCH & FILTERS BAR */}
            <div className="p-3 sm:p-4 border-b border-slate-200/80 space-y-2.5 bg-white flex-shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search buyer, dealer or property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: "all", label: "All" },
                  { id: "accepted", label: "Active" },
                  { id: "pending", label: "Pending" },
                  { id: "rejected", label: "Declined" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`
                      px-3 py-1 rounded-lg font-semibold text-[11px] whitespace-nowrap transition cursor-pointer
                      ${
                        statusFilter === tab.id
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CONVERSATION ITEMS SCROLL AREA */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0">
              {loadingConvs ? (
                <div className="h-64 flex flex-col items-center justify-center p-6 text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="text-xs font-medium">Loading conversations...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                  <MessageCircle className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-600">No conversations found</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px]">
                    {searchQuery || statusFilter !== "all"
                      ? "Try clearing your search or filters."
                      : "When buyers initiate property inquiries, chats will appear here."}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const partnerInfo = getOtherParticipant(conv);
                  const partner = partnerInfo?.user;
                  const isSelected = selectedConv?._id === conv._id;
                  const isPending = conv.status === "pending";
                  const canAccept = isPending && isDealerOrOwner(conv);

                  return (
                    <div
                      key={conv._id}
                      onClick={() => setSelectedConv(conv)}
                      className={`
                        p-3.5 transition cursor-pointer border-l-4 flex items-start gap-3 relative
                        ${
                          isSelected
                            ? "bg-indigo-50/70 border-l-indigo-600 shadow-xs"
                            : "bg-white hover:bg-slate-50 border-l-transparent"
                        }
                      `}
                    >
                      {/* Avatar */}
                      <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 flex-shrink-0 shadow-xs">
                        <Image
                          src={partner?.avatar || DEFAULT_AVATAR}
                          alt={partner?.name || "Participant"}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Info & Snippet */}
                      <div className="flex-1 min-w-0">
                        {currentUser?.role === "admin" || currentUser?.role === "super_admin" ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1">
                                <span className="text-slate-900 font-extrabold truncate">{conv.buyer?.name || "Buyer"}</span>
                                <span className="text-indigo-500 font-black text-[10px] flex-shrink-0">↔</span>
                                <span className="text-indigo-700 font-bold truncate">{conv.dealer?.name || "Owner/Dealer"}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                                {formatTimeAgo(conv.lastMessageAt || conv.updatedAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {partnerInfo?.isForAdmin ? (
                                <span className="bg-purple-100 text-purple-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-purple-200">
                                  👑 Direct Inquiry for Admin
                                </span>
                              ) : (
                                <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-100">
                                  👤 Buyer ({conv.buyer?.name || "Buyer"}) ↔ Dealer ({conv.dealer?.name || "Dealer"})
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {partner?.name || "User"}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                              {formatTimeAgo(conv.lastMessageAt || conv.updatedAt)}
                            </span>
                          </div>
                        )}

                        {/* Property Badge */}
                        <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-0.5 truncate">
                          <Home className="w-3 h-3 flex-shrink-0 text-blue-500" />
                          <span className="truncate">{conv.property?.title || "Property Chat"}</span>
                        </div>

                        {/* Last Message */}
                        <p className="text-[11px] text-slate-500 truncate mt-1">
                          {conv.lastMessage || "No messages yet"}
                        </p>

                        {/* Status Tag */}
                        <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
                          {conv.status === "accepted" ? (
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active Chat
                            </span>
                          ) : conv.status === "pending" ? (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Request
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-500" />
                              Declined
                            </span>
                          )}

                          {/* Role tag */}
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                            {partner?.role || "User"}
                          </span>
                        </div>

                        {/* Quick Accept/Reject Actions for Dealer */}
                        {canAccept && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRespondRequest(conv._id, "accepted");
                              }}
                              disabled={respondingReq}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2.5 rounded-lg transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRespondRequest(conv._id, "rejected");
                              }}
                              disabled={respondingReq}
                              className="flex-1 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 text-[11px] font-bold py-1 px-2.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                              <span>Decline</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT PANE: ACTIVE CHAT VIEW ================= */}
          <div
            className={`
              md:col-span-7 lg:col-span-8 flex flex-col bg-white h-full overflow-hidden
              ${!selectedConv ? "hidden md:flex" : "flex flex-1"}
            `}
          >
            {!selectedConv ? (
              /* EMPTY CHAT SELECTION STATE */
              <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-slate-50/40">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
                  <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
                </div>
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                  Select a Conversation
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
                  Choose an existing conversation from the list to view message history, accept inquiries, and chat live.
                </p>
                <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200/80 max-w-xs text-left shadow-xs">
                  <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider block mb-1">
                    Features Included
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                      <span>Instant Socket.io real-time chat</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span>Direct link to listed property</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>Dealer request approval control</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              /* ACTIVE CHAT MAIN WINDOW */
              <>
                {/* ACTIVE CHAT TOP BAR */}
                <div className="p-3.5 sm:p-4 border-b border-slate-200/80 bg-white flex items-center justify-between gap-2.5 shadow-xs flex-shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Back Button (Mobile) */}
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="md:hidden flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl border border-indigo-200/80 transition cursor-pointer flex-shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Inbox</span>
                    </button>

                    {/* Partner Avatar & Info Header */}
                    {(() => {
                      const partnerInfo = getOtherParticipant(selectedConv);
                      const partner = partnerInfo?.user;
                      const isAdmin = currentUser?.role === "admin" || currentUser?.role === "super_admin";
                      const buyer = selectedConv.buyer;
                      const dealer = selectedConv.dealer;

                      if (isAdmin) {
                        return (
                          <>
                            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 flex-shrink-0 shadow-xs">
                              <Image
                                src={buyer?.avatar || dealer?.avatar || DEFAULT_AVATAR}
                                alt="Participants"
                                fill
                                className="object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                                  <span>{buyer?.name || "Buyer"}</span>
                                  <span className="text-indigo-600 mx-1">↔</span>
                                  <span className="text-indigo-800">{dealer?.name || "Dealer"}</span>
                                </h3>
                                {partnerInfo?.isForAdmin ? (
                                  <span className="text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-md border border-purple-200">
                                    👑 Sent to Admin
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md border border-indigo-100">
                                    👥 User-to-User
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-slate-500 text-[10px] sm:text-[11px] mt-0.5 truncate">
                                <span>Buyer: <strong className="text-slate-700">{buyer?.name}</strong> ({buyer?.phone || buyer?.email || "N/A"})</span>
                                <span className="hidden md:inline">|</span>
                                <span className="hidden md:inline">Dealer: <strong className="text-slate-700">{dealer?.name}</strong> ({dealer?.phone || dealer?.email || "N/A"})</span>
                              </div>
                            </div>
                          </>
                        );
                      }

                      return (
                        <>
                          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 flex-shrink-0 shadow-xs">
                            <Image
                              src={partner?.avatar || DEFAULT_AVATAR}
                              alt={partner?.name || "Partner"}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[130px] sm:max-w-[200px]">
                                {partner?.name || "Participant"}
                              </h3>
                              <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                                {partner?.role || "User"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5 truncate">
                              {partner?.phone && (
                                <span className="flex items-center gap-1 truncate text-[10px] sm:text-[11px]">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {partner.phone}
                                </span>
                              )}
                              {partner?.email && (
                                <span className="hidden lg:flex items-center gap-1 truncate text-[11px]">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  {partner.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Property Quick Card Badge */}
                  {selectedConv?.property && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-1.5 sm:p-2 flex items-center gap-2 max-w-[140px] sm:max-w-[230px] flex-shrink-0">
                      {selectedConv.property.images?.[0] ? (
                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                          <Image
                            src={selectedConv.property.images[0]}
                            alt={selectedConv.property.title || "Property"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Home className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 hidden sm:block">
                        <p className="font-bold text-[11px] text-slate-900 truncate leading-tight">
                          {selectedConv.property.title}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                          {formatPropertyPrice(selectedConv.property)}
                        </p>
                      </div>
                      <Link
                        href={`/buy/property-details?id=${selectedConv.property._id}`}
                        target="_blank"
                        className="p-1 sm:p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition flex-shrink-0"
                        title="View Property Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* STATUS ALERT BANNER (For Pending / Rejected Requests) */}
                {selectedConv.status === "pending" && (
                  <div className="bg-amber-50 border-b border-amber-200/80 px-3.5 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 flex-shrink-0">
                    <div className="flex items-center gap-2 text-amber-900 text-xs font-semibold">
                      <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>
                        {isDealerOrOwner(selectedConv)
                          ? "This buyer requested to chat with you about this property listing."
                          : "Chat request submitted! Waiting for property owner to accept."}
                      </span>
                    </div>

                    {isDealerOrOwner(selectedConv) && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleRespondRequest(selectedConv._id, "accepted")}
                          disabled={respondingReq}
                          className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => handleRespondRequest(selectedConv._id, "rejected")}
                          disabled={respondingReq}
                          className="flex-1 sm:flex-initial bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedConv.status === "rejected" && (
                  <div className="bg-rose-50 border-b border-rose-200/80 px-4 py-2.5 flex items-center gap-2 text-rose-800 text-xs font-semibold flex-shrink-0">
                    <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>This chat request was declined. Further messaging is disabled.</span>
                  </div>
                )}

                {/* MESSAGES LIST AREA */}
                <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/60 min-h-0">
                  {loadingMsgs ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                      <span>Loading message history...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                      <MessageCircle className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs font-bold text-slate-700">No messages sent yet</p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        {selectedConv.status === "accepted"
                          ? "Send a message below to start your conversation."
                          : "Messaging will unlock once the chat request is accepted."}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const senderId = msg.sender?._id || msg.sender;
                      const currentUserId = currentUser?._id || currentUser?.id;
                      const isMine = String(senderId) === String(currentUserId);
                      const senderName = msg.sender?.name || (isMine ? "You" : "Participant");

                      return (
                        <div
                          key={msg._id || index}
                          className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                        >
                          {!isMine && (
                            <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                              {senderName}
                            </span>
                          )}
                          <div
                            className={`
                              max-w-[88%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed shadow-xs
                              ${
                                isMine
                                  ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-blue-600 text-white rounded-br-xs"
                                  : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs"
                              }
                            `}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 px-1 font-medium">
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* BOTTOM MESSAGE INPUT BAR */}
                <div className="p-3 sm:p-3.5 bg-white border-t border-slate-200/80 flex-shrink-0">
                  {selectedConv.status !== "accepted" ? (
                    <div className="text-center py-2 text-xs text-slate-400 font-medium">
                      Messaging is disabled until chat request status is <strong>Accepted</strong>.
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Type your message here..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        disabled={sendingMsg}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim() || sendingMsg}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-2xl font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer text-xs flex-shrink-0"
                      >
                        {sendingMsg ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span className="hidden sm:inline">Send</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
