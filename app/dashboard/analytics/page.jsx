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
        if (role && role !== "builder" && role !== "admin" && role !== "super_admin") {
          toast.error("Access denied. Project Analytics is only available for Builders and Admins.");
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
          if (role && role !== "builder" && role !== "admin" && role !== "super_admin") {
            toast.error("Access denied. Project Analytics is only available for Builders and Admins.");
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
      const isAdmin = currentUserObj?.role === "admin" || currentUserObj?.role === "super_admin";

      let apiEvents = [];
      try {
        const queryParams = new URLSearchParams();
        if (currentBuilderId) queryParams.set("builderId", currentBuilderId);
        if (currentBuilderEmail) queryParams.set("builderEmail", currentBuilderEmail);

        const res = await fetch(`/api/analytics/builder?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.events)) {
            apiEvents = json.data.events;
          }
        }
      } catch (apiErr) {
        console.error("API fetch error in analytics page:", apiErr);
      }

      let localEvents = [];
      const eventsStr = localStorage.getItem("18homes_analytics_events");
      if (eventsStr) {
        try { localEvents = JSON.parse(eventsStr); } catch (e) {}
      }

      const allEvents = Array.isArray(localEvents) ? [...localEvents, ...apiEvents] : apiEvents;
      const uniqueEventsMap = new Map();
      allEvents.forEach((ev) => {
        const key = ev.id || `${ev.eventType}_${ev.timestamp}_${ev.userName}_${ev.propertyId}`;
        if (!uniqueEventsMap.has(key)) {
          uniqueEventsMap.set(key, ev);
        }
      });

      // Filter events to ONLY include properties owned by THIS builder
      const ownPropertyEvents = Array.from(uniqueEventsMap.values()).filter((ev) => {
        if (isAdmin) return true;

        const evBuilderId = String(ev.builderId || "");
        const evBuilderEmail = String(ev.builderEmail || "").toLowerCase();

        const matchesBuilder = Boolean(
          (currentBuilderId && evBuilderId === currentBuilderId) ||
          (currentBuilderEmail && evBuilderEmail === currentBuilderEmail) ||
          (!evBuilderId || evBuilderId === "builder")
        );

        return matchesBuilder;
      });

      // Sort newest first
      ownPropertyEvents.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

      const getUniqueUserLogs = (eventList) => {
        const result = [];
        const seen = new Set();
        eventList.forEach((ev) => {
          const key = (ev.userEmail || ev.userPhone || ev.userName || ev.id).toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            result.push(ev);
          }
        });
        return result;
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

      const timeEvents = ownPropertyEvents.filter((e) => e.eventType === "time_spent" && e.durationSec > 0);
      let avgSec = 0;
      if (timeEvents.length > 0) {
        const totalSec = timeEvents.reduce((acc, curr) => acc + (curr.durationSec || 0), 0);
        avgSec = Math.round(totalSec / timeEvents.length);
      }
      const avgMinFormatted = avgSec > 0 ? (avgSec >= 60 ? `${Math.round(avgSec / 60)} min` : `${avgSec} sec`) : "0 min";

      const flatCounts = {};
      const cityCounts = {};
      ownPropertyEvents.forEach((e) => {
        if (e.flatUnit && e.flatUnit !== "N/A") flatCounts[e.flatUnit] = (flatCounts[e.flatUnit] || 0) + 1;
        if (e.city && e.city !== "N/A") cityCounts[e.city] = (cityCounts[e.city] || 0) + 1;
      });

      let topFlat = "N/A";
      let maxFlatCount = 0;
      Object.entries(flatCounts).forEach(([flat, count]) => {
        if (count > maxFlatCount) {
          maxFlatCount = count;
          topFlat = flat;
        }
      });

      let topCity = "N/A";
      let maxCityCount = 0;
      Object.entries(cityCounts).forEach(([city, count]) => {
        if (count > maxCityCount) {
          maxCityCount = count;
          topCity = city;
        }
      });

      setAnalyticsData({
        visitorsCount: visitorLogs.length,
        phoneClickCount: phoneLogs.length,
        whatsAppClickCount: whatsAppLogs.length,
        propertiesViewsCount: visitorLogs.length,
        averageTimeMin: avgMinFormatted,
        mostViewedFlat: topFlat,
        mostInterestedCity: topCity,
      });

    } catch (err) {
      console.error("Error calculating dynamic analytics metrics:", err);
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

  const handleExportCSV = () => {
    if (!modalLogs || modalLogs.length === 0) return;
    const headers = ["User Name", "Phone", "Email", "Property Title", "Flat/Unit", "City", "Event Type", "Date/Time"];
    const rows = modalLogs.map((log) => [
      `"${log.userName || 'Guest'}"`,
      `"${log.userPhone || 'N/A'}"`,
      `"${log.userEmail || 'N/A'}"`,
      `"${log.propertyTitle || 'N/A'}"`,
      `"${log.flatUnit || 'N/A'}"`,
      `"${log.city || 'N/A'}"`,
      `"${log.eventType || 'visitor'}"`,
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

  if (user && user.role !== "builder" && user.role !== "admin" && user.role !== "super_admin") {
    return (
      <DashboardLayout>
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto my-12 space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500">
            Project Analytics is exclusively reserved for Builder and Admin accounts.
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
                Project Analytics Dashboard
              </h1>
              <p className="text-purple-200 text-xs sm:text-sm mt-1">
                Real-time buyer inquiries, property details views, phone calls & WhatsApp lead logs for your listings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadAnalytics(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl font-bold text-xs transition border border-white/15 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh Data</span>
              </button>

              <Link
                href="/dashboard/builder"
                className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-2xl font-bold text-xs transition shadow-md flex items-center gap-1.5"
              >
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 7 ANALYTICS METRIC CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          
          {/* Card 1: Visitors Count */}
          <div
            onClick={() => setSelectedMetricModal("visitors")}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-500 transition cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full group-hover:bg-blue-600 group-hover:text-white transition">
                View Logs &rarr;
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Visitors
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {analyticsData.visitorsCount}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Unique users who viewed your property listings
            </p>
          </div>

          {/* Card 2: Phone Click Count */}
          <div
            onClick={() => setSelectedMetricModal("phone")}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full group-hover:bg-emerald-600 group-hover:text-white transition">
                View Callers &rarr;
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Phone Call Clicks
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {analyticsData.phoneClickCount}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Users who clicked to call your phone number
            </p>
          </div>

          {/* Card 3: WhatsApp Click Count */}
          <div
            onClick={() => setSelectedMetricModal("whatsapp")}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-green-500 transition cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FaWhatsapp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full group-hover:bg-green-600 group-hover:text-white transition">
                View WhatsApp &rarr;
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              WhatsApp Chat Clicks
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {analyticsData.whatsAppClickCount}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Buyers who initiated WhatsApp chat inquiry
            </p>
          </div>

          {/* Card 4: Properties Views Count */}
          <div
            onClick={() => setSelectedMetricModal("visitors")}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-500 transition cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full group-hover:bg-purple-600 group-hover:text-white transition">
                Details &rarr;
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Property Views
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
              {analyticsData.propertiesViewsCount}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Total detail page views across your listings
            </p>
          </div>

          {/* Card 5: Average Time Spent */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
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
              {analyticsData.averageTimeMin}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Average duration buyers stayed on your property pages
            </p>
          </div>

          {/* Card 6: Most Viewed Flat */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
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
            <h3 className="text-base font-extrabold text-slate-900 mt-1 truncate" title={analyticsData.mostViewedFlat}>
              {analyticsData.mostViewedFlat}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Unit with maximum buyer views & clicks
            </p>
          </div>

          {/* Card 7: Most Interested City */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sm:col-span-2 lg:col-span-2 relative overflow-hidden">
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
              {analyticsData.mostInterestedCity}
            </h3>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              City location generating highest lead traffic for your properties
            </p>
          </div>

        </div>

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
                  Detailed Buyer Logs
                </span>
                <h3 className="text-xl font-extrabold capitalize">
                  {selectedMetricModal === "visitors" ? "Visitors & Property Views" : `${selectedMetricModal} Inquiries`}
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
              {modalLogs.length === 0 ? (
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
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
                          {log.eventType || "visitor"}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          <span className="font-semibold text-slate-800">{log.flatUnit || log.propertyTitle || "N/A"}</span>
                        </div>
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
