"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../DashboardLayout";
import {
  BarChart3,
  Users,
  PhoneCall,
  Clock,
  Building2,
  MapPin,
  Eye,
  FileText,
  X,
  ChevronRight,
  Download,
  Phone,
  Mail,
  TrendingUp,
  RefreshCw,
  Search,
  Lock,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function DedicatedAnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedMetricModal, setSelectedMetricModal] = useState(null);
  const [activeLeadFilter, setActiveLeadFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  // Real-time Analytics State initialized with 0
  const [analyticsData, setAnalyticsData] = useState({
    visitorsCount: 0,
    phoneClickCount: 0,
    whatsAppClickCount: 0,
    propertiesViewsCount: 0,
    averageTimeMin: "0 min",
    mostViewedFlat: "N/A",
    mostInterestedCity: "N/A",
  });

  const [rawEvents, setRawEvents] = useState([]);
  const [leadLogs, setLeadLogs] = useState([]);
  const [categorizedLogs, setCategorizedLogs] = useState({
    visitors: [],
    phone: [],
    whatsapp: [],
    contact: [],
    all: [],
  });

  useEffect(() => {
    try {
      const u = localStorage.getItem("userData");
      if (u) {
        const parsed = JSON.parse(u);
        setUser(parsed);
        const role = parsed?.role;
        if (role && role !== "builder" && role !== "dealer" && role !== "admin" && role !== "super_admin") {
          toast.error("Access denied. Project Analytics is only available for Builders, Dealers, and Admins.");
          router.replace("/dashboard");
          return;
        }
      }
    } catch (e) {}

    const handleStorageChange = () => {
      try {
        const u = localStorage.getItem("userData");
        if (u) {
          const parsed = JSON.parse(u);
          setUser(parsed);
          const role = parsed?.role;
          if (role && role !== "builder" && role !== "dealer" && role !== "admin" && role !== "super_admin") {
            toast.error("Access denied. Project Analytics is only available for Builders, Dealers, and Admins.");
            router.replace("/dashboard");
          }
        }
      } catch (e) {}
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [router]);

  const loadAnalytics = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const storedUserDataStr = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
      let currentUserObj = user;
      if (storedUserDataStr) {
        try { currentUserObj = JSON.parse(storedUserDataStr); } catch (e) {}
      }

      const currentBuilderId = String(currentUserObj?.id || currentUserObj?._id || "");
      const currentBuilderEmail = String(currentUserObj?.email || "").toLowerCase();

      const queryParams = new URLSearchParams();
      if (currentBuilderId) queryParams.set("builderId", currentBuilderId);
      if (currentBuilderEmail) queryParams.set("builderEmail", currentBuilderEmail);

      const token = localStorage.getItem("authToken");

      // Try local Next.js route first, fallback to databaseUrl
      let res = await fetch(`/api/analytics/builder?${queryParams.toString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" }
      });

      if (!res.ok) {
        res = await fetch(`${databaseUrl}/api/properties/analytics/builder?${queryParams.toString()}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        });
      }

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data;
          
          setAnalyticsData({
            visitorsCount: data.visitorsCount || 0,
            phoneClickCount: data.phoneClickCount || 0,
            whatsAppClickCount: data.whatsAppClickCount || 0,
            propertiesViewsCount: data.propertiesViewsCount || 0,
            averageTimeMin: data.averageTimeMin || "0 min",
            mostViewedFlat: data.mostViewedFlat || "N/A",
            mostInterestedCity: data.mostInterestedCity || "N/A",
          });

          const ownPropertyEvents = data.events || [];
          setRawEvents(ownPropertyEvents);

          const getVisitorKey = (ev) => {
            const email = (ev.userEmail || "").toLowerCase().trim();
            const phone = (ev.userPhone || "").trim();
            const visitorId = (ev.visitorId || "").trim();
            const userName = (ev.userName || "").trim();

            if (email && email !== "visitor@18homes.in" && email !== "guest@18homes.in") {
              return email;
            }
            if (phone && phone !== "+91 98765 43210" && phone !== "9876543210") {
              return phone;
            }
            if (visitorId) {
              return visitorId;
            }
            if (userName && userName.toLowerCase() !== "guest visitor") {
              return userName.toLowerCase();
            }
            return email || phone || "anonymous_guest";
          };

          const getUniqueUserLogs = (eventList) => {
            const userMap = new Map();
            eventList.forEach((ev) => {
              const key = getVisitorKey(ev);
              if (!userMap.has(key)) {
                userMap.set(key, { ...ev, viewCount: 1 });
              } else {
                const existing = userMap.get(key);
                existing.viewCount = (existing.viewCount || 1) + 1;
                if (ev.timestamp && (!existing.timestamp || new Date(ev.timestamp) > new Date(existing.timestamp))) {
                  existing.timestamp = ev.timestamp;
                }
              }
            });
            return Array.from(userMap.values());
          };

          const visitorLogs = getUniqueUserLogs(ownPropertyEvents.filter((e) => e.eventType === "visitor" || e.eventType === "page_view"));
          const phoneLogs = getUniqueUserLogs(ownPropertyEvents.filter((e) => e.eventType === "phone_click"));
          const whatsAppLogs = getUniqueUserLogs(ownPropertyEvents.filter((e) => e.eventType === "whatsapp_click"));
          const contactLogs = getUniqueUserLogs(ownPropertyEvents.filter((e) => e.eventType === "view_contact"));

          const allUniqueUserLogs = getUniqueUserLogs(ownPropertyEvents);
          setLeadLogs(allUniqueUserLogs);
          setCategorizedLogs({
            visitors: visitorLogs,
            phone: phoneLogs,
            whatsapp: whatsAppLogs,
            contact: contactLogs,
            all: allUniqueUserLogs,
          });
        }
      }
    } catch (err) {
      console.error("Error calculations in analytics loading:", err);
      if (isInitial) toast.error("Error loading analytics data");
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(true);
    const interval = setInterval(() => {
      loadAnalytics(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getFilteredLogsForModal = () => {
    if (!selectedMetricModal || selectedMetricModal === "all") return categorizedLogs.all;
    if (selectedMetricModal === "phone") return categorizedLogs.phone;
    if (selectedMetricModal === "whatsapp") return categorizedLogs.whatsapp;
    if (selectedMetricModal === "contact") return categorizedLogs.contact;
    if (selectedMetricModal === "visitors") return categorizedLogs.visitors;
    return categorizedLogs.all;
  };

  const modalLogs = getFilteredLogsForModal();

  const getVisitorKey = (ev) => {
    const email = (ev.userEmail || "").toLowerCase().trim();
    const phone = (ev.userPhone || "").trim();
    const visitorId = (ev.visitorId || "").trim();
    const userName = (ev.userName || "").trim();

    if (email && email !== "visitor@18homes.in" && email !== "guest@18homes.in") {
      return email;
    }
    if (phone && phone !== "+91 98765 43210" && phone !== "9876543210") {
      return phone;
    }
    if (visitorId) {
      return visitorId;
    }
    if (userName && userName.toLowerCase() !== "guest visitor") {
      return userName.toLowerCase();
    }
    return email || phone || "anonymous_guest";
  };

  const getPropertyViewGroups = () => {
    const viewsList = rawEvents.filter((e) => e.eventType === "visitor" || e.eventType === "page_view" || !e.eventType);
    const groupsMap = new Map();

    viewsList.forEach((ev) => {
      const propId = ev.propertyId || ev.property_id || (typeof ev.property === "object" ? (ev.property?._id || ev.property?.id) : ev.property) || "Unknown Property";
      const title = ev.flatUnit || ev.propertyTitle || "Property Listing";
      const key = `${propId}_${title}`.toLowerCase();

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          propertyId: propId,
          title: title,
          city: ev.city || "Noida",
          totalViews: 0,
          uniqueVisitorsSet: new Set(),
          uniqueBuyersMap: new Map(),
          recentLogs: [],
        });
      }

      const group = groupsMap.get(key);
      group.totalViews += 1;
      group.recentLogs.push(ev);

      const userKey = getVisitorKey(ev);
      if (userKey) {
        group.uniqueVisitorsSet.add(userKey);
        if (!group.uniqueBuyersMap.has(userKey)) {
          group.uniqueBuyersMap.set(userKey, {
            userName: ev.userName || "Guest Visitor",
            userPhone: ev.userPhone || "",
            userEmail: ev.userEmail || "",
            timestamp: ev.timestamp,
            views: 1,
          });
        } else {
          const buyer = group.uniqueBuyersMap.get(userKey);
          buyer.views += 1;
          if (ev.timestamp && (!buyer.timestamp || new Date(buyer.timestamp) > new Date(buyer.timestamp))) {
            buyer.timestamp = ev.timestamp;
          }
        }
      }
    });

    return Array.from(groupsMap.values()).map((g) => ({
      ...g,
      uniqueVisitorsCount: g.uniqueVisitorsSet.size,
      uniqueBuyersList: Array.from(g.uniqueBuyersMap.values()),
    }));
  };

  const propertyViewGroups = getPropertyViewGroups();

  const handleExportCSV = () => {
    if (selectedMetricModal === "property_views") {
      if (!propertyViewGroups || propertyViewGroups.length === 0) return;
      const headers = ["Property Title", "Property ID", "City", "Total Views", "Unique Buyers Count"];
      const rows = propertyViewGroups.map((g) => [
        `"${g.title}"`,
        `"${g.propertyId}"`,
        `"${g.city}"`,
        `"${g.totalViews}"`,
        `"${g.uniqueVisitorsCount}"`,
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `property_views_breakdown_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!modalLogs || modalLogs.length === 0) return;
    const headers = ["User Name", "Phone", "Email", "Property Title", "Flat/Unit", "City", "Event Type", "Views Count", "Date/Time"];
    const rows = modalLogs.map((log) => [
      `"${log.userName || 'Guest'}"`,
      `"${log.userPhone || 'N/A'}"`,
      `"${log.userEmail || 'N/A'}"`,
      `"${log.propertyTitle || 'N/A'}"`,
      `"${log.flatUnit || 'N/A'}"`,
      `"${log.city || 'N/A'}"`,
      `"${log.eventType || 'visitor'}"`,
      `"${log.viewCount || 1}"`,
      `"${log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_leads_${selectedMetricModal || "all"}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeadLogs = leadLogs.filter((log) => {
    if (activeLeadFilter === "phone") return log.eventType === "phone_click";
    if (activeLeadFilter === "whatsapp") return log.eventType === "whatsapp_click";
    if (activeLeadFilter === "contact") return log.eventType === "view_contact";
    if (activeLeadFilter === "visitor") return log.eventType === "visitor" || log.eventType === "page_view";
    return true;
  });

  if (user && user.role !== "builder" && user.role !== "dealer" && user.role !== "admin" && user.role !== "super_admin") {
    return (
      <DashboardLayout>
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto my-12 space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500">
            Project Analytics is exclusively reserved for Builder, Dealer, and Admin accounts.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2.5 bg-[#8c4bdc] text-white text-xs font-bold rounded-xl shadow"
          >
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const accessLevel = user?.planRules?.analyticsAccess || 1;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isFreePlan = !isAdmin && accessLevel < 3;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* HEADER & PAGE TITLE */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                  Real-Time Analytics & Leads
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Sync
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Property Analytics Dashboard
              </h1>
              <p className="text-purple-200 text-xs sm:text-sm mt-1">
                Real-time buyer inquiries, property details views, phone calls & WhatsApp lead logs for your listings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  toast.success("Analytics data refreshed!");
                  loadAnalytics(true);
                }}
                disabled={loading}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition border border-white/15 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh Data</span>
              </button>

              <Link
                href={user?.role === "dealer" ? "/dashboard/dealer" : user?.role === "builder" ? "/dashboard/builder" : "/dashboard"}
                className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-2xl font-bold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* FREE PLAN WARNING BANNER */}
        {isFreePlan && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-amber-950 text-base">
                  Analytics & Buyer Inquiries Locked (Free Plan)
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Upgrade to Gold Plan to unlock 3 analytics features (Total Visitors, Phone Clicks, and WhatsApp Clicks)!
                </p>
              </div>
            </div>
            <Link
              href="/membership"
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap shadow"
            >
              Upgrade to Gold
            </Link>
          </div>
        )}

        {/* 7 ANALYTICS METRIC CARDS GRID */}
        {(() => {
          const canAccessVisitors = isAdmin || accessLevel >= 3;
          const canAccessPhone = isAdmin || accessLevel >= 3;
          const canAccessWhatsapp = isAdmin || accessLevel >= 3;
          const canAccessViews = isAdmin || accessLevel >= 5;
          const canAccessRetention = isAdmin || accessLevel >= 5;
          const canAccessTrendingFlat = isAdmin || accessLevel >= 7;
          const canAccessTrendingCity = isAdmin || accessLevel >= 7;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              
              {/* Card 1: Visitors Count */}
              <div
                onClick={() => {
                  if (!canAccessVisitors) {
                    toast.error("Upgrade your plan to Gold or higher to view analytics!");
                    return;
                  }
                  setSelectedMetricModal("visitors");
                }}
                className={`bg-white p-6 rounded-3xl border shadow-sm transition relative overflow-hidden ${
                  canAccessVisitors
                    ? "cursor-pointer border-slate-200 hover:shadow-xl hover:border-blue-500 group"
                    : "border-slate-100 opacity-80"
                }`}
              >
                {!canAccessVisitors && (
                  <span className="absolute top-3.5 right-3.5 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                    <Lock className="w-2.5 h-2.5" /> Gold
                  </span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  {canAccessVisitors && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
                      View Logs &rarr;
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Visitors
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {canAccessVisitors ? (categorizedLogs.visitors.length || analyticsData.visitorsCount || 0) : "🔒 Locked"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Unique users who viewed your property listings
                </p>
              </div>

              {/* Card 2: Phone Click Count */}
              <div
                onClick={() => {
                  if (!canAccessPhone) {
                    toast.error("Upgrade your plan to Gold or higher to view phone click analytics!");
                    return;
                  }
                  setSelectedMetricModal("phone");
                }}
                className={`bg-white p-6 rounded-3xl border shadow-sm transition relative overflow-hidden ${
                  canAccessPhone
                    ? "cursor-pointer border-slate-200 hover:shadow-xl hover:border-emerald-500 group"
                    : "border-slate-100 opacity-80"
                }`}
              >
                {!canAccessPhone && (
                  <span className="absolute top-3.5 right-3.5 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                    <Lock className="w-2.5 h-2.5" /> Gold
                  </span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  {canAccessPhone && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition">
                      View Callers &rarr;
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Phone Call Clicks
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {canAccessPhone ? analyticsData.phoneClickCount : "🔒 Locked"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Users who clicked to call your phone number
                </p>
              </div>

              {/* Card 3: WhatsApp Click Count */}
              <div
                onClick={() => {
                  if (!canAccessWhatsapp) {
                    toast.error("Upgrade your plan to Gold or higher to view WhatsApp click analytics!");
                    return;
                  }
                  setSelectedMetricModal("whatsapp");
                }}
                className={`bg-white p-6 rounded-3xl border shadow-sm transition relative overflow-hidden ${
                  canAccessWhatsapp
                    ? "cursor-pointer border-slate-200 hover:shadow-xl hover:border-green-500 group"
                    : "border-slate-100 opacity-80"
                }`}
              >
                {!canAccessWhatsapp && (
                  <span className="absolute top-3.5 right-3.5 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                    <Lock className="w-2.5 h-2.5" /> Gold
                  </span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaWhatsapp className="w-6 h-6" />
                  </div>
                  {canAccessWhatsapp && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full group-hover:bg-green-600 group-hover:text-white transition">
                      View WhatsApp &rarr;
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  WhatsApp Chat Clicks
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {canAccessWhatsapp ? analyticsData.whatsAppClickCount : "🔒 Locked"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Buyers who initiated WhatsApp chat inquiry
                </p>
              </div>

              {/* Card 4: Properties Views Count */}
              <div
                onClick={() => {
                  if (!canAccessViews) {
                    toast.error("Upgrade your plan to Platinum or higher to view property views analytics!");
                    return;
                  }
                  setSelectedMetricModal("property_views");
                }}
                className={`bg-white p-6 rounded-3xl border shadow-sm transition relative overflow-hidden ${
                  canAccessViews
                    ? "cursor-pointer border-slate-200 hover:shadow-xl hover:border-purple-500 group"
                    : "border-slate-100 opacity-80"
                }`}
              >
                {!canAccessViews && (
                  <span className="absolute top-3.5 right-3.5 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                    <Lock className="w-2.5 h-2.5" /> Platinum
                  </span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6" />
                  </div>
                  {canAccessViews && (
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full group-hover:bg-purple-600 group-hover:text-white transition">
                      Details &rarr;
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Property Views
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {canAccessViews ? analyticsData.propertiesViewsCount : "🔒 Locked"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Total detail page views across your listings
                </p>
              </div>

              {/* Card 5: Average Time Spent */}
              <div
                onClick={() => {
                  if (!canAccessRetention) {
                    toast.error("Upgrade your plan to Platinum or higher to view retention time analytics!");
                  }
                }}
                className={`bg-white p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
                  canAccessRetention ? "border-slate-200" : "border-slate-100 opacity-80 cursor-pointer"
                }`}
              >
                {!canAccessRetention && (
                  <span className="absolute top-3.5 right-3.5 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider">
                    <Lock className="w-2.5 h-2.5" /> Platinum
                  </span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    Avg Retention
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Average Time Spent
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {canAccessRetention ? analyticsData.averageTimeMin : "🔒 Locked"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Average duration buyers stayed on your property pages
                </p>
              </div>

              {/* Card 6: Most Viewed Flat */}
              <div
                onClick={() => {
                  if (!canAccessTrendingFlat) {
                    toast.error("Upgrade your plan to Diamond to unlock top trending flat analytics!");
                  }
                }}
                className={`bg-white p-6 rounded-3xl border shadow-sm relative overflow-hidden ${
                  canAccessTrendingFlat
                    ? "border-slate-200"
                    : "border-slate-100 opacity-80 cursor-pointer"
                }`}
              >
                {!canAccessTrendingFlat && (
                  <span className="absolute top-3.5 right-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider shadow">
                    <Lock className="w-2.5 h-2.5" /> Diamond
                  </span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                    Top Trending Flat
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Most Viewed Flat / Unit
                </p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1 truncate" title={canAccessTrendingFlat ? analyticsData.mostViewedFlat : "🔒 Locked"}>
                  {canAccessTrendingFlat ? analyticsData.mostViewedFlat : "🔒 Locked"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Unit with maximum buyer views & clicks
                </p>
              </div>

              {/* Card 7: Most Interested City */}
              <div
                onClick={() => {
                  if (!canAccessTrendingCity) {
                    toast.error("Upgrade your plan to Diamond to unlock top buyer city analytics!");
                  }
                }}
                className={`bg-white p-6 rounded-3xl border shadow-sm sm:col-span-2 lg:col-span-2 relative overflow-hidden ${
                  canAccessTrendingCity
                    ? "border-slate-200"
                    : "border-slate-100 opacity-80 cursor-pointer"
                }`}
              >
                {!canAccessTrendingCity && (
                  <span className="absolute top-3.5 right-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wider shadow">
                    <Lock className="w-2.5 h-2.5" /> Diamond
                  </span>
                )}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                    Top Location
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Most Interested Buyer City
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                  {canAccessTrendingCity ? analyticsData.mostInterestedCity : "🔒 Locked"}
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  City location generating highest lead traffic for your properties
                </p>
              </div>

            </div>
          );
        })()}

        {/* DETAILED BUYER INQUIRY LOGS TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                Recent Buyer Inquiries & Activity Logs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time list of buyers who viewed or clicked on your property listings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["all", "visitor", "phone", "whatsapp", "contact"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveLeadFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                    activeLeadFilter === filter
                      ? "bg-slate-900 text-white shadow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter === "visitor" ? "Visitors" : filter === "contact" ? "Contact Views" : filter}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredLeadLogs.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base mb-1">
                  No Buyer Inquiries Recorded Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When buyers visit your property pages, click to view contact numbers, or initiate WhatsApp chats, their details will automatically appear here in real-time.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
                    <th className="py-3.5 px-6">Buyer Name</th>
                    <th className="py-3.5 px-6">Contact Number</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">Property / Flat Unit</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Action / Event</th>
                    <th className="py-3.5 px-6 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredLeadLogs.map((lead, idx) => (
                    <tr key={lead.id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {lead.userName || "Guest Visitor"}
                      </td>
                      <td className="py-4 px-6 text-slate-700 font-medium">
                        {lead.userPhone || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-normal">
                        {lead.userEmail || "N/A"}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {lead.flatUnit || lead.propertyTitle || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {lead.city || "Noida"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2.5 py-1 rounded-full ${
                          lead.eventType === "phone_click"
                            ? "bg-emerald-100 text-emerald-800"
                            : lead.eventType === "whatsapp_click"
                            ? "bg-green-100 text-green-800"
                            : lead.eventType === "view_contact"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {lead.eventType === "phone_click"
                            ? "Phone Call Click"
                            : lead.eventType === "whatsapp_click"
                            ? "WhatsApp Chat"
                            : lead.eventType === "view_contact"
                            ? "View Contact"
                            : "Property View"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-400 font-medium text-[11px]">
                        {lead.timestamp ? new Date(lead.timestamp).toLocaleString() : "Just now"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* METRIC DETAILS MODAL */}
      {selectedMetricModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-400 block mb-0.5">
                  Detailed Analytics Logs
                </span>
                <h3 className="text-xl font-extrabold capitalize">
                  {selectedMetricModal === "visitors"
                    ? "Unique Visitors Activity"
                    : selectedMetricModal === "property_views"
                    ? "Property Views Breakdown"
                    : `${selectedMetricModal} Inquiries`}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => setSelectedMetricModal(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {selectedMetricModal === "property_views" ? (
                propertyViewGroups.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-700">No property views recorded yet.</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Property view counts will appear here as soon as buyers view your property pages.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {propertyViewGroups.map((group, idx) => {
                      const targetUrl = group.propertyId && group.propertyId !== "Unknown Property"
                        ? `/buy/property-details?id=${group.propertyId}`
                        : `/buy?search=${encodeURIComponent(group.title !== "Property Listing" ? group.title : "")}`;

                      return (
                        <div key={group.propertyId || idx} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                            <div>
                              <Link
                                href={targetUrl}
                               
                                rel="noopener noreferrer"
                                className="font-bold text-slate-900 text-lg hover:text-purple-600 transition flex items-center gap-2 group"
                                title="View Property Page"
                              >
                                <Building2 className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                                <span className="underline underline-offset-2">{group.title}</span>
                              </Link>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                <span>{group.city}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span className="text-xs font-extrabold bg-purple-100 text-purple-800 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-purple-200">
                                <Eye className="w-4 h-4 text-purple-600" />
                                {group.totalViews} Total Views
                              </span>
                              <span className="text-xs font-extrabold bg-blue-100 text-blue-800 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-blue-200">
                                <Users className="w-4 h-4 text-blue-600" />
                                {group.uniqueVisitorsCount} Unique Buyers
                              </span>
                            </div>
                          </div>

                          {/* Buyers Details Grid */}
                          <div>
                            <span className="font-extrabold text-slate-700 text-xs block mb-2.5 uppercase tracking-wider">
                              Buyers Who Viewed This Property ({group.uniqueBuyersList.length || group.recentLogs.length}):
                            </span>
                            {group.uniqueBuyersList.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {group.uniqueBuyersList.map((buyer, bIdx) => (
                                  <div key={bIdx} className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2 hover:border-purple-300 transition">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-slate-400" />
                                        {buyer.userName}
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {buyer.views > 1 && (
                                          <span className="text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                                            {buyer.views} Views
                                          </span>
                                        )}
                                        <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                          {buyer.timestamp ? new Date(buyer.timestamp).toLocaleString() : "Recent"}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                                      {buyer.userPhone ? (
                                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                                          <Phone className="w-3 h-3 text-emerald-600" />
                                          <span>{buyer.userPhone}</span>
                                        </div>
                                      ) : null}
                                      {buyer.userEmail ? (
                                        <div className="flex items-center gap-1 text-blue-700 font-semibold">
                                          <Mail className="w-3 h-3 text-blue-600" />
                                          <span>{buyer.userEmail}</span>
                                        </div>
                                      ) : null}
                                      {!buyer.userPhone && !buyer.userEmail && (
                                        <span className="text-slate-400 italic">No direct contact shared (Guest view)</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                {group.recentLogs.map((vLog, vIdx) => (
                                  <div key={vIdx} className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                    <div>
                                      <span className="font-bold text-slate-800 block">{vLog.userName || "Guest Visitor"}</span>
                                      <span className="text-[10px] text-slate-400">{vLog.userPhone || vLog.userEmail || "Guest view"}</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                      {vLog.timestamp ? new Date(vLog.timestamp).toLocaleString() : "Recent"}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : modalLogs.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-700">No buyer logs recorded for this category yet.</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Buyer details will appear here as soon as they interact with your properties.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modalLogs.map((log, index) => (
                    <div key={log.id || index} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{log.userName || "Guest Visitor"}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Recent"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {log.viewCount && log.viewCount > 1 && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                              {log.viewCount} Views
                            </span>
                          )}
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                            {log.eventType || "visitor"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60">
                        {(() => {
                          const propId = log.propertyId || log.property_id || (typeof log.property === "object" ? (log.property?._id || log.property?.id) : log.property);
                          const titleText = log.flatUnit || log.propertyTitle || "N/A";
                          const targetUrl = propId ? `/buy/property-details?id=${propId}` : `/buy?search=${encodeURIComponent(titleText !== "N/A" ? titleText : "")}`;

                          return (
                            <Link
                              href={targetUrl}
                             
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-purple-700 hover:text-purple-900 transition-colors group"
                              title="View Property Details"
                            >
                              <Building2 className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                              <span className="font-semibold underline underline-offset-2 line-clamp-1">{titleText}</span>
                            </Link>
                          );
                        })()}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{log.city || "Noida"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{log.userPhone || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                          <span>{log.userEmail || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedMetricModal(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition"
              >
                Close Logs Window
              </button>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
