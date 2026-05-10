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
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("authToken");
    router.push("/login-signup");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ================= SIDEBAR ================= */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-green-700 text-white flex flex-col">
        {/* LOGO */}
        <a
          href="/"
          className="flex items-center gap-3 p-5 border-b border-green-600"
        >
          <Image
            src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1765721624/18homess-removebg-preview_kqdv2j.png"
            alt="18Homes"
            width={40}
            height={40}
            priority
          />
          <span className="text-xl font-bold">18Homes Admin</span>
        </a>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem
            href="/admin/"
            active={pathname === "/admin"}
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
          />

          <NavItem
            href="/admin/users"
            active={pathname.startsWith("/admin/users")}
            icon={<Users size={18} />}
            label="Users"
          />

          <NavItem
            href="/admin/properties"
            active={pathname.startsWith("/admin/properties")}
            icon={<Home size={18} />}
            label="Properties"
          />

          <NavItem
            href="/admin/pages"
            active={pathname.startsWith("/admin/pages")}
            icon={<FileText size={18} />}
            label="Pages"
          />

          <NavItem
            href="/admin/contacts"
            active={pathname.startsWith("/admin/contacts")}
            icon={<MessageSquare size={18} />}
            label="Contacts"
          />
        </nav>

        {/* LOGOUT */}
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="ml-64 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

/* ================= NAV ITEM ================= */

function NavItem({ href, active, icon, label }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded transition ${
        active ? "bg-white text-green-700 font-semibold" : "hover:bg-green-600"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
