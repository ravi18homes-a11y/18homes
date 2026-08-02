"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../DashboardLayout";
import {
  User,
  Heart,
  History,
  Search,
  ChevronRight,
  Home,
  PlusCircle,
} from "lucide-react";

export default function UserDashboard() {
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

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* Top Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* <span className="bg-white/20 text-white text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                Normal User Dashboard
              </span> */}
              <h1 className="text-2xl sm:text-3xl font-extrabold">Hello, {user?.name || "User"}!</h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                Explore verified properties in Noida & Delhi NCR, save your wishlists, and track views.
              </p>
            </div>

            <Link
              href="/buy"
              className="self-start md:self-auto bg-white text-blue-600 hover:bg-slate-100 px-6 py-3 rounded-2xl font-bold transition shadow-md flex items-center gap-2 text-sm"
            >
              <Search className="w-5 h-5" />
              <span>Explore Properties (Buy)</span>
            </Link>
          </div>
        </div>

        {/* Quick Notice: Sell Route Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-blue-950 text-sm">Want to Sell or Rent out Property?</h4>
              <p className="text-xs text-blue-700">
                Normal user accounts are restricted to buying. You can switch your role to <strong>Property Owner</strong> in your profile anytime!
              </p>
            </div>
          </div>

          <Link
            href="/edit-profile"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap shadow-sm"
          >
            Switch Role to Owner
          </Link>
        </div>

        {/* Action Grid - Common Routes for All */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Edit Profile */}
          <Link
            href="/edit-profile"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-500 hover:shadow-xl transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
              Edit Profile
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update name, phone number, profile picture, and address.
            </p>
            <div className="flex items-center text-xs font-bold text-blue-600 gap-1">
              <span>Edit Profile</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Post / Sell Property */}
          {/* <Link
            href="/sell"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-emerald-600 transition-colors">
              Post Property
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sell or rent out your apartment, plot, or villa.
            </p>
            <div className="flex items-center text-xs font-bold text-emerald-600 gap-1">
              <span>Post Listing</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link> */}

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-rose-500 hover:shadow-xl transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-rose-600 transition-colors">
              Saved Wishlist
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Access your favorite saved homes & apartments.
            </p>
            <div className="flex items-center text-xs font-bold text-rose-600 gap-1">
              <span>View Wishlist</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Recent History */}
          <Link
            href="/recent-history"
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-purple-500 hover:shadow-xl transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-purple-600 transition-colors">
              Recently Viewed
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              View properties you recently browsed on 18Homes.
            </p>
            <div className="flex items-center text-xs font-bold text-purple-600 gap-1">
              <span>View History</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

        </div>

      </div>
    </DashboardLayout>
  );
}
