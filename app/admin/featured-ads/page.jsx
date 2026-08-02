"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Sparkles,
  Search,
  MapPin,
  Clock,
  Trash2,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminFeaturedAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const fetchAdminAds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${databaseUrl}/api/featured-ads/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setAds(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching admin featured ads:", err);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAds();
  }, []);

  const handleStatusChange = async (id, status, extendDays = 0) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${databaseUrl}/api/featured-ads/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, extendDays }),
      });

      if (res.ok) {
        toast.success("Campaign status updated!");
        fetchAdminAds();
      } else {
        toast.error("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating ad status:", err);
      toast.error("Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    setUpdatingId(id);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${databaseUrl}/api/featured-ads/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Campaign deleted!");
        setAds((prev) => prev.filter((a) => a._id !== id));
      } else {
        toast.error("Failed to delete campaign");
      }
    } catch (err) {
      console.error("Error deleting ad:", err);
      toast.error("Error deleting campaign");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAds = ads.filter((ad) => {
    const dealerName = ad.dealer?.name || "";
    const city = ad.city || "";
    const locality = ad.locality || "";
    const tagline = ad.tagline || "";
    const q = searchTerm.toLowerCase();

    return (
      dealerName.toLowerCase().includes(q) ||
      city.toLowerCase().includes(q) ||
      locality.toLowerCase().includes(q) ||
      tagline.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              Admin Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              Featured Agent Ads & Locality Promotions
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1">
              Manage dealer & builder locality ad campaigns across cities.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-200 block">Active Ads</span>
            <span className="text-2xl font-black">{ads.filter(a => a.status === "active").length}</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by dealer name, city, locality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-amber-600 transition"
            />
          </div>

          <button
            onClick={fetchAdminAds}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Ads List Table */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              Loading featured ad campaigns...
            </p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center space-y-3">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No Campaigns Found
            </h3>
            <p className="text-xs text-slate-500">
              No dealer or builder has active locality promotions matching your search.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Dealer / Agency</th>
                    <th className="p-4">Target Location</th>
                    <th className="p-4">Package</th>
                    <th className="p-4">Expires</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAds.map((ad) => {
                    const dealer = ad.dealer || {};
                    const isExpired = new Date(ad.endDate) < new Date();

                    return (
                      <tr key={ad._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">
                            {dealer.name || "Unknown Agent"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {dealer.email || dealer.phone}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-extrabold text-amber-900 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-600" />
                            <span>{ad.locality ? `${ad.locality}, ${ad.city}` : ad.city}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 italic truncate max-w-xs">
                            "{ad.tagline}"
                          </div>
                        </td>

                        <td className="p-4 font-bold text-slate-700">
                          {ad.adPackage.replace(/_/g, " ").toUpperCase()}
                        </td>

                        <td className="p-4 text-slate-600 font-medium">
                          {new Date(ad.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="p-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                              isExpired
                                ? "bg-red-100 text-red-800"
                                : ad.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {isExpired ? "EXPIRED" : ad.status}
                          </span>
                        </td>

                        <td className="p-4 text-right space-x-2">
                          {ad.status !== "active" ? (
                            <button
                              onClick={() => handleStatusChange(ad._id, "active")}
                              disabled={updatingId === ad._id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[11px] hover:bg-emerald-100 transition"
                            >
                              Activate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(ad._id, "expired")}
                              disabled={updatingId === ad._id}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-[11px] hover:bg-amber-100 transition"
                            >
                              Pause
                            </button>
                          )}

                          <button
                            onClick={() => handleStatusChange(ad._id, "active", 30)}
                            disabled={updatingId === ad._id}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px] hover:bg-purple-100 transition"
                          >
                            +30 Days
                          </button>

                          <button
                            onClick={() => handleDeleteAd(ad._id)}
                            disabled={updatingId === ad._id}
                            className="p-1.5 text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );
}
