"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Users,
  Eye,
  Heart,
  PhoneCall,
  Phone,
  Mail,
  User,
  UserCheck,
  MessageSquare,
  Search,
  Compass,
  Radio,
  Clock,
  RefreshCw,
  TrendingUp,
  MapPin,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  ArrowUpRight,
  Sparkles,
  Shield,
  Laptop,
  Smartphone,
  Globe,
  Tag,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8c4bdc", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#8b5cf6"];

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview"); // overview, live, guests, sessions, activity, interests, campaigns
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [liveData, setLiveData] = useState({ activeCount: 0, visitors: [] });
  const [guestsData, setGuestsData] = useState({ visitors: [], pagination: {} });
  const [sessionsData, setSessionsData] = useState({ sessions: [], pagination: {} });
  const [timelineData, setTimelineData] = useState({ events: [], pagination: {} });
  const [interestsData, setInterestsData] = useState(null);

  // Filter states
  const [guestSearch, setGuestSearch] = useState("");
  const [guestTypeFilter, setGuestTypeFilter] = useState("all");
  const [guestSort, setGuestSort] = useState("lastSeenAt");
  const [eventFilter, setEventFilter] = useState("all");
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionChannelFilter, setSessionChannelFilter] = useState("all");
  const [sessionDeviceFilter, setSessionDeviceFilter] = useState("all");
  const [guestPage, setGuestPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);

  // Fetch Overview Data
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`/api/tracking/admin/overview?range=${range}`);
      const json = await res.json();
      if (json.success) {
        setOverviewData(json.data);
      }
    } catch (e) {
      console.error("Overview fetch error:", e);
    }
  }, [range]);

  // Fetch Live Visitors
  const fetchLive = useCallback(async () => {
    try {
      const res = await fetch("/api/tracking/admin/live");
      const json = await res.json();
      if (json.success) {
        setLiveData(json.data);
      }
    } catch (e) {
      console.error("Live fetch error:", e);
    }
  }, []);

  // Fetch Guests List
  const fetchGuests = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: guestPage.toString(),
        limit: "12",
        type: guestTypeFilter,
        sortBy: guestSort,
      });
      if (guestSearch) params.append("search", guestSearch);

      const res = await fetch(`/api/tracking/admin/guests?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setGuestsData(json.data);
      }
    } catch (e) {
      console.error("Guests fetch error:", e);
    }
  }, [guestPage, guestTypeFilter, guestSort, guestSearch]);

  // Fetch Sessions
  const fetchSessions = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: sessionPage.toString(),
        limit: "15",
        channel: sessionChannelFilter,
        device: sessionDeviceFilter,
      });
      if (sessionSearch) params.append("search", sessionSearch);

      const res = await fetch(`/api/tracking/admin/sessions?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setSessionsData(json.data);
      }
    } catch (e) {
      console.error("Sessions fetch error:", e);
    }
  }, [sessionPage, sessionChannelFilter, sessionDeviceFilter, sessionSearch]);

  // Fetch Activity Timeline
  const fetchActivity = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: activityPage.toString(),
        limit: "20",
        eventType: eventFilter,
      });
      const res = await fetch(`/api/tracking/admin/timeline?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setTimelineData(json.data);
      }
    } catch (e) {
      console.error("Activity fetch error:", e);
    }
  }, [activityPage, eventFilter]);

  // Fetch Interests Data
  const fetchInterests = useCallback(async () => {
    try {
      const res = await fetch("/api/tracking/admin/interests");
      const json = await res.json();
      if (json.success) {
        setInterestsData(json.data);
      }
    } catch (e) {
      console.error("Interests fetch error:", e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchOverview(),
      fetchLive(),
    ]).finally(() => setLoading(false));
  }, [fetchOverview, fetchLive]);

  // Tab switch loader
  useEffect(() => {
    if (activeTab === "live") fetchLive();
    else if (activeTab === "guests") fetchGuests();
    else if (activeTab === "sessions") fetchSessions();
    else if (activeTab === "activity") fetchActivity();
    else if (activeTab === "interests") fetchInterests();
    else if (activeTab === "overview") fetchOverview();
  }, [activeTab, fetchLive, fetchGuests, fetchSessions, fetchActivity, fetchInterests, fetchOverview]);

  // Live polling interval when viewing Live tab
  useEffect(() => {
    if (activeTab !== "live") return;
    const interval = setInterval(fetchLive, 10000); // 10s refresh for live presence
    return () => clearInterval(interval);
  }, [activeTab, fetchLive]);

  const summary = overviewData?.summary || {};

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-slate-50/60 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#8c4bdc] text-xs font-black uppercase tracking-widest mb-1.5">
            <Activity className="w-4 h-4 animate-pulse" />
            <span>Behavior & User Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Tracking & Behavior Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            First-party visitor telemetry, behavioral interest signals, acquisition attribution, and session timelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range selector */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc]"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={() => {
              if (activeTab === "overview") fetchOverview();
              if (activeTab === "live") fetchLive();
              if (activeTab === "guests") fetchGuests();
              if (activeTab === "sessions") fetchSessions();
              if (activeTab === "activity") fetchActivity();
              if (activeTab === "interests") fetchInterests();
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Refresh analytics data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ================= TABS SELECTOR ================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        {[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "live", label: "Live Visitors", icon: Radio, count: liveData.activeCount },
          { id: "guests", label: "Guest Visitors", icon: Globe },
          { id: "sessions", label: "Sessions", icon: Clock },
          { id: "activity", label: "Activity Feed", icon: Activity },
          { id: "interests", label: "Interest Signals", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? "bg-[#8c4bdc] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span className="bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black animate-pulse">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* STATS TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <MetricCard
              title="Total Visitors"
              value={summary.totalVisitors || 0}
              sub={`${summary.uniqueGuests || 0} Guests · ${summary.registeredVisitors || 0} Registered`}
              icon={Users}
              color="text-purple-600"
              bg="bg-purple-50"
            />
            <MetricCard
              title="Total Sessions"
              value={summary.totalSessions || 0}
              sub="Unique browsing visits"
              icon={Clock}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <MetricCard
              title="Page Views"
              value={summary.pageViews || 0}
              sub="Total page transitions"
              icon={Eye}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <MetricCard
              title="Property Views"
              value={summary.propertyViews || 0}
              sub={`${summary.propertySaves || 0} Saved Wishlists`}
              icon={Heart}
              color="text-rose-600"
              bg="bg-rose-50"
            />
            <MetricCard
              title="Inquiries & Clicks"
              value={(summary.whatsappClicks || 0) + (summary.callClicks || 0) + (summary.leadsCount || 0)}
              sub={`${summary.whatsappClicks || 0} WA · ${summary.callClicks || 0} Call · ${summary.leadsCount || 0} Leads`}
              icon={PhoneCall}
              color="text-amber-600"
              bg="bg-amber-50"
            />
          </div>

          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Trend Bar Chart */}
            <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#8c4bdc]" />
                    <span>Daily Activity Trend (Last 14 Days)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Page views, property views, and lead inquiries over time.
                  </p>
                </div>
              </div>

              <div className="h-64 w-full">
                {overviewData?.dailyActivity && overviewData.dailyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overviewData.dailyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "none",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="pageViews" fill="#8c4bdc" name="Page Views" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="propertyViews" fill="#3b82f6" name="Property Views" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="leads" fill="#10b981" name="Leads" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                    No activity recorded in this period yet.
                  </div>
                )}
              </div>
            </div>

            {/* Traffic Sources Pie Chart */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#8c4bdc]" />
                  <span>Traffic Channels</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visitor acquisition source distribution.
                </p>
              </div>

              <div className="h-48 w-full flex items-center justify-center">
                {overviewData?.trafficSources && overviewData.trafficSources.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overviewData.trafficSources}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={42}
                        paddingAngle={4}
                      >
                        {overviewData.trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          border: "none",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-400 font-medium">No traffic data yet</div>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                {overviewData?.trafficSources?.map((src, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {src._id}
                    </span>
                    <span className="font-bold text-slate-900">{src.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOP PROPERTIES & LOCATIONS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Properties */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  <span>Most Viewed Properties</span>
                </h3>
                <span className="text-xs text-slate-500 font-semibold">Ranked by views</span>
              </div>

              <div className="space-y-2">
                {overviewData?.topProperties && overviewData.topProperties.length > 0 ? (
                  overviewData.topProperties.map((prop, idx) => (
                    <Link
                      key={idx}
                      href={`/buy/property-details?id=${prop._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-purple-50/70 hover:border-purple-200 transition border border-slate-100 cursor-pointer"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-extrabold text-slate-900 group-hover:text-[#8c4bdc] transition truncate">
                            {prop.title || `Property #${prop._id}`}
                          </p>
                          <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#8c4bdc] shrink-0 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{prop.location || "Location not specified"}</span>
                          {prop.priceText && <span>· {prop.priceText}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black bg-purple-100 text-purple-700 px-2.5 py-1 rounded-xl group-hover:bg-[#8c4bdc] group-hover:text-white transition">
                          {prop.views} views
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">No property views recorded yet.</p>
                )}
              </div>
            </div>

            {/* Top Locations & Campaigns */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>High-Interest Locations</span>
                </h3>
                <span className="text-xs text-slate-500 font-semibold">Market Demand</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {overviewData?.topLocations && overviewData.topLocations.length > 0 ? (
                  overviewData.topLocations.map((loc, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-extrabold text-slate-800 truncate">{loc._id}</p>
                      <p className="text-base font-black text-[#8c4bdc] mt-0.5">{loc.count} <span className="text-[10px] text-slate-400 font-normal">views</span></p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 col-span-2 text-center py-6">No location data yet.</p>
                )}
              </div>

              {/* Marketing Campaigns Overview */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Active Marketing Campaigns (UTM)</span>
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {overviewData?.campaigns && overviewData.campaigns.length > 0 ? (
                    overviewData.campaigns.map((camp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                        <span className="font-bold text-slate-800 truncate max-w-[200px]">
                          {camp._id}
                        </span>
                        <span className="text-[11px] font-extrabold text-[#8c4bdc] bg-purple-100 px-2 py-0.5 rounded-lg">
                          {camp.sessionsCount} visits
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-400 py-2">No UTM campaigns detected yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: LIVE VISITORS ================= */}
      {activeTab === "live" && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span>Active Live Visitors (Last 5 Minutes)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time presence tracking via lightweight periodic heartbeats.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-xl text-xs font-black border border-emerald-200">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{liveData.activeCount} Visitors Active Right Now</span>
            </div>
          </div>

          {liveData.visitors.length === 0 ? (
            <div className="py-16 text-center text-slate-400 font-medium space-y-2">
              <Radio className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">No visitors currently active on the site.</p>
              <p className="text-[11px] text-slate-400">Visitors will show up here live when browsing 18Homes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Visitor / User</th>
                    <th className="pb-3">Current Page</th>
                    <th className="pb-3">Channel / Source</th>
                    <th className="pb-3">Device & Browser</th>
                    <th className="pb-3">Session Pageviews</th>
                    <th className="pb-3 text-right">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveData.visitors.map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${v.isIdentified ? (v.userRole === "admin" ? "bg-amber-500" : "bg-purple-600") : "bg-emerald-500"}`} />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-extrabold text-slate-900">
                                {v.isIdentified ? v.userName : `Guest ${v.visitorId}`}
                              </p>
                              {v.userRole && (
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md ${
                                  v.userRole === "admin"
                                    ? "bg-amber-100 text-amber-800"
                                    : v.userRole === "builder"
                                    ? "bg-blue-100 text-blue-800"
                                    : v.userRole === "dealer"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}>
                                  {v.userRole}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-0.5 text-[11px] text-slate-500 font-medium">
                              {v.userPhone && (
                                <a
                                  href={`tel:${v.userPhone}`}
                                  className="text-slate-600 hover:text-[#8c4bdc] flex items-center gap-0.5 font-bold"
                                  title="Call user"
                                >
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{v.userPhone}</span>
                                </a>
                              )}
                              {v.userEmail && (
                                <a
                                  href={`mailto:${v.userEmail}`}
                                  className="text-slate-400 hover:text-slate-700 flex items-center gap-0.5"
                                  title="Send Email"
                                >
                                  <Mail className="w-2.5 h-2.5" />
                                  <span className="truncate max-w-[140px]">{v.userEmail}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <Link
                          href={v.currentPage || "/"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 px-2 py-1 rounded-md max-w-[220px] truncate border border-transparent hover:border-purple-200 transition"
                        >
                          <span className="truncate">{v.currentPage}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 shrink-0" />
                        </Link>
                      </td>
                      <td className="py-3 pr-3">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                          {v.channel}
                          {v.utm_campaign && <span className="text-[10px] text-purple-600">({v.utm_campaign})</span>}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-slate-600">
                        {v.device} · {v.browser} ({v.os})
                      </td>
                      <td className="py-3 pr-3 font-extrabold text-slate-800">
                        {v.sessionPageViews} pages
                      </td>
                      <td className="py-3 text-right text-slate-500 font-medium">
                        {new Date(v.lastSeenAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: GUEST USERS ================= */}
      {activeTab === "guests" && (
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Visitor ID, name or campaign..."
                  value={guestSearch}
                  onChange={(e) => {
                    setGuestSearch(e.target.value);
                    setGuestPage(1);
                  }}
                  className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc]"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <select
                  value={guestTypeFilter}
                  onChange={(e) => {
                    setGuestTypeFilter(e.target.value);
                    setGuestPage(1);
                  }}
                  className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                >
                  <option value="all">All Visitors</option>
                  <option value="guests_only">Anonymous Guests Only</option>
                  <option value="identified_only">Identified Users</option>
                </select>

                <select
                  value={guestSort}
                  onChange={(e) => {
                    setGuestSort(e.target.value);
                    setGuestPage(1);
                  }}
                  className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none"
                >
                  <option value="lastSeenAt">Recently Active</option>
                  <option value="firstSeenAt">First Seen</option>
                  <option value="score">Highest Interest Score</option>
                  <option value="sessions">Most Visits</option>
                </select>
              </div>
            </div>

            {/* GUESTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {guestsData.visitors?.map((g, idx) => {
                const signals = g.interestSignals || {};
                const isIdentified = g.isIdentified || !!g.userId;
                const displayName = g.userName && g.userName.toLowerCase() !== "user"
                  ? g.userName
                  : (isIdentified ? "Identified User" : `Guest ${g.visitorId.substring(0, 8)}`);

                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50/80 hover:bg-white transition duration-200 rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-md flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top Bar with Visitor ID & Score */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-black text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          {g.visitorId}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            signals.engagementLevel === "Very High"
                              ? "bg-purple-100 text-purple-700"
                              : signals.engagementLevel === "High"
                              ? "bg-blue-100 text-blue-700"
                              : signals.engagementLevel === "Medium"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {signals.engagementLevel || "Low"} Interest ({signals.score || 0} pts)
                        </span>
                      </div>

                      {/* User / Admin Profile Block */}
                      <div className="mt-3 p-2.5 bg-white rounded-xl border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isIdentified
                                ? g.userRole === "admin"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-purple-100 text-purple-700"
                                : "bg-slate-100 text-slate-500"
                            }`}>
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-xs font-extrabold text-slate-900 truncate">
                              {displayName}
                            </p>
                          </div>

                          {g.userRole ? (
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                              g.userRole === "admin"
                                ? "bg-amber-100 text-amber-800"
                                : g.userRole === "builder"
                                ? "bg-blue-100 text-blue-800"
                                : g.userRole === "dealer"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-purple-100 text-purple-800"
                            }`}>
                              {g.userRole}
                            </span>
                          ) : isIdentified ? (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 shrink-0">
                              User
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                              Guest
                            </span>
                          )}
                        </div>

                        {/* Contact details */}
                        {(g.userPhone || g.userEmail) && (
                          <div className="pt-1.5 border-t border-slate-100 space-y-1">
                            {g.userPhone && (
                              <div className="flex items-center justify-between text-[11px]">
                                <a
                                  href={`tel:${g.userPhone}`}
                                  className="font-bold text-slate-700 hover:text-[#8c4bdc] flex items-center gap-1 transition"
                                >
                                  <Phone className="w-3 h-3 text-purple-600" />
                                  <span>{g.userPhone}</span>
                                </a>
                                <a
                                  href={`https://wa.me/${g.userPhone.replace(/[^0-9]/g, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            )}
                            {g.userEmail && (
                              <a
                                href={`mailto:${g.userEmail}`}
                                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 truncate transition"
                              >
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{g.userEmail}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3-Col Stats */}
                      <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
                        <div className="bg-white p-2 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-semibold">Sessions</p>
                          <p className="text-xs font-extrabold text-slate-800">{g.totalSessions || 1}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-semibold">Pageviews</p>
                          <p className="text-xs font-extrabold text-slate-800">{g.totalPageViews || 0}</p>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-100">
                          <p className="text-[10px] text-slate-400 font-semibold">Properties</p>
                          <p className="text-xs font-extrabold text-[#8c4bdc]">{signals.viewedPropertiesCount || 0}</p>
                        </div>
                      </div>

                      {signals.preferredLocations?.length > 0 && (
                        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Prefers: {signals.preferredLocations.map((l) => l.location).join(", ")}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Seen {new Date(g.lastSeenAt).toLocaleDateString()}</span>
                      <Link
                        href={`/admin/analytics/guests/${g.visitorId}`}
                        className="font-bold text-[#8c4bdc] hover:underline flex items-center gap-0.5"
                      >
                        <span>View Timeline</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {guestsData.pagination?.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={guestPage <= 1}
                  onClick={() => setGuestPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-slate-600">
                  Page {guestPage} of {guestsData.pagination.totalPages}
                </span>
                <button
                  disabled={guestPage >= guestsData.pagination.totalPages}
                  onClick={() => setGuestPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: SESSIONS ================= */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sessions</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{sessionsData.metrics?.totalSessions || sessionsData.pagination?.total || 0}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#8c4bdc] flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Duration</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {sessionsData.metrics?.avgDurationSec >= 60
                    ? `${Math.floor(sessionsData.metrics.avgDurationSec / 60)}m ${sessionsData.metrics.avgDurationSec % 60}s`
                    : `${sessionsData.metrics?.avgDurationSec || 0}s`}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Pages / Visit</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{sessionsData.metrics?.avgPageViews || 0}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Eye className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bounce Rate</p>
                <p className="text-xl font-black text-rose-600 mt-0.5">{sessionsData.metrics?.bounceRate || "0%"}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Main Sessions Log Table */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Visit Sessions Log</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete telemetry of visitor journeys, channels, duration, and exit touchpoints.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search session, visitor, UTM..."
                    value={sessionSearch}
                    onChange={(e) => {
                      setSessionSearch(e.target.value);
                      setSessionPage(1);
                    }}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#8c4bdc]/20"
                  />
                </div>

                <select
                  value={sessionChannelFilter}
                  onChange={(e) => {
                    setSessionChannelFilter(e.target.value);
                    setSessionPage(1);
                  }}
                  className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="all">All Channels</option>
                  <option value="Direct">Direct</option>
                  <option value="Organic Search">Organic Search</option>
                  <option value="Social">Social</option>
                  <option value="Paid Search">Paid Search</option>
                  <option value="Paid Social">Paid Social</option>
                  <option value="Campaign / Ads">Campaign / Ads</option>
                  <option value="Referral">Referral</option>
                </select>

                <select
                  value={sessionDeviceFilter}
                  onChange={(e) => {
                    setSessionDeviceFilter(e.target.value);
                    setSessionPage(1);
                  }}
                  className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                >
                  <option value="all">All Devices</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Tablet">Tablet</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Session & User</th>
                    <th className="pb-3">Channel / UTM</th>
                    <th className="pb-3">Intent Quality</th>
                    <th className="pb-3">Landing Page</th>
                    <th className="pb-3">Exit Page</th>
                    <th className="pb-3">Duration & Pages</th>
                    <th className="pb-3">Device / Browser</th>
                    <th className="pb-3 text-right">Started At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessionsData.sessions?.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 pr-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                              {s.sessionId}
                            </span>
                            {s.userRole && (
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                s.userRole === "admin"
                                  ? "bg-amber-100 text-amber-800"
                                  : s.userRole === "builder"
                                  ? "bg-blue-100 text-blue-800"
                                  : s.userRole === "dealer"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}>
                                {s.userRole}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-slate-700 font-bold">
                            <span>{s.userName || `Guest ${s.visitorId?.substring(0, 8)}`}</span>
                            {s.userPhone && (
                              <a
                                href={`tel:${s.userPhone}`}
                                className="text-purple-600 hover:text-purple-800 font-normal ml-1"
                                title="Call"
                              >
                                ({s.userPhone})
                              </a>
                            )}
                          </div>

                          <Link
                            href={`/admin/analytics/guests/${s.visitorId}`}
                            className="font-mono text-[10px] text-purple-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>{s.visitorId}</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </td>

                      <td className="py-3 pr-3">
                        <span className="font-bold text-slate-800">{s.source?.channel || "Direct"}</span>
                        {s.source?.utm_campaign && (
                          <p className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            {s.source.utm_campaign}
                          </p>
                        )}
                      </td>

                      <td className="py-3 pr-3">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          s.engagement === "High"
                            ? "bg-emerald-100 text-emerald-800"
                            : s.engagement === "Bounced"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {s.engagement}
                        </span>
                      </td>

                      <td className="py-3 pr-3 font-mono text-[11px] max-w-[150px] truncate">
                        {s.landingPage ? (
                          <Link
                            href={s.landingPage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-purple-700 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{s.landingPage}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-50" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">/</span>
                        )}
                      </td>

                      <td className="py-3 pr-3 font-mono text-[11px] max-w-[150px] truncate">
                        {s.exitPage ? (
                          <Link
                            href={s.exitPage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-purple-700 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{s.exitPage}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-50" />
                          </Link>
                        ) : (
                          <span className="text-slate-400">/</span>
                        )}
                      </td>

                      <td className="py-3 pr-3">
                        <span className="font-bold text-slate-900 block">
                          {s.pageViews || 1} pages
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {s.durationSec >= 60 ? `${Math.round(s.durationSec / 60)}m ${s.durationSec % 60}s` : `${s.durationSec || 0}s`}
                        </span>
                      </td>

                      <td className="py-3 pr-3 text-slate-600 text-[11px]">
                        <p className="font-bold text-slate-800">{s.device || "Desktop"}</p>
                        <p className="text-[10px] text-slate-400">{s.browser} ({s.os})</p>
                      </td>

                      <td className="py-3 text-right text-slate-500 font-medium whitespace-nowrap">
                        {new Date(s.startedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sessionsData.pagination?.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  disabled={sessionPage <= 1}
                  onClick={() => setSessionPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Prev
                </button>
                <span className="text-xs font-bold text-slate-600">
                  Page {sessionPage} of {sessionsData.pagination.totalPages}
                </span>
                <button
                  disabled={sessionPage >= sessionsData.pagination.totalPages}
                  onClick={() => setSessionPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: ACTIVITY FEED ================= */}
      {activeTab === "activity" && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Chronological Activity Feed</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every meaningful user action streamed in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={eventFilter}
                onChange={(e) => {
                  setEventFilter(e.target.value);
                  setActivityPage(1);
                }}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
              >
                <option value="all">All Event Types</option>
                <option value="property_view">Property Views</option>
                <option value="property_save">Property Saves</option>
                <option value="whatsapp_click">WhatsApp Clicks</option>
                <option value="call_click">Call Clicks</option>
                <option value="lead_submit">Lead Inquiries</option>
                <option value="property_search">Searches</option>
                <option value="session_start">Session Starts</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {timelineData.events?.map((ev, idx) => {
              const propId = ev.propertyId || ev.propertyDetails?._id || ev.propertyDetails?.id;
              const propTitle = ev.propertyDetails?.title;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition border border-slate-100 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold text-slate-900">
                        {ev.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">
                          {ev.visitorId}
                        </span>
                        <span>·</span>
                        <span>{new Date(ev.createdAt).toLocaleString()}</span>
                        {ev.device && <span>· {ev.device}</span>}
                      </div>
                    </div>
                  </div>

                  {propId && (
                    <Link
                      href={`/buy/property-details?id=${propId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-xl transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Property</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {timelineData.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={activityPage <= 1}
                onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs font-bold text-slate-600">
                Page {activityPage} of {timelineData.pagination.totalPages}
              </span>
              <button
                disabled={activityPage >= timelineData.pagination.totalPages}
                onClick={() => setActivityPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 6: INTEREST SIGNALS ================= */}
      {activeTab === "interests" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8c4bdc]" />
              <span>Behavior-Based Buyer Interest Signals</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Calculated dynamically from repeat property views (+3), saves (+5), WhatsApp (+8), call clicks (+8), and lead submissions (+10).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Searches */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-600" />
                <span>Frequently Searched Keywords</span>
              </h3>
              <div className="space-y-2">
                {interestsData?.topSearches && interestsData.topSearches.length > 0 ? (
                  interestsData.topSearches.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                      <span className="font-bold text-slate-800">{s._id}</span>
                      <span className="font-black text-[#8c4bdc] bg-purple-100 px-2 py-0.5 rounded-md">
                        {s.count} searches
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No search keywords recorded yet.</p>
                )}
              </div>
            </div>

            {/* Preferred Property Types */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Most Desired Property Types</span>
              </h3>
              <div className="space-y-2">
                {interestsData?.typePreferences && interestsData.typePreferences.length > 0 ? (
                  interestsData.typePreferences.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                      <span className="font-bold text-slate-800 capitalize">{t._id}</span>
                      <span className="font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                        {t.count} views
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No property type preferences recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, sub, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
