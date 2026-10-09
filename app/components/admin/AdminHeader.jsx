"use client";

import { useRouter } from "next/navigation";
import { LogOut, User, Menu } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminHeader({ onMenuToggle }) {
  const router = useRouter();

  const [user, setUser] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const u = JSON.parse(localStorage.getItem("userData") || "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(u);
    } catch (err) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser({});
    }
  }, []);

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("authToken");
    router.push("/login-signup");
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="User Avatar"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-[#8c4bdc]/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#8c4bdc]/10 text-[#8c4bdc] flex items-center justify-center font-bold text-sm">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                {user.name || "Admin"}
              </span>
              <span className="text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                {user.role || "Admin"}
              </span>
            </div>
            {(user.phone || user.contact || user.email) && (
              <p className="text-[11px] text-slate-500 font-medium">
                {user.phone || user.contact || user.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
