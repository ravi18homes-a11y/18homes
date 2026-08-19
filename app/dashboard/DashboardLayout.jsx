"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  LayoutDashboard,
  User,
  Home,
  Heart,
  History,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  ChevronRight,
  Activity,
  Trash2,
  CheckCircle2,
  Info,
  MessageSquare,
  Lock,
  Sparkles,
  Building2,
  Users,
} from "lucide-react";
import { FaBell } from "react-icons/fa";

const BASE_API_URL = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

function formatTimeAgo(dateString) {
  if (!dateString) return "just now";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 30) return `${diffDay}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifMenuRef = useRef(null);

  // Fetch fresh profile from API on mount to sync approval status instantly
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to access dashboard");
      router.push("/login-signup");
      return;
    }

    try {
      const cached = localStorage.getItem("userData");
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) { }

    fetchFreshProfile(token);
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const isAdmin = user?.role === "admin" || user?.role === "super_admin";
    const isDealerOrBuilder = ["dealer", "builder"].includes(user?.role);
    const hasNoPaidPlan = !isAdmin && isDealerOrBuilder && (user?.planName === "Free" || !user?.subscription);

    const restrictedPaths = [
      "/dashboard/analytics",
      "/dashboard/dealer/leads",
      "/dashboard/builder/leads",
      "/dashboard/dealer/featured-ads",
      "/dashboard/builder/featured-ads",
      "/dashboard/builder/projects",
      "/post-project"
    ];

    const isRestricted = restrictedPaths.some(p => pathname.startsWith(p));

    if (hasNoPaidPlan && isRestricted) {
      toast.error("⚠️ Access Denied: This feature is only available in premium membership plans.");
      router.replace("/membership");
    }
  }, [user, pathname, router]);

  const fetchFreshProfile = async (token) => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const freshUser = data.data;
        setUser(freshUser);
        localStorage.setItem("userData", JSON.stringify(freshUser));
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error("Error fetching fresh profile in dashboard layout:", err);
    } finally {
      setLoading(false);
    }
  };

  // Notification Handlers
  const fetchNotifications = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setNotifications([]);
      return;
    }
    try {
      const res = await fetch(`${BASE_API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.data || []);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications in dashboard:", err);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${BASE_API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${BASE_API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${BASE_API_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif._id);
    setShowNotifMenu(false);

    if (notif.metadata?.conversationId) {
      router.push(`/dashboard/chats?conversationId=${notif.metadata.conversationId}`);
    } else if (notif.type === "contact_request") {
      router.push("/dashboard/dealer/leads");
    }
  };

  const clearAllNotifications = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${BASE_API_URL}/api/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close notification menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifMenuRef.current &&
        !notifMenuRef.current.contains(event.target)
      ) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.dispatchEvent(new Event("storage"));
    toast.success("Logged out successfully");
    router.push("/login-signup");
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
      case "super_admin":
        return { label: "Super Admin", bg: "bg-purple-100 text-purple-700 border-purple-200" };
      case "owner":
        return { label: "Property Owner", bg: "bg-emerald-100 text-emerald-700 border-emerald-200" };
      case "builder":
        return { label: "Builder", bg: "bg-indigo-100 text-indigo-700 border-indigo-200" };
      case "dealer":
        return { label: "Dealer / Agent", bg: "bg-amber-100 text-amber-700 border-amber-200" };
      default:
        return { label: "Normal User", bg: "bg-blue-100 text-blue-700 border-blue-200" };
    }
  };

  const defaultAvatar =
    "https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif";

  // Role-Based Nav Links Definition
  const allNavLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["user", "owner", "builder", "dealer", "admin", "super_admin"],
    },
    {
      name: "Messages & Chats",
      href: "/dashboard/chats",
      icon: MessageSquare,
      roles: ["user", "owner", "builder", "dealer", "admin", "super_admin"],
    },
    {
      name: "Project Analytics",
      href: "/dashboard/analytics",
      icon: Activity,
      roles: ["builder", "dealer", "admin", "super_admin"], // Enable dealers to access analytics page based on their plan
    },
    {
      name: "Client Leads",
      href: "/dashboard/dealer/leads",
      icon: Users,
      roles: ["builder", "dealer", "admin", "super_admin"],
    },
    {
      name: "Featured Ads",
      href: "/dashboard/dealer/featured-ads",
      icon: Sparkles,
      roles: ["builder", "dealer", "admin", "super_admin"],
    },
    {
      name: "Membership Plans",
      href: "/membership",
      icon: ShieldCheck,
      roles: ["builder", "dealer", "admin", "super_admin"],
    },
    {
      name: "My Properties",
      href: "/my-properties",
      icon: Home,
      roles: ["owner", "builder", "dealer", "admin", "super_admin"], // HIDE FOR NORMAL USER ("user")
    },
    {
      name: "Edit Profile",
      href: "/edit-profile",
      icon: User,
      roles: ["user", "owner", "builder", "dealer", "admin", "super_admin"],
    },
    {
      name: "Saved Wishlist",
      href: "/wishlist",
      icon: Heart,
      roles: ["user", "owner", "builder", "dealer", "admin", "super_admin"],
    },
    {
      name: "Recent History",
      href: "/recent-history",
      icon: History,
      roles: ["user", "owner", "builder", "dealer", "admin", "super_admin"],
    },
    {
      name: "Post / Sell Property",
      href: "/sell",
      icon: PlusCircle,
      roles: ["owner", "builder", "dealer", "admin", "super_admin"],
    },
    {
      name: "My Projects",
      href: "/dashboard/builder/projects",
      icon: Building2,
      roles: ["builder", "admin", "super_admin"],
    },
    {
      name: "Post Project",
      href: "/post-project",
      icon: PlusCircle,
      roles: ["builder", "admin", "super_admin"],
    },
    
  ];

  if (user?.role === "admin" || user?.role === "super_admin") {
    allNavLinks.push({
      name: "Admin Control Panel",
      href: "/admin",
      icon: Shield,
      roles: ["admin", "super_admin"],
    });
  }

  const userRole = user?.role || "user";
  const navLinks = allNavLinks.filter((link) => link.roles.includes(userRole));
  const roleInfo = getRoleBadge(userRole);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col antialiased">

      {/* 1. MIDNIGHT NAVY SIDEBAR WITH 3D CIRCULAR BRAND LOGO */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-64 bg-[#0f172a] text-slate-100
          z-50 transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          p-4 shadow-xl md:shadow-none border-r border-slate-800
        `}
      >
        {/* Fixed Header Portion (Logo & Profile Card) */}
        <div className="flex-shrink-0">
          {/* BRAND LOGO HEADER CARD */}
          <div className="bg-white p-2.5 rounded-2xl mb-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <Link
              href="/"
              onClick={(e) => {
                setSidebarOpen(false);
                setShowNotifMenu(false);
                if (pathname !== "/") {
                  router.push("/");
                }
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-white p-0.5 pointer-events-none">
                <img
                  src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1785662832/18homes_log_best_real_estate_e6spg7.jpg"
                  alt="18Homes Official Logo"
                  className="w-full h-full object-contain pointer-events-none"
                />
              </div>
              <div className="min-w-0 flex-1 pointer-events-none">
                <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight font-sans">
                  18homes
                </span>
                <span className="text-[9px] text-blue-600 font-semibold tracking-wider uppercase block">
                  Find Your Dream Home
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* USER MINI PROFILE CARD */}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl mb-5 border border-slate-700/60 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-600 flex-shrink-0 bg-slate-900">
                <Image
                  src={user?.avatar || defaultAvatar}
                  alt="User avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-xs truncate text-white">
                  {user?.name || "Welcome User"}
                </h4>
                <p className="text-[11px] text-slate-400 truncate font-normal">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>

              {user?.approvalStatus === "approved" || user?.role === "admin" || user?.role === "super_admin" || user?.role === "user" ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Approved
                </span>
              ) : (
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Links and Logout portion */}
        <div className="flex-grow overflow-y-auto mt-2 pb-24 md:pb-2 pr-1 space-y-6 flex flex-col justify-between">
          {/* SIDEBAR NAVIGATION LINKS */}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </p>

            {navLinks.map((link) => {
              const isAdminUser = user?.role === "admin" || user?.role === "super_admin";
              const isDealerOrBuilder = ["dealer", "builder"].includes(user?.role);
              const hasNoPaidPlan = !isAdminUser && isDealerOrBuilder && (user?.planName === "Free" || !user?.subscription);
              const premiumHrefs = [
                "/dashboard/analytics",
                "/dashboard/builder/projects",
                "/post-project",
                "/dashboard/dealer/leads",
                "/dashboard/dealer/featured-ads"
              ];
              const isLocked = hasNoPaidPlan && premiumHrefs.includes(link.href);

              const IconComp = isLocked ? Lock : link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={isLocked ? "#" : link.href}
                  onClick={(e) => {
                    if (isLocked) {
                      e.preventDefault();
                      toast.error("⚠️ Access Denied: You must purchase a paid plan to unlock this section.");
                      router.push("/membership");
                      return;
                    }
                    setSidebarOpen(false);
                  }}
                  className={`
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition duration-150 cursor-pointer
                    ${isActive
                      ? "bg-blue-600 text-white shadow-md font-semibold"
                      : isLocked
                      ? "text-slate-500 hover:bg-slate-800/40 hover:text-slate-400 font-medium"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white font-medium"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? "text-white" : isLocked ? "text-slate-500" : "text-slate-400"}`} />
                    <span className={isLocked ? "line-through text-slate-500" : ""}>{link.name}</span>
                  </div>
                  {isLocked && <Lock className="w-3.5 h-3.5 text-amber-500/70" />}
                  {isActive && !isLocked && <ChevronRight className="w-4 h-4 text-white/80" />}
                </Link>
              );
            })}
          </div>

          {/* LOGOUT BUTTON */}
          <div className="pt-4 border-t border-slate-800 mt-6 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 font-normal">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" /> Live Sync Active
              </span>
              <span>v2.4</span>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 py-2.5 rounded-xl font-semibold text-xs transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* 2. DEDICATED DASHBOARD TOP HEADER */}
      <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white border-b border-slate-200/80 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Mobile Toggle + Route Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl bg-[#0034ff] text-[white] hover:bg-slate-200 transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 capitalize tracking-tight">
              {pathname === "/dashboard"
                ? `${user?.role || "User"} Dashboard`
                : pathname.replace("/", "").replace("-", " ")}
            </h2>
            <p className="text-[11px] text-slate-500 font-normal">
              18Homes Dashboard Control Panel
            </p>
          </div>
        </div>

        {/* Right: CTA, Interactive Notifications & Profile Link */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/sell"
            className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Property</span>
          </Link>

          {/* Interactive Notifications Bell */}
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fb45b8] text-white transition relative cursor-pointer"
              title="Notifications"
            >
              <FaBell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Backdrop */}
            {showNotifMenu && (
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[90] transition-opacity"
                onClick={() => setShowNotifMenu(false)}
              />
            )}

            {/* Sliding Notification Drawer */}
            <div
              className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl z-[100] flex flex-col transform transition-transform duration-300 ease-in-out ${showNotifMenu ? "translate-x-0" : "translate-x-full"
                }`}
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowNotifMenu(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-slate-800 text-base">Notifications</h3>
                </div>

                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-slate-400 hover:text-rose-500 transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Scrollable Notifications List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                      <Bell className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-700 text-sm">No Notifications</p>
                    <p className="text-xs text-slate-400 mt-1">You are all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-4 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 ${!notif.read ? "bg-indigo-50/40" : "bg-white"
                        }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {notif.type === "approval" ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : notif.type === "new_message" ? (
                          <MessageSquare className="w-5 h-5 text-indigo-600" />
                        ) : notif.type === "contact_request" ? (
                          <Users className="w-5 h-5 text-amber-600" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-800 leading-tight">
                            {notif.title || "System Notification"}
                          </p>
                          {notif.metadata?.conversationId && (
                            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex-shrink-0">
                              Open Chat 💬
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-snug">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1.5 block">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => deleteNotification(notif._id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* User Profile Avatar Direct Link to Dashboard */}
          <Link
            href="/dashboard"
            title="Go to My Dashboard"
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-300 bg-slate-200 shadow-xs">
              <Image
                src={user?.avatar || defaultAvatar}
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden md:block text-left pr-1">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.name || "Account"}
              </p>
              <p className="text-[10px] text-slate-500 font-medium capitalize">
                {user?.role || "user"}
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* 3. MAIN SCROLLABLE CENTER CONTENT PANEL */}
      <main className="flex-1 md:pl-64 pt-16 min-h-screen bg-[#f8fafc] overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
