"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../DashboardLayout";
import {
  Home,
  User,
  History,
  Edit,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  Heart,
} from "lucide-react";

export default function OwnerDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("userData");
      if (u) setUser(JSON.parse(u));
    } catch (e) {}
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#8c4bdc] via-[#7b3ac5] to-[#c04b7e] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-white/20 text-white text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                Property Owner Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back, {user?.name || "Owner"}!</h1>
              <p className="text-purple-100 text-xs sm:text-sm mt-1">
                Manage your posted properties, edit your profile details, and track recent views.
              </p>
            </div>

            <Link
              href="/sell"
              className="self-start md:self-auto bg-white text-[#8c4bdc] hover:bg-slate-100 px-6 py-3 rounded-2xl font-bold transition shadow-md flex items-center gap-2 text-sm"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Post New Property</span>
            </Link>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Edit Profile */}
          <Link
            href="/edit-profile"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-[#8c4bdc] hover:shadow-lg transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#8c4bdc] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-[#8c4bdc] transition-colors">
              Edit Profile
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update personal info, phone, address, and mandatory Aadhaar/PAN.
            </p>
            <div className="flex items-center text-xs font-bold text-[#8c4bdc] gap-1">
              <span>Update Now</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* My Properties */}
          <Link
            href="/my-properties"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-emerald-600 transition-colors">
              My Properties
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              View, edit, boost, or delete your active property listings.
            </p>
            <div className="flex items-center text-xs font-bold text-emerald-600 gap-1">
              <span>View Listings</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* My Wishlist */}
          <Link
            href="/wishlist"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-rose-500 hover:shadow-lg transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-rose-600 transition-colors">
              My Wishlist
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              View saved favorite homes, flats, & plot listings.
            </p>
            <div className="flex items-center text-xs font-bold text-rose-600 gap-1">
              <span>View Wishlist</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Recent History */}
          <Link
            href="/recent-history"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
              Recent History
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Check properties you recently browsed or interacted with.
            </p>
            <div className="flex items-center text-xs font-bold text-blue-600 gap-1">
              <span>View History</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

        </div>

        {/* Account Status Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">Owner Account Verified</h4>
              <p className="text-xs text-slate-500">
                Full buying and selling privileges enabled. Aadhaar/PAN status: Verified.
              </p>
            </div>
          </div>
          <Link
            href="/edit-profile"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold transition"
          >
            View Verification Info
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
}
