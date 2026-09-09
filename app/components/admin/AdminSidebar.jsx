"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  MessageSquare,
  FileText,
  Layers,
  BookOpen,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Heart,
  History,
  PlusCircle,
  Settings,
} from "lucide-react";

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("authToken");
    router.push("/login-signup");
  };

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 bg-green-700 text-white flex flex-col transition-all duration-300 ${isCollapsed ? "md:w-20" : "md:w-64"
          } w-64 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between sm:justify-center p-5 border-b border-green-600">
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Image
              src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1785662832/18homes_log_best_real_estate_e6spg7.jpg"
              alt="18Homes"
              width={40}
              height={40}
              priority
              className="rounded-[10px] sm:rounded-[16px] sm:w-[80px] sm:h-[80px] pointer-events-none"
            />
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-white hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 pb-28 md:pb-4 space-y-2 overflow-y-auto">
          <NavItem
            href="/admin/"
            active={pathname === "/admin"}
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/admin/users"
            active={pathname.startsWith("/admin/users")}
            icon={<Users size={18} />}
            label="Users"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/admin/properties"
            active={pathname.startsWith("/admin/properties")}
            icon={<Home size={18} />}
            label="Properties"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/admin/services"
            active={pathname.startsWith("/admin/services")}
            icon={<Layers size={18} />}
            label="Services"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/admin/blogs"
            active={pathname.startsWith("/admin/blogs")}
            icon={<BookOpen size={18} />}
            label="Blogs"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/admin/cities"
            active={pathname.startsWith("/admin/cities")}
            icon={<Building2 size={18} />}
            label="Cities"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/admin/pages"
            active={pathname.startsWith("/admin/pages")}
            icon={<FileText size={18} />}
            label="Pages"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/admin/featured-ads"
            active={pathname.startsWith("/admin/featured-ads")}
            icon={<Building2 size={18} />}
            label="Featured Agent Ads"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/admin/settings"
            active={pathname.startsWith("/admin/settings")}
            icon={<Settings size={18} />}
            label="System Settings"
            isCollapsed={isCollapsed}
          />

          <div className="pt-3 pb-1">
            <div className="border-t border-green-600/50 my-2"></div>
            <p className={`text-[10px] font-bold text-green-200 uppercase tracking-wider px-4 mb-2 ${isCollapsed ? "md:hidden" : "md:block"}`}>
              User Tools
            </p>
          </div>

          <NavItem
            href="/dashboard/chats"
            active={pathname === "/dashboard/chats"}
            icon={<MessageSquare size={18} />}
            label="Messages & Chats"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/my-properties"
            active={pathname === "/my-properties"}
            icon={<Home size={18} />}
            label="My Properties"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/edit-profile"
            active={pathname === "/edit-profile"}
            icon={<User size={18} />}
            label="Edit Profile"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/wishlist"
            active={pathname === "/wishlist"}
            icon={<Heart size={18} />}
            label="Saved Wishlist"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/recent-history"
            active={pathname === "/recent-history"}
            icon={<History size={18} />}
            label="Recent History"
            isCollapsed={isCollapsed}
          />

          <NavItem
            href="/sell"
            active={pathname === "/sell"}
            icon={<PlusCircle size={18} />}
            label="Post Property"
            isCollapsed={isCollapsed}
          />

          {/* Logout & Collapse Buttons directly below Pages NavItem */}
          <div className="pt-4 border-t border-green-600/50 space-y-2 mt-4">
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-colors ${isCollapsed ? "md:justify-center" : ""
                }`}
            >
              <LogOut size={18} />
              <span className={isCollapsed ? "md:hidden" : "md:block"}>
                Logout
              </span>
            </button>

            {/* Collapse toggle for desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex w-full items-center justify-center bg-green-800 hover:bg-green-600 p-2 rounded text-white transition-colors"
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}

/* ================= NAV ITEM ================= */

function NavItem({ href, active, icon, label, isCollapsed }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded transition ${active
        ? "bg-white text-green-700 font-semibold"
        : "hover:bg-green-600 text-white"
        } ${isCollapsed ? "md:justify-center" : ""}`}
    >
      {icon}
      <span className={isCollapsed ? "md:hidden" : "md:block"}>{label}</span>
    </Link>
  );
}
