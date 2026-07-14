"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Home,
  MessageSquare,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

export default function AdminSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) {
  const pathname = usePathname();
  const router = useRouter();

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
        className={`fixed left-0 top-0 h-screen z-50 bg-green-700 text-white flex flex-col transition-all duration-300 ${isCollapsed ? "md:w-20" : "md:w-64"
          } w-64 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between p-5 border-b border-green-600">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1783796029/icon-192_bkv7wb.png"
              alt="18Homes"
              width={40}
              height={40}
              priority
            />
            <span
              className={`text-lg font-bold transition-opacity duration-200 ${isCollapsed ? "md:hidden" : "md:block"
                }`}
            >
              18Homes
            </span>
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
            href="/admin/pages"
            active={pathname.startsWith("/admin/pages")}
            icon={<FileText size={18} />}
            label="Pages"
            isCollapsed={isCollapsed}
          />

          {/* <NavItem
            href="/admin/contacts"
            active={pathname.startsWith("/admin/contacts")}
            icon={<MessageSquare size={18} />}
            label="Contacts"
            isCollapsed={isCollapsed}
          /> */}
        </nav>

        {/* LOGOUT & COLLAPSE */}
        <div className="p-4 space-y-2">
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
