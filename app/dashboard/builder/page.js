"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../DashboardLayout";
import {
  Building2,
  Lock,
  Clock,
  User,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
  BarChart3,
  Users,
} from "lucide-react";

export default function BuilderDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("userData");
      if (u) setUser(JSON.parse(u));
    } catch (e) {}

    const handleStorageChange = () => {
      try {
        const u = localStorage.getItem("userData");
        if (u) setUser(JSON.parse(u));
      } catch (e) {}
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isApproved = user?.approvalStatus === "approved" || isAdmin;
  const profileFilled = !!user?.builderDetails?.firmName;
  const isBuilder = user?.role === "builder";
  const hasNoPaidPlan = !isAdmin && isBuilder && (user?.planName === "Free" || !user?.subscription);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-800 to-pink-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-white/20 text-white text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                Builder & Developer Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                {user?.builderDetails?.firmName || user?.name || "Builder Dashboard"}
              </h1>
              <p className="text-purple-100 text-xs sm:text-sm mt-1">
                Manage housing projects, RERA credentials, buyer inquiries, and analytics.
              </p>
            </div>

            {isApproved ? (
              <Link
                href="/sell"
                className="self-start md:self-auto bg-white text-purple-700 hover:bg-slate-100 px-6 py-3 rounded-2xl font-bold transition shadow-md flex items-center gap-2 text-sm"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Project Listing</span>
              </Link>
            ) : (
              <div className="self-start md:self-auto bg-amber-400 text-amber-950 px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow">
                <Clock className="w-4 h-4" />
                <span>Account Pending Approval</span>
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
                    ? "Step 1: Fill Your Builder Profile Details"
                    : "Step 2: Awaiting Super Admin Verification"}
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                  {!profileFilled
                    ? "Please complete your Builder profile (Firm name, RERA Number, GST, PAN, Address) so Admin can verify your account."
                    : "Your builder credentials have been submitted and is pending approval by the Admin. Additional dashboard feature routes will unlock once approved!"}
                </p>
              </div>
            </div>

            <Link
              href="/edit-profile"
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-bold text-xs transition whitespace-nowrap shadow-md"
            >
              {!profileFilled ? "Edit Builder Profile" : "Review Profile Details"}
            </Link>
          </div>
        )}

        {/* BUILDER DASHBOARD NAVIGATION ROUTE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* 1. Edit Profile */}
          <Link
            href="/edit-profile"
            className="bg-white p-6 rounded-3xl border-2 border-slate-200 hover:border-purple-500 hover:shadow-xl transition group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase">
                Active
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-purple-600 transition-colors">
              Edit Profile
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update Firm Name, RERA reg, GST, PAN, and office address.
            </p>
            <div className="flex items-center text-xs font-bold text-purple-600 gap-1">
              <span>Manage Profile</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* 2. My Housing Projects */}
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
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              My Projects
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Manage completed, ongoing, and upcoming residential projects.
            </p>
            {hasNoPaidPlan ? (
              <Link href="/membership" className="flex items-center text-xs font-bold text-amber-600 gap-1">
                <span>Upgrade to Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : isApproved ? (
              <Link href="/dashboard/builder/projects" className="flex items-center text-xs font-bold text-indigo-600 gap-1">
                <span>View Projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-[11px] text-amber-700 font-semibold">
                Requires Admin Approval
              </span>
            )}
          </div>

          {/* 3. Add New Project Listing */}
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
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg mb-1">
              Post Project
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create new apartment, plot, or commercial project listings.
            </p>
            {hasNoPaidPlan ? (
              <Link href="/membership" className="flex items-center text-xs font-bold text-amber-600 gap-1">
                <span>Upgrade to Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : isApproved ? (
              <Link href="/post-project" className="flex items-center text-xs font-bold text-pink-600 gap-1">
                <span>Add Project</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-[11px] text-amber-700 font-semibold">
                Requires Admin Approval
              </span>
            )}
          </div>

          {/* 4. Dedicated Analytics Page */}
          {hasNoPaidPlan ? (
            <div className="bg-white p-6 rounded-3xl border-2 border-slate-200 opacity-75 bg-slate-50/70 transition relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>Premium Required</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-950 text-lg mb-1">
                Project Analytics
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                View real buyer visits, call clicks & WhatsApp leads for your properties.
              </p>
              <Link href="/membership" className="flex items-center text-xs font-bold text-amber-600 gap-1">
                <span>Upgrade to Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard/analytics"
              className="bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-6 rounded-3xl border-2 border-purple-800 hover:border-purple-500 hover:shadow-2xl transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full uppercase">
                  Analytics
                </span>
              </div>
              <h3 className="font-bold text-white text-lg mb-1 group-hover:text-purple-300 transition-colors">
                Project Analytics
              </h3>
              <p className="text-xs text-purple-200 mb-4">
                View real buyer visits, call clicks & WhatsApp leads for your properties.
              </p>
              <div className="flex items-center text-xs font-bold text-purple-300 gap-1">
                <span>Open Analytics</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          )}

          {/* 5. Client Leads & Enquiries */}
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
              Direct buyer/tenant contact requests for your housing projects.
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

        </div>

      </div>
    </DashboardLayout>
  );
}
