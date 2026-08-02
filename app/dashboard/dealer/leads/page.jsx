"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../DashboardLayout";
import ChatModal from "../../../components/ChatModal";
import {
  Users,
  Search,
  MessageSquare,
  Phone,
  MessageCircle,
  Calendar,
  Building,
  Building2,
  Home,
  CheckCircle2,
  Clock,
  UserCheck,
  ChevronRight,
  Filter,
  RefreshCw,
  Tag,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";

const DEFAULT_PROPERTY_IMG =
  "https://res.cloudinary.com/domwj0m7s/image/upload/v1785084052/ChatGPT_Image_Jul_26_2026_10_10_07_PM_uuqc8u.png";

const parsePhoneNumber = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { isValid: false, formattedDisplay: "", waNumber: "", callNumber: "" };
  }

  let digits = rawPhone.replace(/\D/g, "");
  if (!digits || digits.length < 7) {
    return { isValid: false, formattedDisplay: rawPhone, waNumber: "", callNumber: "" };
  }

  // Handle leading zero (e.g. 09876543210 -> 9876543210)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  // Prepend country code 91 if 10 digits
  if (digits.length === 10) {
    digits = "91" + digits;
  }

  const waNumber = digits;
  const callNumber = `+${digits}`;
  const formattedDisplay =
    digits.startsWith("91") && digits.length === 12
      ? `+91 ${digits.substring(2, 7)} ${digits.substring(7)}`
      : `+${digits}`;

  return { isValid: true, formattedDisplay, waNumber, callNumber };
};

export default function ClientLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [mainView, setMainView] = useState("leads"); // "leads" | "chats"
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Chat Modal State
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  useEffect(() => {
    try {
      const u = localStorage.getItem("userData");
      if (u) setCurrentUser(JSON.parse(u));
    } catch (e) {}
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to view client leads");
        setLoading(false);
        return;
      }

      // Fetch Contact Leads
      const res = await fetch(`${databaseUrl}/api/contacts?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.contacts) {
          setLeads(data.data.contacts);
        } else if (Array.isArray(data.data)) {
          setLeads(data.data);
        }
      }

      // Fetch Conversations
      const chatRes = await fetch(`${databaseUrl}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (chatRes.ok) {
        const chatData = await chatRes.json();
        if (chatData.success && Array.isArray(chatData.data)) {
          setConversations(chatData.data);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (leadId, newStatus) => {
    setUpdatingId(leadId);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${databaseUrl}/api/contacts/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Lead status updated to "${newStatus.replace("_", " ")}"`);
        setLeads((prev) =>
          prev.map((item) =>
            item._id === leadId ? { ...item, status: newStatus } : item
          )
        );
      } else {
        toast.error("Could not update lead status");
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChatResponse = async (convId, action) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${databaseUrl}/api/chat/request/${convId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        toast.success(
          action === "accepted"
            ? "Chat request accepted!"
            : "Chat request declined"
        );
        setConversations((prev) =>
          prev.map((c) => (c._id === convId ? { ...c, status: action } : c))
        );
      } else {
        toast.error("Failed to update chat request");
      }
    } catch (err) {
      console.error("Chat response error:", err);
      toast.error("Error responding to chat request");
    }
  };

  const openChat = (convId) => {
    setSelectedConvId(convId);
    setIsChatOpen(true);
  };

  const [leadTypeFilter, setLeadTypeFilter] = useState("all"); // "all", "project", "property"

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const buyerName = lead.buyer?.name || "";
    const buyerPhone = lead.buyer?.phone || "";
    const title = lead.project?.projectName || lead.property?.title || "";
    const message = lead.message || "";
    const status = lead.status || "new";

    const isProjectLead = !!lead.project;
    const isPropertyLead = !!lead.property;

    const matchesType =
      leadTypeFilter === "all" ||
      (leadTypeFilter === "project" && isProjectLead) ||
      (leadTypeFilter === "property" && isPropertyLead);

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "new" && status === "new") ||
      (activeTab === "in_progress" && (status === "contacted" || status === "site_visit")) ||
      (activeTab === "closed" && status === "closed");

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      buyerName.toLowerCase().includes(query) ||
      buyerPhone.includes(query) ||
      title.toLowerCase().includes(query) ||
      message.toLowerCase().includes(query);

    return matchesType && matchesTab && matchesSearch;
  });

  const pendingChatRequests = conversations.filter(
    (c) => c.status === "pending"
  );
  const activeChats = conversations.filter((c) => c.status === "accepted");

  // Counter stats
  const totalLeads = leads.length;
  const projectLeadsCount = leads.filter((l) => !!l.project).length;
  const propertyLeadsCount = leads.filter((l) => !!l.property && !l.project).length;
  const newLeadsCount = leads.filter(
    (l) => !l.status || l.status === "new"
  ).length;
  const inProgressCount = leads.filter(
    (l) => l.status === "contacted" || l.status === "site_visit"
  ).length;
  const closedCount = leads.filter((l) => l.status === "closed").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              Client Lead CRM & Live Chat Inbox
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              Property Inquiries & Live Requests
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1">
              Manage inquiries, accept real-time buyer chat requests, and track deals.
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border border-white/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Inbox</span>
          </button>
        </div>

        {/* View Selector (Leads Inbox vs Real-Time Live Chats) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMainView("leads")}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 ${
              mainView === "leads"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Enquiries ({totalLeads})</span>
          </button>

          <button
            onClick={() => setMainView("chats")}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 relative ${
              mainView === "chats"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-100"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Live Chat Requests ({conversations.length})</span>
            {pendingChatRequests.length > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1"></span>
            )}
          </button>
        </div>

        {mainView === "leads" ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Total Leads</p>
                  <h4 className="text-xl font-black text-slate-900">{totalLeads}</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">New Enquiries</p>
                  <h4 className="text-xl font-black text-amber-600">
                    {newLeadsCount}
                  </h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">In Progress</p>
                  <h4 className="text-xl font-black text-blue-600">
                    {inProgressCount}
                  </h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Deals Closed</p>
                  <h4 className="text-xl font-black text-emerald-600">
                    {closedCount}
                  </h4>
                </div>
              </div>
            </div>

            {/* Filter Bar & Search */}
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm space-y-3">
              {/* Type Category Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-2">
                  Category:
                </span>
                <button
                  onClick={() => setLeadTypeFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    leadTypeFilter === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>All Inquiries</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                    {totalLeads}
                  </span>
                </button>

                <button
                  onClick={() => setLeadTypeFilter("project")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    leadTypeFilter === "project"
                      ? "bg-purple-700 text-white shadow-md shadow-purple-100"
                      : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-100"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>🏢 Project Site Visits</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-black">
                    {projectLeadsCount}
                  </span>
                </button>

                <button
                  onClick={() => setLeadTypeFilter("property")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    leadTypeFilter === "property"
                      ? "bg-blue-700 text-white shadow-md shadow-blue-100"
                      : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-100"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>🏠 Property Listings</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-black">
                    {propertyLeadsCount}
                  </span>
                </button>
              </div>

              {/* Status Tabs & Search */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                  {[
                    { id: "all", label: "All Status", count: totalLeads },
                    { id: "new", label: "New", count: newLeadsCount },
                    { id: "contacted", label: "Contacted", count: leads.filter(l => l.status === "contacted").length },
                    { id: "site_visit", label: "Site Visit", count: leads.filter(l => l.status === "site_visit").length },
                    { id: "closed", label: "Closed", count: closedCount },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
                        activeTab === tab.id
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          activeTab === tab.id
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search buyer name, phone, project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Leads List */}
            {loading ? (
              <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-500">
                  Fetching client inquiries...
                </p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No Inquiries Found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchTerm
                    ? "No inquiries matched your search filter."
                    : "When buyers request a Site Visit or contact you, their inquiries will appear here."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLeads.map((lead) => {
                  const buyerName = lead.name || lead.buyer?.name || "Interested Buyer";
                  const buyerPhone = lead.phone || lead.buyer?.phone || "";
                  const buyerEmail = lead.email || lead.buyer?.email || "";
                  const property = lead.property || null;
                  const project = lead.project || null;
                  const isProject = !!project;

                  const leadTitle = isProject
                    ? project.projectName
                    : property?.title || "Real Estate Inquiry";

                  const leadImg = isProject
                    ? project.images?.[0] || DEFAULT_PROPERTY_IMG
                    : property?.images?.[0] || DEFAULT_PROPERTY_IMG;

                  const currentStatus = lead.status || "new";

                  const phoneInfo = parsePhoneNumber(buyerPhone);
                  const whatsappMessage = encodeURIComponent(
                    `Hello ${buyerName}, thank you for inquiring about "${leadTitle}" on 18homes. How can I help you?`
                  );
                  const whatsappUrl = phoneInfo.isValid
                    ? `https://wa.me/${phoneInfo.waNumber}?text=${whatsappMessage}`
                    : null;

                  const callUrl = phoneInfo.isValid
                    ? `tel:${phoneInfo.callNumber}`
                    : buyerPhone ? `tel:${buyerPhone}` : null;

                  return (
                    <div
                      key={lead._id}
                      className={`bg-white rounded-3xl p-6 border-2 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
                        isProject
                          ? "border-purple-200 shadow-md shadow-purple-50/50"
                          : "border-slate-100 hover:border-indigo-200 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <img
                          src={leadImg}
                          alt={leadTitle}
                          className="w-20 h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                        />

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {/* Source Badge */}
                            {isProject ? (
                              <span className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                <span>PROJECT SITE VISIT</span>
                              </span>
                            ) : (
                              <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                <span>PROPERTY LISTING</span>
                              </span>
                            )}

                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                currentStatus === "new"
                                  ? "bg-amber-100 text-amber-800"
                                  : currentStatus === "contacted"
                                  ? "bg-blue-100 text-blue-800"
                                  : currentStatus === "site_visit"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {currentStatus.replace("_", " ")}
                            </span>

                            <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto">
                              <Calendar className="w-3 h-3" />
                              {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                            Buyer Name: <span className="text-purple-700">{buyerName}</span>
                          </h3>

                          {buyerPhone && (
                            <p className="text-xs text-slate-600 font-bold">
                              Phone: <span className="text-slate-900">{phoneInfo.isValid ? phoneInfo.formattedDisplay : buyerPhone}</span> {buyerEmail && `| Email: ${buyerEmail}`}
                            </p>
                          )}

                          <p className="text-xs text-indigo-600 font-bold flex items-center gap-1 pt-1">
                            <Building className="w-3.5 h-3.5" />
                            <span>{leadTitle}</span>
                            {isProject && project.priceRange?.displayPrice && (
                              <span className="text-slate-500 font-normal">
                                ({project.priceRange.displayPrice})
                              </span>
                            )}
                          </p>

                          {lead.message && (
                            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100 mt-2 font-medium">
                              "{lead.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {callUrl && (
                          <a
                            href={callUrl}
                            className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Phone className="w-4 h-4" />
                            <span>Call</span>
                          </a>
                        )}

                        <div className="flex-1 sm:flex-initial min-w-[130px]">
                          <select
                            value={currentStatus}
                            disabled={updatingId === lead._id}
                            onChange={(e) =>
                              handleStatusChange(lead._id, e.target.value)
                            }
                            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer transition"
                          >
                            <option value="new">Status: New</option>
                            <option value="contacted">Status: Contacted</option>
                            <option value="site_visit">Status: Site Visit</option>
                            <option value="closed">Status: Closed Deal</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* REAL-TIME CHAT REQUESTS VIEW */
          <div className="space-y-6">
            {conversations.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center space-y-3">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">
                  No Chat Requests Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When buyers send a live chat request on your property, it will appear here for your approval.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv) => {
                  const isPending = conv.status === "pending";
                  const isAccepted = conv.status === "accepted";

                  return (
                    <div
                      key={conv._id}
                      className="bg-white rounded-3xl p-6 border-2 border-slate-100 hover:border-purple-200 hover:shadow-lg transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              isPending
                                ? "bg-amber-100 text-amber-800"
                                : isAccepted
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {conv.status}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(conv.lastMessageAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-base">
                          {conv.buyer?.name || "Interested Buyer"}
                        </h3>

                        <p className="text-xs text-purple-600 font-bold flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          <span>{conv.property?.title || "Property Listing"}</span>
                        </p>

                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                          "{conv.lastMessage || "Chat Request Sent"}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleChatResponse(conv._id, "accepted")}
                              className="flex-1 md:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1 shadow-md"
                            >
                              <Check className="w-4 h-4" />
                              <span>Accept Request</span>
                            </button>
                            <button
                              onClick={() => handleChatResponse(conv._id, "rejected")}
                              className="flex-1 md:flex-initial bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              <span>Decline</span>
                            </button>
                          </>
                        ) : isAccepted ? (
                          <button
                            onClick={() => openChat(conv._id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-purple-100"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Open Live Chat</span>
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            Request Declined
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Real-time Chat Modal */}
      <ChatModal
        conversationId={selectedConvId}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={currentUser}
      />
    </DashboardLayout>
  );
}
