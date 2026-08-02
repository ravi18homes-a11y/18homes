"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../../DashboardLayout";
import {
  Sparkles,
  PlusCircle,
  MapPin,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Search,
  Award,
  Layers,
  ChevronRight,
  Phone,
  MessageCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function DealerFeaturedAdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    city: "Noida",
    locality: "Sector 150",
    tagline: "Top Area Specialist & Verified Dealer",
    adPackage: "pro_30_days",
  });

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const fetchMyAds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in first");
        setLoading(false);
        return;
      }

      const res = await fetch(`${databaseUrl}/api/featured-ads/my`, {
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
      console.error("Error fetching featured ads:", err);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, []);

  const handleCreateAd = async (e) => {
    e.preventDefault();
    if (!form.city.trim()) {
      toast.error("Please enter City");
      return;
    }

    const token = localStorage.getItem("authToken");
    setCreating(true);
    try {
      const res = await fetch(`${databaseUrl}/api/featured-ads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Locality Featured Campaign activated!");
        setShowModal(false);
        fetchMyAds();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to create ad campaign");
      }
    } catch (err) {
      console.error("Ad creation error:", err);
      toast.error("Error creating campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm("Are you sure you want to cancel this campaign?")) return;
    setDeletingId(id);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${databaseUrl}/api/featured-ads/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Campaign cancelled successfully");
        setAds((prev) => prev.filter((a) => a._id !== id));
      } else {
        toast.error("Failed to delete campaign");
      }
    } catch (err) {
      console.error("Error deleting ad:", err);
      toast.error("Error deleting campaign");
    } finally {
      setDeletingId(null);
    }
  };

  const activeAdsCount = ads.filter((a) => a.status === "active").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              Featured Agent Ads & Locality Promotion
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              Top Area Specialist Campaigns
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1">
              Promote your profile and listings in specific cities and localities for max buyer leads.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-amber-900 hover:bg-slate-100 px-5 py-3 rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Launch New Locality Campaign</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Active Campaigns</p>
              <h4 className="text-xl font-black text-slate-900">{activeAdsCount}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Total Campaigns</p>
              <h4 className="text-xl font-black text-slate-900">{ads.length}</h4>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Verified Status</p>
              <h4 className="text-sm font-black text-emerald-600">Top Area Expert</h4>
            </div>
          </div>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              Loading your active promotion campaigns...
            </p>
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center space-y-4">
            <Award className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No Active Locality Promotions
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get highlighted as the Top Area Specialist in your target city/locality to attract direct buyer inquiries.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch First Campaign</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Your Active Promotion Campaigns</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ads.map((ad) => {
                const isExpired = new Date(ad.endDate) < new Date();
                const daysRemaining = Math.max(
                  0,
                  Math.ceil(
                    (new Date(ad.endDate) - new Date()) / (1000 * 60 * 60 * 24)
                  )
                );

                return (
                  <div
                    key={ad._id}
                    className="bg-white rounded-3xl p-6 border-2 border-slate-100 hover:border-amber-300 hover:shadow-xl transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                            isExpired
                              ? "bg-red-100 text-red-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isExpired ? "EXPIRED" : "ACTIVE PROMOTION"}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {ad.adPackage.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-slate-900 flex items-center gap-1.5 pt-1">
                        <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>
                          {ad.locality ? `${ad.locality}, ${ad.city}` : ad.city}
                        </span>
                      </h4>

                      <p className="text-xs text-amber-900 bg-amber-50 p-3 rounded-2xl border border-amber-100 italic font-medium">
                        "{ad.tagline}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{daysRemaining} Days Remaining</span>
                      </div>

                      <button
                        onClick={() => handleDeleteAd(ad._id)}
                        disabled={deletingId === ad._id}
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New Campaign Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <div className="border-b border-slate-100 pb-3">
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  Area Specialist Promotion
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  Launch Locality Featured Ad
                </h3>
              </div>

              <form onSubmit={handleCreateAd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Noida"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-amber-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Target Locality / Sector (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 150"
                    value={form.locality}
                    onChange={(e) => setForm({ ...form, locality: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-amber-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specialist Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 150 Luxury Apartments Specialist"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-amber-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Campaign Package Duration
                  </label>
                  <select
                    value={form.adPackage}
                    onChange={(e) => setForm({ ...form, adPackage: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="starter_7_days">Starter (7 Days Active)</option>
                    <option value="pro_30_days">Pro Area Specialist (30 Days Active)</option>
                    <option value="premium_90_days">Premium Dominance (90 Days Active)</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl text-xs font-black transition shadow-md shadow-amber-100"
                  >
                    {creating ? "Activating..." : "Activate Featured Campaign"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
