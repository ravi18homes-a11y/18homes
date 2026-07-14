"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check authentication and authorization
    const userData = localStorage.getItem("userData");
    
    if (!userData) {
      // Not logged in
      router.replace("/login-signup");
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      if (parsedData.role !== "admin") {
        // Logged in but not an admin
        router.replace("/");
      } else {
        // Authorized admin
        setIsAuthorized(true);
      }
    } catch (error) {
      // Error parsing user data
      localStorage.removeItem("userData");
      localStorage.removeItem("authToken");
      router.replace("/login-signup");
    }
  }, [router]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminSidebarCollapsed");
      if (saved !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCollapsed(saved === "true");
      }
    }
  }, []);

  const handleSetCollapsed = (val) => {
    setIsCollapsed(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("adminSidebarCollapsed", String(val));
    }
  };

  // Show a loading spinner or nothing while checking authorization
  // This prevents the admin layout from flashing for unauthorized users
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-x-hidden">
      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={handleSetCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "md:pl-20" : "md:pl-64"
        } pl-0 min-w-0`}
      >
        <AdminHeader onMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="p-4 md:p-6 flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
