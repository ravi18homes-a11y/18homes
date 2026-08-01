"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OwnerDashboard from "./owner/page";
import BuilderDashboard from "./builder/page";
import DealerDashboard from "./dealer/page";
import UserDashboard from "./user/page";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login-signup");
      return;
    }

    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Dashboard user parse error:", e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-[#8c4bdc] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (user.role === "owner") {
    return <OwnerDashboard />;
  }

  if (user.role === "builder") {
    return <BuilderDashboard />;
  }

  if (user.role === "dealer") {
    return <DealerDashboard />;
  }

  return <UserDashboard />;
}
