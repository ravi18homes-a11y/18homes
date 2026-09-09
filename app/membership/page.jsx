"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../COMMON/Navbar";
import Footer from "../COMMON/Footer";
import {
  Shield,
  Check,
  X,
  Lock,
  Sparkles,
  CreditCard,
  Calendar,
  Hourglass,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function StandaloneMembershipPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [payingPlanId, setPayingPlanId] = useState(null);
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(true);

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  // Load Razorpay Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchData = async () => {
    try {
      // Fetch system payment mode
      try {
        const settingRes = await fetch(`${databaseUrl}/api/settings/payment-mode`);
        if (settingRes.ok) {
          const settingData = await settingRes.json();
          if (settingData.success && settingData.data) {
            setIsPaymentEnabled(settingData.data.isPaymentEnabled);
          }
        }
      } catch (err) {
        console.error("Error fetching payment mode:", err);
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        // Fetch plans publicly even if not logged in
        const plansRes = await fetch(`${databaseUrl}/api/subscriptions/plans`);
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          if (plansData.success) {
            setPlans(plansData.data);
          }
        }
        setLoading(false);
        return;
      }

      // 1. Fetch current subscription and usage stats
      const subRes = await fetch(`${databaseUrl}/api/subscriptions/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.success) {
          setCurrentSub(subData.data);
        }
      }

      // 2. Fetch plans
      const plansRes = await fetch(`${databaseUrl}/api/subscriptions/plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        if (plansData.success) {
          setPlans(plansData.data);
        }
      }

      // 3. Fetch payment history
      const historyRes = await fetch(`${databaseUrl}/api/subscriptions/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (historyData.success) {
          setPaymentHistory(historyData.data);
        }
      }
    } catch (err) {
      console.error("Error fetching subscription data:", err);
      toast.error("Failed to load membership data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem("userData");
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
    fetchData();
  }, []);

  const handlePurchase = async (plan) => {
    if (!isPaymentEnabled) {
      toast.success("Free Direct Access Mode is Active! All premium features are unlocked for free.");
      return;
    }

    if (plan.price === 0) {
      toast.info("Free plan is active by default.");
      return;
    }

    setPayingPlanId(plan._id);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in to make a purchase");
        return;
      }

      // Load Razorpay checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay SDK. Check your internet connection.");
        return;
      }

      // Create Razorpay order on backend
      const orderRes = await fetch(`${databaseUrl}/api/subscriptions/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planId: plan._id })
      });
      
      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      const { orderId, amount, currency, keyId } = orderData.data;

      // Initialize Razorpay checkout modal
      const options = {
        key: keyId,
        amount,
        currency,
        name: "18Homes Platform",
        description: `Upgrade Plan - ${plan.name} (${plan.role})`,
        order_id: orderId,
        handler: async function (response) {
          toast.loading("Verifying transaction...", { id: "payment-verify" });
          try {
            const verifyRes = await fetch(`${databaseUrl}/api/subscriptions/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan._id
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success("Membership activated successfully! Welcome to premium.", { id: "payment-verify" });
              
              // Trigger profile updates
              const profileRes = await fetch(`${databaseUrl}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (profileRes.ok) {
                const freshProfile = await profileRes.json();
                if (freshProfile.success) {
                  localStorage.setItem("userData", JSON.stringify(freshProfile.data));
                  setUser(freshProfile.data);
                  window.dispatchEvent(new Event("storage"));
                }
              }
              fetchData();
            } else {
              toast.error(verifyData.message || "Signature verification failed", { id: "payment-verify" });
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Error verifying payment signature", { id: "payment-verify" });
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: {
          color: "#8c4bdc"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Purchase initiation error:", err);
      toast.error(err.message || "Failed to initiate payment");
    } finally {
      setPayingPlanId(null);
    }
  };

  const userRole = user?.role || "dealer";
  const matchedRole = ["builder", "dealer"].includes(userRole) ? userRole : "dealer";
  const filteredPlans = plans.filter((p) => p.role === matchedRole);

  const getPlanIcon = (name) => {
    switch (name) {
      case "Free":
        return "🌱";
      case "Gold":
        return "⭐";
      case "Platinum":
        return "💎";
      case "Diamond":
        return "👑";
      default:
        return "🎗️";
    }
  };

  const renderCellStatus = (included, valueText) => {
    if (included === true || (typeof included === "number" && included !== 0)) {
      return (
        <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-bold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{valueText || "Included"}</span>
        </div>
      );
    } else if (included === false || included === 0) {
      return (
        <div className="flex items-center justify-center gap-1.5 text-slate-400 font-semibold">
          <X className="w-4 h-4 text-slate-300" />
          <span>Not Included</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center gap-1.5 text-amber-600 font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>{valueText || "Locked"}</span>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4 flex-grow">
          <Loader2 className="w-10 h-10 text-[#8c4bdc] animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading plan configuration...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPlanName = currentSub?.planName || "Free";
  const remainingDays = currentSub?.remainingDays || 0;
  const usageStats = currentSub?.usage || { propertiesCount: 0, projectsCount: 0, featuredAdsCount: 0 };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow max-w-7xl mt-[80px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        
        {/* FREE ACCESS MODE ALERT BANNER */}
        {!isPaymentEnabled && (
          <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-lg border border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black">Free Direct Access Mode Active! 🎉</h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Payment system is currently turned OFF by Admin. You do not need to buy any plan! All property listings, project posts, boosts, and leads are <strong>100% FREE</strong> for all user roles.
                </p>
              </div>
            </div>
            <span className="bg-white text-emerald-800 font-extrabold text-xs px-4 py-2 rounded-xl whitespace-nowrap shadow-sm">
              Unlimited Access Unlocked
            </span>
          </div>
        )}

        {/* TOP BANNER / ACCOUNT SUMMARY CARD */}
        {user && (user.role === "admin" || user.role === "super_admin") ? (
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-purple-500/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <span className="bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  👑 Administrator Full Access
                </span>
                <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                  <span>Membership Status:</span>
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-extrabold">
                    Admin Unlimited (No Plan Required)
                  </span>
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                  As an Administrator, you have complete unlimited permissions across the platform. You do not require any paid subscription plan to list properties, projects, view client leads, or run featured ads.
                </p>
              </div>

              <div className="bg-emerald-500/20 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/30 flex items-center gap-5 w-full lg:w-auto">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider block">Full Privilege</span>
                  <h4 className="text-base font-black text-white">Unlimited Access Active</h4>
                  <p className="text-[10px] text-emerald-200 mt-0.5">No expiry • Lifetime Admin Access</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-6 relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Properties Listed</span>
                <span className="text-lg font-black text-white">{usageStats.propertiesCount} (Unlimited)</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Projects Created</span>
                <span className="text-lg font-black text-white">{usageStats.projectsCount} (Unlimited)</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Featured Ads</span>
                <span className="text-lg font-black text-white">{usageStats.featuredAdsCount} (Unlimited)</span>
              </div>
            </div>
          </div>
        ) : user && ["builder", "dealer"].includes(user.role) ? (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <span className="bg-purple-500/20 border border-purple-400/30 text-purple-200 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  Account Level Summary
                </span>
                <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                  <span>Current Membership:</span>
                  <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent font-extrabold">
                    {currentPlanName} Plan
                  </span>
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                  Manage your subscription level and listing resources. Note: Dealers and Builders must buy a paid plan to publish listings and access the dashboard features.
                </p>
              </div>

              {currentPlanName !== "Free" && currentSub?.subscription ? (
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 flex items-center gap-5 w-full lg:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Hourglass className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-300">Remaining Period:</span>
                      <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                    <h4 className="text-lg font-black">{remainingDays} Days Left</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Renews: {new Date(currentSub.subscription.expiryDate).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-500/20 backdrop-blur-md p-5 rounded-2xl border border-amber-500/30 flex items-center gap-5 w-full lg:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">Gating Restricting Access</span>
                    <h4 className="text-base font-black text-white">Default Free Plan (Inactive)</h4>
                    <p className="text-[10px] text-amber-200 mt-0.5">Upgrade to unlock your dashboard and list properties.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick usage counters */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Properties Listed</span>
                <span className="text-lg font-black text-white">{usageStats.propertiesCount} Active Listings</span>
              </div>
              {matchedRole === "builder" && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Projects Created</span>
                  <span className="text-lg font-black text-white">{usageStats.projectsCount} Active Projects</span>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Featured Ads</span>
                <span className="text-lg font-black text-white">{usageStats.featuredAdsCount} Active Ads</span>
              </div>
            </div>
          </div>
        ) : !user ? (
          /* Public Header Banner for Guest Users */
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <span className="bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">
                Professional Memberships
              </span>
              <h1 className="text-3xl sm:text-5xl font-black">
                Unlock Premium Listing Power
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Post high-performing listings, track visitor metrics, switch roles, and capture client inquiries directly with our customized SaaS subscriptions.
              </p>
              <div className="pt-4">
                <Link
                  href="/login-signup"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8c4bdc] to-[#c04b7e] hover:from-[#7b3ac5] hover:to-[#ae3a6d] text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg"
                >
                  <span>Sign In / Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* PRICING CARDS */}
        <div>
          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3.5 py-1 rounded-full">
              SaaS Packages
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Select Your Membership Plan
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              {user ? (
                <>Pricing customized for <span className="font-bold text-indigo-600 capitalize">{matchedRole}s</span>. Unlock your account features.</>
              ) : (
                <>Upgrade to standard professional packages for Builders & Dealers.</>
              )}
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(filteredPlans.length > 0 ? filteredPlans : plans.filter(p => p.role === "dealer")).map((plan) => {
              const isCurrent = user && currentPlanName.toLowerCase() === plan.name.toLowerCase();
              const isFree = plan.price === 0;
              const isDiamond = plan.name.toLowerCase() === "diamond";
              const isPopular = plan.name.toLowerCase() === "platinum";

              return (
                <div
                  key={plan._id}
                  className={`bg-white rounded-3xl p-6 border-2 transition-all flex flex-col justify-between relative hover:shadow-xl ${
                    isCurrent
                      ? "border-purple-600 shadow-md ring-2 ring-purple-600/10 bg-purple-50/5"
                      : "border-slate-200"
                  } ${isPopular ? "scale-[1.02] border-indigo-400 shadow-lg shadow-indigo-50" : ""}`}
                >
                  {isPopular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow">
                      Most Popular Plan
                    </span>
                  )}

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{getPlanIcon(plan.name)}</span>
                      {isCurrent && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Active Plan
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">For professional {plan.role}s</p>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2">
                      <span className="text-3xl font-black text-slate-900 font-sans">
                        ₹{plan.price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400 font-medium"> / month</span>
                    </div>

                    {/* Features List Mini */}
                    <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                      {/* Explicit "Includes Free" note */}
                      {!isFree && (
                        <div className="flex items-center gap-2 text-indigo-700 font-bold bg-indigo-50/50 p-2 rounded-xl border border-indigo-100/50 mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span>Includes all Free tier benefits</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Property Limit: <strong className="text-slate-900">{plan.propertyLimit}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Edit Duration: <strong className="text-slate-900">{plan.editDays === -1 ? "Unlimited" : `${plan.editDays} Days`}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Boost Discount: <strong className="text-slate-900">{plan.boostDiscount}% Off</strong></span>
                      </div>
                      {plan.role !== "dealer" && (
                        <div className="flex items-center gap-2">
                          {plan.projectLimit > 0 ? (
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
                          )}
                          <span className={plan.projectLimit > 0 ? "text-slate-600" : "text-slate-400"}>
                            Projects: <strong className={plan.projectLimit > 0 ? "text-slate-900" : "text-slate-400"}>{plan.projectLimit > 0 ? plan.projectLimit : "None"}</strong>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {plan.featuredAd ? (
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 flex-shrink-0" />
                        )}
                        <span className={plan.featuredAd ? "text-slate-600" : "text-slate-400"}>
                          Featured Ad Campaigns
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    {user && (user.role === "admin" || user.role === "super_admin") ? (
                      <button
                        disabled
                        className="w-full bg-purple-100 text-purple-800 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-default flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Admin Access Active</span>
                      </button>
                    ) : !user ? (
                      <Link
                        href="/login-signup"
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Sign In to Buy</span>
                      </Link>
                    ) : isCurrent ? (
                      <button
                        disabled
                        className="w-full bg-slate-100 text-slate-500 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-default flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Current Plan</span>
                      </button>
                    ) : isFree ? (
                      <button
                        disabled
                        className="w-full bg-slate-100 text-slate-500 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-default"
                      >
                        Default Tier
                      </button>
                    ) : !isPaymentEnabled ? (
                      <button
                        disabled
                        className="w-full bg-emerald-100 text-emerald-800 py-3 rounded-2xl text-xs font-black uppercase tracking-wider cursor-default flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Free Access Active</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(plan)}
                        disabled={payingPlanId !== null}
                        className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm ${
                          isDiamond
                            ? "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold"
                            : "bg-slate-900 hover:bg-slate-800 text-white font-bold"
                        }`}
                      >
                        {payingPlanId === plan._id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            <span>{plan.price > 0 ? "Upgrade Now" : "Select Plan"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DETAILED COMPARISON TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden pt-6">
          <div className="px-6 pb-6">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Detailed Feature Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare features across plan tiers. Inclusions, caps, and locks.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-extrabold text-slate-500">
                  <th className="py-4 px-6 text-left w-1/4">Key Features</th>
                  <th className="py-4 px-6">Free Plan</th>
                  <th className="py-4 px-6">Gold Plan</th>
                  <th className="py-4 px-6">Platinum Plan</th>
                  <th className="py-4 px-6">Diamond Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {/* Property Limits */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 text-left font-semibold text-slate-700">Property Upload Limits</td>
                  <td className="py-4 px-6 text-slate-800">1 Monthly</td>
                  <td className="py-4 px-6 text-slate-800 font-bold">{matchedRole === "builder" ? 5 : 3} Active</td>
                  <td className="py-4 px-6 text-slate-800 font-bold">{matchedRole === "builder" ? 7 : 5} Active</td>
                  <td className="py-4 px-6 text-slate-800 font-bold">20 Active</td>
                </tr>

                {/* Edit Window */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 text-left font-semibold text-slate-700">Edit Time Limit</td>
                  <td className="py-4 px-6 text-slate-800">24 Hours</td>
                  <td className="py-4 px-6 text-slate-800 font-bold">{matchedRole === "builder" ? 3 : 2} Days</td>
                  <td className="py-4 px-6 text-slate-800 font-bold">{matchedRole === "builder" ? 5 : 4} Days</td>
                  <td className="py-4 px-6 text-slate-800 font-bold flex items-center justify-center gap-1"><Sparkles className="w-3.5 h-3.5 text-amber-500" /> Unlimited</td>
                </tr>

                {/* Boost Discount */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 text-left font-semibold text-slate-700">Boost Campaign Discount</td>
                  <td className="py-4 px-6">{renderCellStatus(false)}</td>
                  <td className="py-4 px-6">{renderCellStatus(true, matchedRole === "builder" ? "10% Discount" : "5% Discount")}</td>
                  <td className="py-4 px-6">{renderCellStatus(true, matchedRole === "builder" ? "20% Discount" : "15% Discount")}</td>
                  <td className="py-4 px-6">{renderCellStatus(true, "30% Discount")}</td>
                </tr>

                {/* Analytics */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 text-left font-semibold text-slate-700">Analytics Tabs</td>
                  <td className="py-4 px-6">{renderCellStatus(1, "Basic (1 Tab)")}</td>
                  <td className="py-4 px-6">{renderCellStatus(3, "3 Tabs Unlocked")}</td>
                  <td className="py-4 px-6">{renderCellStatus(5, "5 Tabs Unlocked")}</td>
                  <td className="py-4 px-6">{renderCellStatus(7, "Full Access (7 Tabs)")}</td>
                </tr>

                {/* Lead Access */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 text-left font-semibold text-slate-700">Client CRM Lead Limit</td>
                  <td className="py-4 px-6">{renderCellStatus("locked", "Basic Visibility (Masked)")}</td>
                  <td className="py-4 px-6">{renderCellStatus(true, matchedRole === "builder" ? "10 Leads (Full)" : "7 Leads (Full)")}</td>
                  <td className="py-4 px-6">{renderCellStatus(true, matchedRole === "builder" ? "20 Leads (Full)" : "15 Leads (Full)")}</td>
                  <td className="py-4 px-6">{renderCellStatus(true, "Unlimited (Full)")}</td>
                </tr>

                {/* Projects */}
                {matchedRole !== "dealer" && (
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 text-left font-semibold text-slate-700">Project Upload Limit</td>
                    <td className="py-4 px-6">{renderCellStatus(false)}</td>
                    <td className="py-4 px-6">{renderCellStatus(matchedRole === "builder", matchedRole === "builder" ? "1 Project" : "Not Available")}</td>
                    <td className="py-4 px-6">{renderCellStatus(matchedRole === "builder", matchedRole === "builder" ? "3 Projects" : "Not Available")}</td>
                    <td className="py-4 px-6">{renderCellStatus(matchedRole === "builder", matchedRole === "builder" ? "5 Projects" : "Not Available")}</td>
                  </tr>
                )}

                {/* Featured Ad */}
                <tr className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 text-left font-semibold text-slate-700">Featured Ad Campaigns</td>
                  <td className="py-4 px-6">{renderCellStatus(false)}</td>
                  <td className="py-4 px-6">{renderCellStatus(false)}</td>
                  <td className="py-4 px-6">{renderCellStatus(false)}</td>
                  <td className="py-4 px-6">{renderCellStatus(true, "1 Campaign Active")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* BILLING & PAYMENT HISTORY TABLE (Only visible if logged in) */}
        {user && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Invoice Billing & Payment History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Access your transaction receipts, invoice numbers, and payment details.
              </p>
            </div>

            <div className="overflow-x-auto">
              {paymentHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm mb-0.5">
                    No Invoices Found
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When you purchase or renew a subscription plan, your billing receipts will appear here.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
                      <th className="py-3.5 px-6">Invoice Number</th>
                      <th className="py-3.5 px-6">Plan Name</th>
                      <th className="py-3.5 px-6">Price</th>
                      <th className="py-3.5 px-6">Payment Status</th>
                      <th className="py-3.5 px-6">Transaction Date</th>
                      <th className="py-3.5 px-6 text-right">Gateway</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paymentHistory.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-1">
                          <span>{item.invoiceNumber || "INV-N/A"}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-700 font-semibold">
                          {item.plan} Plan
                        </td>
                        <td className="py-4 px-6 text-slate-900 font-bold font-sans">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-[9px] uppercase px-2 py-0.5 rounded-md ${
                              item.paymentStatus === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : item.paymentStatus === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.paymentStatus === "completed" && <Check className="w-2.5 h-2.5" />}
                            {item.paymentStatus === "pending" && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
                            {item.paymentStatus === "failed" && <AlertCircle className="w-2.5 h-2.5" />}
                            <span>{item.paymentStatus}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-medium">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="py-4 px-6 text-right text-slate-500 capitalize font-medium">
                          {item.gateway}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
