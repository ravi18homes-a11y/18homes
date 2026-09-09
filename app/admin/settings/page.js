"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  UserCheck
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState(null);
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(true);
  const [isApprovalRequired, setIsApprovalRequired] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${databaseUrl}/api/settings/payment-mode`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setIsPaymentEnabled(data.data.isPaymentEnabled !== false);
          setIsApprovalRequired(data.data.isApprovalRequired !== false);
          setLastUpdated(data.data.updatedAt);
        }
      }
    } catch (err) {
      console.error("Error fetching system settings:", err);
      toast.error("Failed to load system settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleSetting = async (key, newValue) => {
    try {
      setUpdatingKey(key);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Admin authentication token missing. Please log in.");
        return;
      }

      const bodyPayload = { key, value: newValue };
      if (key === "isPaymentEnabled") bodyPayload.isPaymentEnabled = newValue;
      if (key === "isApprovalRequired") bodyPayload.isApprovalRequired = newValue;

      const res = await fetch(`${databaseUrl}/api/settings/payment-mode`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (key === "isPaymentEnabled") {
          setIsPaymentEnabled(newValue);
          toast.success(
            newValue
              ? "Payment Gateway Enabled (Paid Mode Active)"
              : "Payment Gateway Disabled (Free Direct Access Mode Active)"
          );
        } else if (key === "isApprovalRequired") {
          setIsApprovalRequired(newValue);
          toast.success(
            newValue
              ? "Admin Approval Requirement Enabled (Pending Lock Active)"
              : "Admin Approval Requirement Disabled (Auto-Approved Mode Active)"
          );
        }
        setLastUpdated(data.data?.updatedAt || new Date());
      } else {
        toast.error(data.message || "Failed to update setting");
      }
    } catch (err) {
      console.error("Error updating setting:", err);
      toast.error("Network error while updating system setting");
    } finally {
      setUpdatingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading System Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">System Settings</h1>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Admin Control
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Configure global website behavior, payment gateway state, paywalls, and user approval locks.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="self-start sm:self-auto p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 transition flex items-center gap-2 text-xs font-semibold"
          title="Refresh Settings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. PAYMENT GATEWAY & SUBSCRIPTION PAYWALL TOGGLE CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${
                isPaymentEnabled
                  ? "bg-purple-50 text-purple-600 border border-purple-100"
                  : "bg-amber-50 text-amber-600 border border-amber-100"
              }`}>
                {isPaymentEnabled ? <CreditCard className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment Gateway & Subscription Paywalls
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    isPaymentEnabled
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}>
                    {isPaymentEnabled ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>ON (Paid Mode)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span>OFF (Free Access)</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                  Turn <strong>OFF</strong> to remove all Razorpay payment checkouts, membership fees, and property boosting costs across the site.
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="flex items-center gap-3 self-start md:self-center">
              {updatingKey === "isPaymentEnabled" && <Loader2 className="w-5 h-5 animate-spin text-green-600" />}
              <button
                disabled={updatingKey !== null}
                onClick={() => handleToggleSetting("isPaymentEnabled", !isPaymentEnabled)}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner cursor-pointer ${
                  isPaymentEnabled ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span className="sr-only">Toggle Payment System</span>
                <span
                  style={{ display: "flex" }}
                  className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center font-bold text-xs ${
                    isPaymentEnabled ? "translate-x-13 text-green-700" : "translate-x-1 text-gray-500"
                  }`}
                >
                  {isPaymentEnabled ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          {/* Mode Descriptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className={`p-5 rounded-2xl border transition-all ${
              isPaymentEnabled
                ? "bg-purple-50/50 border-purple-200 ring-2 ring-purple-500/10"
                : "bg-gray-50 border-gray-200 opacity-60"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-purple-900 text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span>ON: Paid Mode</span>
                </h3>
                {isPaymentEnabled && (
                  <span className="text-[10px] uppercase font-black tracking-wider bg-purple-200 text-purple-800 px-2 py-0.5 rounded">Active</span>
                )}
              </div>
              <ul className="space-y-2 text-xs text-purple-950 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Razorpay payment gateway active.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Subscription plans and listing caps enforced.</span>
                </li>
              </ul>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              !isPaymentEnabled
                ? "bg-emerald-50/50 border-emerald-200 ring-2 ring-emerald-500/10"
                : "bg-gray-50 border-gray-200 opacity-60"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-emerald-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <span>OFF: Free Mode</span>
                </h3>
                {!isPaymentEnabled && (
                  <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">Active</span>
                )}
              </div>
              <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Instant 1-Click Free Property Boosting.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>All roles get unlimited free features.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REQUIRES ADMIN APPROVAL TOGGLE CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className={`p-4 rounded-2xl ${
                isApprovalRequired
                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}>
                {isApprovalRequired ? <Lock className="w-8 h-8" /> : <Unlock className="w-8 h-8" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    Requires Admin Approval (Dealer & Builder Roles)
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    isApprovalRequired
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}>
                    {isApprovalRequired ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span>ON (Approval Required)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>OFF (Auto-Approved)</span>
                      </>
                    )}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
                  Turn <strong>OFF</strong> to remove the "Requires Admin Approval / Pending" lock on Dealer & Builder accounts. All accounts will automatically have full approved access.
                </p>
              </div>
            </div>

            {/* Toggle Button */}
            <div className="flex items-center gap-3 self-start md:self-center">
              {updatingKey === "isApprovalRequired" && <Loader2 className="w-5 h-5 animate-spin text-green-600" />}
              <button
                disabled={updatingKey !== null}
                onClick={() => handleToggleSetting("isApprovalRequired", !isApprovalRequired)}
                className={`relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-300 focus:outline-none shadow-inner cursor-pointer ${
                  isApprovalRequired ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span className="sr-only">Toggle Admin Approval</span>
                <span
                  style={{ display: "flex" }}
                  className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center font-bold text-xs ${
                    isApprovalRequired ? "translate-x-13 text-blue-700" : "translate-x-1 text-gray-500"
                  }`}
                >
                  {isApprovalRequired ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          {/* Mode Descriptions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className={`p-5 rounded-2xl border transition-all ${
              isApprovalRequired
                ? "bg-blue-50/50 border-blue-200 ring-2 ring-blue-500/10"
                : "bg-gray-50 border-gray-200 opacity-60"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-blue-900 text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-600" />
                  <span>ON: Strict Admin Approval Mode</span>
                </h3>
                {isApprovalRequired && (
                  <span className="text-[10px] uppercase font-black tracking-wider bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Active</span>
                )}
              </div>
              <ul className="space-y-2 text-xs text-blue-950 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>New Builders & Dealers registered as "Pending".</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Admin must manually approve users from Users table.</span>
                </li>
              </ul>
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${
              !isApprovalRequired
                ? "bg-emerald-50/50 border-emerald-200 ring-2 ring-emerald-500/10"
                : "bg-gray-50 border-gray-200 opacity-60"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-emerald-900 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span>OFF: Auto-Approval Direct Access Mode</span>
                </h3>
                {!isApprovalRequired && (
                  <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">Active</span>
                )}
              </div>
              <ul className="space-y-2 text-xs text-emerald-950 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span><strong>Pending Lock Bypassed</strong>: Approval requirement removed.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>All Builders, Dealers & Owners get instant "Approved" access.</span>
                </li>
              </ul>
            </div>
          </div>

          {lastUpdated && (
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
              <span>Settings Status: <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">isPaymentEnabled, isApprovalRequired</code></span>
              <span>Last Modified: {new Date(lastUpdated).toLocaleString("en-IN")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
