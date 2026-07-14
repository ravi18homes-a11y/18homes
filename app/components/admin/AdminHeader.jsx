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
        <div className="flex items-center gap-2 text-gray-700">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}
