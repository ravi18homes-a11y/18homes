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
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
