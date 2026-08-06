"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../DashboardLayout";
import {
  Briefcase,
  Lock,
  Clock,
  User,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Users,
  Home,
  BarChart3,
} from "lucide-react";

export default function DealerDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("userData");
      if (u) setUser(JSON.parse(u));
    } catch (e) { }

    const handleStorageChange = () => {
      try {
        const u = localStorage.getItem("userData");
        if (u) setUser(JSON.parse(u));
      } catch (e) { }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isApproved = user?.approvalStatus === "approved" || isAdmin;
  const profileFilled = !!user?.dealerDetails?.agencyName;
  const isDealer = user?.role === "dealer";
  const hasNoPaidPlan = !isAdmin && isDealer && (user?.planName === "Free" || !user?.subscription);

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Top Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-white/20 text-white text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                Dealer & Agent Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                {user?.dealerDetails?.agencyName || user?.name || "Dealer Dashboard"}
              </h1>
              <p className="text-amber-100 text-xs sm:text-sm mt-1">
                Manage real estate listings, client portfolios, leads, and agent verification.
              </p>
            </div>

            {isApproved ? (
              <Link
                href="/sell"
                className="self-start md:self-auto bg-white text-amber-700 hover:bg-slate-100 px-6 py-3 rounded-2xl font-bold transition shadow-md flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Post Dealer Property</span>
              </Link>
            ) : (
              <div className="self-start md:self-auto bg-white/20 text-white px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 backdrop-blur-md">
                <Clock className="w-4 h-4" />
                <span>Verification Pending</span>
              </div>
            )}
          </div>
        </div>

        {/* VERIFICATION & PROFILE PROGRESS ALERT */}
        {!isApproved && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-extrabold text-amber-950 text-base sm:text-lg mb-1">
                  {!profileFilled
                    ? "Step 1: Fill Your Dealer Profile Details"
                    : "Step 2: Awaiting Super Admin Verification"}
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                  {!profileFilled
                    ? "Please complete your Dealer profile (Agency Name, License/GST, PAN, Aadhaar, Operating Areas) so Admin can verify your agent account."
                    : "Your dealer profile has been submitted and is pending verification by the Super Admin. Extra routes will unlock once approved!"}
                </p>
              </div>
            </div>

            <Link
              href="/edit-profile"
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold text-xs transition whitespace-nowrap shadow-md"
            >
              {!profileFilled ? "Edit Dealer Profile" : "Review Profile Details"}
            </Link>
          </div>
        )}

        {/* DEALER DASHBOARD ROUTE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. Edit Profile (Always Unlocked) */}
          <Link
            href="/edit-profile"
            className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-amber-500 hover:shadow-xl transition group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                Always Active
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-amber-600 transition-colors">
              Edit Dealer Profile
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update Agency Name, License, GST, PAN, Aadhaar, & operating areas.
            </p>
            <div className="flex items-center text-xs font-bold text-amber-600 gap-1">
              <span>Manage Profile</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 2. Dealer Properties */}
          <div
            className={`bg-white p-6 rounded-3xl border-2 transition relative overflow-hidden ${isApproved
                ? "border-slate-200 hover:border-orange-500 hover:shadow-xl cursor-pointer"
                : "border-slate-200 opacity-75 bg-slate-50/70"
              }`}
          >
            {!isApproved && (
              <div className="absolute top-4 right-4 bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Locked</span>
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              My Property Listings
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Manage property listings you represent for sellers or landlords.
            </p>
            {isApproved ? (
              <Link href="/my-properties" className="flex items-center text-xs font-bold text-orange-600 gap-1">
                <span>View Listings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-[11px] text-amber-700 font-semibold">
                Requires Admin Approval
              </span>
            )}
          </div>

          {/* 3. Post New Listing */}
          <div
            className={`bg-white p-6 rounded-3xl border-2 transition relative overflow-hidden ${isApproved
                ? "border-slate-200 hover:border-teal-500 hover:shadow-xl cursor-pointer"
                : "border-slate-200 opacity-75 bg-slate-50/70"
              }`}
          >
            {!isApproved && (
              <div className="absolute top-4 right-4 bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Locked</span>
              </div>
            )}
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Post Dealer Property
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              List new resale or rental properties with agent commission options.
            </p>
            {isApproved ? (
              <Link href="/sell" className="flex items-center text-xs font-bold text-teal-600 gap-1">
                <span>Post Listing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-[11px] text-amber-700 font-semibold">
                Requires Admin Approval
              </span>
            )}
          </div>

          {/* 4. Client Enquiries & Leads */}
          <div
            className={`bg-white p-6 rounded-3xl border-2 transition relative overflow-hidden ${
              isApproved && !hasNoPaidPlan
                ? "border-slate-200 hover:border-indigo-500 hover:shadow-xl cursor-pointer"
                : "border-slate-200 opacity-75 bg-slate-50/70"
            }`}
          >
            {hasNoPaidPlan ? (
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Premium Required</span>
              </div>
            ) : !isApproved ? (
              <div className="absolute top-4 right-4 bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Locked</span>
              </div>
            ) : null}
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Client Leads & Inbox
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Direct buyer/tenant contact requests for your operating areas.
            </p>
            {hasNoPaidPlan ? (
              <Link href="/membership" className="flex items-center text-xs font-bold text-amber-600 gap-1">
                <span>Upgrade to Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : isApproved ? (
              <Link href="/dashboard/dealer/leads" className="flex items-center text-xs font-bold text-indigo-600 gap-1">
                <span>Open Leads Inbox</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-[11px] text-amber-700 font-semibold">
                Requires Admin Approval
              </span>
            )}
          </div>

          {/* 5. Featured Agent Ads */}
          <div
            className={`bg-white p-6 rounded-3xl border-2 transition relative overflow-hidden ${
              isApproved && !hasNoPaidPlan
                ? "border-slate-200 hover:border-pink-500 hover:shadow-xl cursor-pointer"
                : "border-slate-200 opacity-75 bg-slate-50/70"
            }`}
          >
            {hasNoPaidPlan ? (
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Premium Required</span>
              </div>
            ) : !isApproved ? (
              <div className="absolute top-4 right-4 bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Locked</span>
              </div>
            ) : null}
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Featured Agent Ads
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Boost your agency profile in your local area property searches.
            </p>
            {hasNoPaidPlan ? (
              <Link href="/membership" className="flex items-center text-xs font-bold text-amber-600 gap-1">
                <span>Upgrade to Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : isApproved ? (
              <Link href="/dashboard/dealer/featured-ads" className="flex items-center text-xs font-bold text-pink-600 gap-1">
                <span>Manage Featured Ads</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-[11px] text-amber-700 font-semibold">
                Requires Admin Approval
              </span>
            )}
          </div>

          {/* 6. Property Analytics */}
          <div
            className={`bg-white p-6 rounded-3xl border-2 transition relative overflow-hidden ${
              isApproved && !hasNoPaidPlan
                ? "border-slate-200 hover:border-purple-500 hover:shadow-xl cursor-pointer"
                : "border-slate-200 opacity-75 bg-slate-50/70"
            }`}
          >
            {hasNoPaidPlan ? (
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Gold Required</span>
              </div>
            ) : !isApproved ? (
              <div className="absolute top-4 right-4 bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Locked</span>
              </div>
            ) : null}
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Property Analytics & Inquiries
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              View buyer visitor logs, phone call clicks, and WhatsApp chat inquiries for your properties.
            </p>
            {hasNoPaidPlan ? (
              <Link href="/dashboard/analytics" className="flex items-center text-xs font-bold text-amber-600 gap-1">
                <span>Locked (Gold Required)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : isApproved ? (
              <Link href="/dashboard/analytics" className="flex items-center text-xs font-bold text-purple-600 gap-1">
                <span>View Analytics</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-[11px] text-amber-700 font-semibold">
                Requires Admin Approval
              </span>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
