"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FaWhatsapp, FaUser, FaEdit, FaCog, FaHome, FaHeart, FaBell, FaCheckCircle, FaExclamationTriangle, FaTrashAlt, FaHistory, FaChevronDown, FaCommentDots, FaUserTie } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { MdLogin, MdPhone } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import { usePwa } from "@/components/PwaProvider";

function flattenNavTree(nodes, depth = 0, acc = []) {
  for (const n of nodes || []) {
    acc.push({ node: n, depth });
    if (n.children?.length) flattenNavTree(n.children, depth + 1, acc);
  }
  return acc;
}

function DropdownPanel({ nodes }) {
  if (!nodes?.length) return null;
  const flat = flattenNavTree(nodes);
  return (
    <ul className="absolute left-0 top-full z-[60] mt-1 min-w-[230px] rounded-xl border border-slate-100 bg-white py-2 shadow-xl opacity-0 invisible transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100">
      {flat.map(({ node, depth }) => (
        <li key={node.id}>
          <Link
            href={node.href}
            className="block py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            style={{ paddingLeft: 12 + depth * 12, paddingRight: 16 }}
          >
            {node.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NavItem({ href, label, items }) {
  const hasKids = items?.length > 0;
  if (!hasKids) {
    return (
      <li>
        <Link
          href={href}
          className="hover:text-[#8c4bdc] transition-colors"
        >
          {label}
        </Link>
      </li>
    );
  }
  return (
    <li className="group relative">
      <span className="inline-flex cursor-default items-center gap-1">
        <Link href={href} className="hover:text-[#8c4bdc] transition-colors">
          {label}
        </Link>
        <FaChevronDown className="text-[11px] hover:rotate-180 transition-transform duration-300" />
      </span>
      <DropdownPanel nodes={items} />
    </li>
  );
}

function MobileNavBranch({ node, onPick }) {
  return (
    <div>
      <Link href={node.href} onClick={onPick} className="block py-0.5">
        {node.title}
      </Link>
      {node.children?.length > 0 && (
        <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-slate-200 pl-2 text-[16px] text-slate-700">
          {node.children.map((ch) => (
            <MobileNavBranch key={ch.id} node={ch} onPick={onPick} />
          ))}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateString) {
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

const DEFAULT_LOGO = "https://res.cloudinary.com/dxlykgx6w/image/upload/v1785662832/18homes_log_best_real_estate_e6spg7.jpg";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isInstallable, installApp } = usePwa();
  const [open, setOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [navData, setNavData] = useState(null);
  const [navbarLogo, setNavbarLogo] = useState(DEFAULT_LOGO);
  const [navbarLogoAlt, setNavbarLogoAlt] = useState("Logo");
  const profileMenuRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifMenuRef = useRef(null);
  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      markAsRead(notif._id);
    }
    setShowNotifMenu(false);

    if (notif.metadata?.conversationId) {
      router.push(`/dashboard/chats?conversationId=${notif.metadata.conversationId}`);
    } else if (notif.type === "contact_request") {
      router.push("/dashboard/dealer/leads");
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setNotifications([]);
      return;
    }
    try {
      const res = await fetch(`${databaseUrl}/api/notifications`, {
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
      console.error("Error fetching notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${databaseUrl}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${databaseUrl}/api/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${databaseUrl}/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const clearAllNotifications = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`${databaseUrl}/api/notifications`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error clearing all notifications:", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    let cancelled = false;
    fetch("/api/navbar")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setNavData(data);
      })
      .catch(() => {
        if (!cancelled) setNavData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch logo from homepage settings
  useEffect(() => {
    let cancelled = false;
    fetch("/api/homepage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.navbar?.logo) {
          setNavbarLogo(data.navbar.logo);
        }
        if (!cancelled && data?.navbar?.logoAlt) {
          setNavbarLogoAlt(data.navbar.logoAlt);
        }
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, []);

  // Track auth state from localStorage (login saves 'authToken')
  useEffect(() => {
    const checkAuth = () => {
      try {
        setIsLoggedIn(!!localStorage.getItem("authToken"));
        setUser(JSON.parse(localStorage.getItem("userData")));
      } catch (e) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1186) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close notification menu when clicking outside
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

  // Poll for notifications
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isLoggedIn]);

  return (
    <nav
      className={`
        w-full fixed top-0 left-0 z-50 
        transition-all duration-300  
        ${isScrolled ? "bg-white shadow-md" : "bg-white"}
      `}
    >
      <div className="max-w-[1720px] mx-auto flex items-center justify-between lg:px-14 px-4 py-2">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              setOpen(false);
              setShowNotifMenu(false);
              setShowProfileMenu(false);
              if (pathname !== "/") {
                router.push("/");
              }
            }}
            className="cursor-pointer"
          >
            <Image
              src={navbarLogo}
              alt={navbarLogoAlt}
              width={70}
              height={70}
              className="object-contain max-w-[70px] max-h-[70px] pointer-events-none"
            />
          </Link>

          <ul
            className={`desktop-menu hidden lg:flex items-center gap-8 ${isScrolled ? "text-black" : "text-black"
              } text-[18px]`}
          >
            {(navData?.menus || [
              { key: "home", label: "Home", href: "/", children: [] },
              { key: "buy", label: "Buy", href: "/buy", children: [] },
              { key: "projects", label: "Projects", href: "/projects", children: [] },
              { key: "service", label: "Service", href: "/service", children: [] },
              { key: "blog", label: "Blog", href: "/blog", children: [] },
              { key: "city", label: "City", href: "/city", children: [] },
              { key: "contact", label: "Contact", href: "/contact", children: [] },
            ])
              .filter((m) => m.key !== "sell" && m.href !== "/sell")
              .map((m) => (
                <NavItem
                  key={m.key}
                  href={m.href}
                  label={m.label}
                  items={m.children}
                />
              ))}
            {(navData?.sitePages || []).map((p) => (
              <NavItem
                key={p.id}
                href={p.href}
                label={p.title}
                items={p.children}
              />
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          {isLoggedIn && (
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-[#fb45b8] hover:bg-[#8c4bdc]/10 text-[white] hover:text-[#8c4bdc] transition relative cursor-pointer"
              >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Backdrop overlay */}
              <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-[90] transition-opacity duration-300 ${showNotifMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                  }`}
                onClick={() => setShowNotifMenu(false)}
              />

              {/* Sliding Drawer Container */}
              <div
                className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl z-[100] flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${showNotifMenu ? "translate-x-0" : "translate-x-full"
                  }`}
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNotifMenu(false)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                    >
                      <IoMdClose className="text-2xl" />
                    </button>
                    <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#8c4bdc] hover:underline font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-slate-400 hover:text-red-500 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <FaTrashAlt className="text-[11px]" /> Clear all
                      </button>
                    )}
                  </div>
                </div>

                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                      <span className="text-5xl mb-3">🔔</span>
                      <p className="text-slate-600 font-semibold text-base">No notifications yet</p>
                      <p className="text-slate-400 text-sm mt-1 max-w-[240px]">
                        We'll notify you here when important updates occur.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-5 flex gap-4 transition cursor-pointer text-left border-l-4 ${notif.read
                          ? "bg-white hover:bg-slate-50 border-transparent"
                          : "bg-purple-50/30 hover:bg-purple-50/50 border-[#8c4bdc]"
                          }`}
                      >
                        {/* Icon column */}
                        <div className="flex-shrink-0 mt-0.5">
                          {notif.type === "payment_success" ? (
                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                              <FaCheckCircle className="text-emerald-500 text-lg" />
                            </div>
                          ) : notif.type === "boost_expiring" ? (
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                              <FaExclamationTriangle className="text-amber-500 text-lg" />
                            </div>
                          ) : notif.type === "new_message" ? (
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                              <FaCommentDots className="text-indigo-600 text-lg" />
                            </div>
                          ) : notif.type === "contact_request" ? (
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                              <FaUserTie className="text-amber-600 text-lg" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                              <FaBell className="text-[#8c4bdc] text-base" />
                            </div>
                          )}
                        </div>

                        {/* Content column */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm leading-snug ${notif.read ? "text-slate-700 font-medium" : "text-slate-900 font-bold"}`}>
                              {notif.title}
                            </p>
                            {!notif.read && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#8c4bdc] flex-shrink-0 mt-1.5 animate-pulse" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed break-words">
                            {notif.message}
                          </p>
                          {notif.metadata?.conversationId && (
                            <span className="inline-block mt-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                              Click to Chat 💬
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 mt-1.5 block font-medium">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        {/* Delete button */}
                        <div className="flex-shrink-0 self-center">
                          <button
                            onClick={(e) => deleteNotification(notif._id, e)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
                            title="Delete"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <Link
            href={isLoggedIn ? "/dashboard" : "/login-signup"}
            title={isLoggedIn ? "Go to Dashboard" : "Login / Signup"}
            className="w-14 h-14 p-[4px] rounded-full cursor-pointer border-2 border-[#8c4bdc] overflow-hidden hover:border-[#c04b7e] transition flex items-center justify-center bg-slate-100"
          >
            <Image
              src={user?.avatar || "https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif"}
              alt="Profile"
              width={48}
              height={48}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.src =
                  "https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif";
              }}
            />
          </Link>
        </div>

        {/* <button
            className="hamburger-icon lg:hidden text-black text-4xl"
            onClick={() => setOpen(!open)}
          >
            {open ? <IoMdClose /> : <GiHamburgerMenu />}
          </button> */}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`border-t h-full overflow-y-auto border-t-neutral-300 mt-2 fixed top-19 left-0  w-full bg-white shadow-xl z-50 p-8 pt-5
    transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col space-y-5 text-black text-[18px]">
          {(navData?.menus || [
            { key: "home", label: "Home", href: "/", children: [] },
            { key: "buy", label: "Buy", href: "/buy", children: [] },
            { key: "projects", label: "Projects", href: "/projects", children: [] },
            { key: "service", label: "Service", href: "/service", children: [] },
            { key: "contact", label: "Contact", href: "/contact", children: [] },
          ])
            .filter((m) => m.key !== "sell" && m.href !== "/sell")
            .map((m) => (
            <div key={m.key} className="space-y-2">
              <Link href={m.href} onClick={() => setOpen(false)}>
                {m.label}
              </Link>
              {m.children?.length > 0 && (
                <div className="ml-4 flex flex-col gap-2 border-l border-slate-200 pl-3 text-base text-slate-700">
                  {m.children.map((c) => (
                    <MobileNavBranch key={c.id} node={c} onPick={() => setOpen(false)} />
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/membership"
            onClick={() => setOpen(false)}
            className="text-left text-blue-600 font-bold flex items-center gap-2 py-1 cursor-pointer"
          >
            <span>💎</span> Membership Plans
          </Link>

          <button
            onClick={() => {
              if (installApp) installApp();
              setOpen(false);
            }}
            className="text-left text-blue-600 font-bold flex items-center gap-2 py-1 cursor-pointer"
          >
            <span>📲</span> Install 18Homes App
          </button>

          {(navData?.sitePages || []).map((p) => (
            <div key={p.id} className="space-y-2">
              <Link href={p.href} onClick={() => setOpen(false)}>
                {p.title}
              </Link>
              {p.children?.length > 0 && (
                <div className="ml-4 flex flex-col gap-2 border-l border-indigo-100 pl-3 text-base text-slate-700">
                  {p.children.map((c) => (
                    <MobileNavBranch key={c.id} node={c} onPick={() => setOpen(false)} />
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/contact"
            className="w-[153px] px-7 mt-4 py-2 border border-[black] text-[black] rounded-full"
            onClick={() => setOpen(false)}
          >
            Book Now
          </Link>

          {!isLoggedIn && (
            <Link
              href="/login-signup"
              className="w-[153px] px-7 mt-4 py-2 border border-[black] text-[black] rounded-full"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}

          {isLoggedIn && (
            <Link
              href="/edit-profile"
              className="w-[153px] px-7 mt-4 py-2 border border-[black] text-[black] rounded-full"
              onClick={() => setOpen(false)}
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
