"use client";

import { useEffect, useState, useCallback } from "react";
import UserTable from "../../components/admin/UserTable";
import Pagination from "../../components/admin/Pagination";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Building2,
  Briefcase,
  RefreshCw,
  Search,
  Users,
  UserCheck,
  UserX,
  X,
  Eye,
  Edit3,
  Filter,
  DollarSign,
  Crown,
  CreditCard,
  Calendar,
  RotateCcw,
  Sparkles,
  Layers,
  Receipt
} from "lucide-react";
import Link from "next/link";

const API =
  (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
  "/api/users";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pending'
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  // 🎯 Filters State
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [planStatusFilter, setPlanStatusFilter] = useState("");
  const [planNameFilter, setPlanNameFilter] = useState("");

  // 💰 Revenue & Subscription Stats State
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [planBreakdown, setPlanBreakdown] = useState([]);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);

  // 📜 Purchaser Modal State
  const [showPurchasersModal, setShowPurchasersModal] = useState(false);
  const [purchaserSearch, setPurchaserSearch] = useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  /* ================= FETCH ALL USERS ================= */
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "10");
      if (search) params.append("search", search);
      if (roleFilter && roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (approvalFilter && approvalFilter !== "all") params.append("approvalStatus", approvalFilter);
      if (planStatusFilter && planStatusFilter !== "all") params.append("planStatus", planStatusFilter);
      if (planNameFilter && planNameFilter !== "all") params.append("planName", planNameFilter);

      const res = await fetch(`${API}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const json = await res.json();

      if (json?.success) {
        setUsers(json?.data?.users || []);
        setTotalRevenue(json?.data?.totalRevenue || 0);
        setPlanBreakdown(json?.data?.planBreakdown || []);
        setAllSubscriptions(json?.data?.allSubscriptions || []);
        setAvailablePlans(json?.data?.availablePlans || []);
        setPagination(json?.data?.pagination || null);
      } else {
        setUsers([]);
        setPagination(null);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter, approvalFilter, planStatusFilter, planNameFilter, token]);

  /* ================= FETCH PENDING APPROVALS ================= */
  const fetchPendingApprovals = useCallback(async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch(`${API}/pending-approvals`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const json = await res.json();

      if (json?.success) {
        setPendingUsers(json?.data || []);
      } else {
        setPendingUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  useEffect(() => {
    if (activeTab === "all") {
      fetchUsers();
    } else {
      fetchPendingApprovals();
    }
  }, [activeTab, fetchUsers, fetchPendingApprovals]);

  /* ================= RESET ALL FILTERS ================= */
  const handleResetFilters = () => {
    setRoleFilter("");
    setStatusFilter("");
    setApprovalFilter("");
    setPlanStatusFilter("");
    setPlanNameFilter("");
    setSearch("");
    setPage(1);
  };

  /* ================= APPROVE USER ================= */
  const handleApprove = async (userId, name) => {
    if (!userId || !token) return;
    try {
      setApprovingId(userId);
      const res = await fetch(`${API}/${userId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json?.success) {
        toast.success(json?.message || `Approved ${name || "user"}`);
        fetchPendingApprovals();
        fetchUsers();
      } else {
        toast.error(json?.message || "Failed to approve user");
      }
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve user");
    } finally {
      setApprovingId(null);
    }
  };

  /* ================= REJECT USER ================= */
  const handleReject = async (userId, name) => {
    if (!userId || !token) return;
    const ok = confirm(`Reject verification for ${name || "this user"}?`);
    if (!ok) return;

    try {
      setApprovingId(userId);
      const res = await fetch(`${API}/${userId}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json?.success) {
        toast.success(json?.message || `Rejected ${name || "user"}`);
        fetchPendingApprovals();
        fetchUsers();
      } else {
        toast.error(json?.message || "Failed to reject user");
      }
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Failed to reject user");
    } finally {
      setApprovingId(null);
    }
  };

  /* ================= TOGGLE BLOCK USER ================= */
  const handleToggleBlock = async (userId, currentBlockedState, name) => {
    if (!userId || !token) return;
    const actionText = currentBlockedState ? "unblock" : "block";
    const ok = confirm(`Are you sure you want to ${actionText} user "${name || "User"}"?`);
    if (!ok) return;

    try {
      const res = await fetch(`${API}/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBlocked: !currentBlockedState }),
      });

      const json = await res.json();
      if (res.ok || json?.success) {
        toast.success(
          json?.message || `User "${name || "User"}" ${currentBlockedState ? "unblocked" : "blocked"} successfully`
        );
        if (activeTab === "all") fetchUsers();
        else fetchPendingApprovals();
      } else {
        toast.error(json?.message || `Failed to ${actionText} user`);
      }
    } catch (error) {
      console.error("Failed to toggle block:", error);
      toast.error(`Failed to ${actionText} user`);
    }
  };

  /* ================= DELETE USER ================= */
  const deleteUser = async (userId) => {
    if (!userId || !token) return;

    try {
      const res = await fetch(`${API}/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (res.ok || json?.success) {
        toast.success(json?.message || "User deleted successfully");
        if (activeTab === "all") fetchUsers();
        else fetchPendingApprovals();
      } else {
        toast.error(json?.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  // Stats calculation
  const totalCount = pagination?.total || users.length;
  const activeCount = users.filter((u) => !u.isBlocked).length;
  const blockedCount = users.filter((u) => u.isBlocked).length;

  const hasActiveFilters = Boolean(
    roleFilter || statusFilter || approvalFilter || planStatusFilter || planNameFilter || search
  );

  const allPlanNames = Array.from(
    new Set([
      ...availablePlans.map((p) => p.name),
      ...planBreakdown.map((p) => p.planName),
    ])
  ).filter(Boolean);

  const filteredPurchasers = allSubscriptions.filter((sub) => {
    if (!purchaserSearch) return true;
    const q = purchaserSearch.toLowerCase();
    const uName = sub.userId?.name?.toLowerCase() || "";
    const uEmail = sub.userId?.email?.toLowerCase() || "";
    const uPhone = sub.userId?.phone || "";
    const pName = sub.planName?.toLowerCase() || "";
    const inv = sub.invoiceNumber?.toLowerCase() || "";
    return uName.includes(q) || uEmail.includes(q) || uPhone.includes(q) || pName.includes(q) || inv.includes(q);
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-slate-50/50 min-h-screen">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-[#8c4bdc] text-xs font-extrabold uppercase tracking-widest mb-1">
            <Users className="w-4 h-4" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Management, Plans & Revenue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Filter users by role, verification, plan status, track total membership revenue, and view purchaser details.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-[#8c4bdc] shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "pending"
                ? "bg-[#8c4bdc] text-white shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Pending Verification</span>
            {pendingUsers.length > 0 && (
              <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black">
                {pendingUsers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= REVENUE & MEMBERSHIP SUMMARY HERO ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TOTAL REVENUE HERO CARD */}
        <div className="bg-gradient-to-br from-[#6b21a8] via-[#8c4bdc] to-indigo-900 p-6 rounded-3xl text-white shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-purple-200 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                Plan Membership Revenue
              </span>
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div className="mt-4">
              <p className="text-xs text-purple-200 font-semibold">Total Revenue Earned</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mt-1 text-white">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </h2>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-purple-200 font-medium">
              {allSubscriptions.length} Plan Purchases Recorded
            </span>
            <button
              onClick={() => setShowPurchasersModal(true)}
              className="bg-white/20 hover:bg-white text-white hover:text-[#8c4bdc] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Receipt className="w-4 h-4" />
              <span>Purchaser Details</span>
            </button>
          </div>
        </div>

        {/* PLAN REVENUE & SUBSCRIBER BREAKDOWN CARDS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8c4bdc]" />
              <span>Membership Plans Breakdown</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {planBreakdown.length} Plan Types Active
            </span>
          </div>

          {planBreakdown.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-medium">
              No plan purchases recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {planBreakdown.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPlanNameFilter(p.planName);
                    setPage(1);
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                    planNameFilter === p.planName
                      ? "bg-purple-50 border-[#8c4bdc] ring-2 ring-[#8c4bdc]/20"
                      : "bg-slate-50/70 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900 text-xs truncate">
                      👑 {p.planName}
                    </span>
                    <span className="text-[10px] font-bold bg-purple-100 text-[#8c4bdc] px-2 py-0.5 rounded-full">
                      {p.activeSubscribers} Active
                    </span>
                  </div>
                  <p className="text-base font-black text-[#8c4bdc]">
                    ₹{p.totalRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {p.totalPurchases} Total Purchases
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= STATS SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#8c4bdc] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Total Registered</p>
            <p className="text-xl font-black text-slate-900">{totalCount || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Active Accounts</p>
            <p className="text-xl font-black text-emerald-600">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Pending Approval</p>
            <p className="text-xl font-black text-amber-600">{pendingUsers.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold">Blocked Users</p>
            <p className="text-xl font-black text-rose-600">{blockedCount}</p>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: ALL USERS ================= */}
      {activeTab === "all" && (
        <div className="space-y-4">

          {/* ================= MULTI-FILTER CONTROL BAR ================= */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Filter className="w-4 h-4 text-[#8c4bdc]" />
                <span>Filter User Accounts</span>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {/* FILTER DROPDOWNS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              
              {/* 1. ROLE FILTER */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  User Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc]"
                >
                  <option value="">All Roles</option>
                  <option value="user">Normal User</option>
                  <option value="owner">Property Owner</option>
                  <option value="dealer">Dealer / Agent</option>
                  <option value="builder">Builder</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* 2. ACCOUNT STATUS FILTER */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Account Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc]"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="blocked">Blocked Only</option>
                </select>
              </div>

              {/* 3. VERIFICATION / APPROVAL STATUS FILTER */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Verification Status
                </label>
                <select
                  value={approvalFilter}
                  onChange={(e) => {
                    setApprovalFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc]"
                >
                  <option value="">All Approvals</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending Review</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* 4. PLAN STATUS FILTER */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Plan Active Status
                </label>
                <select
                  value={planStatusFilter}
                  onChange={(e) => {
                    setPlanStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc]"
                >
                  <option value="">All Plan Statuses</option>
                  <option value="active">Has Active Plan</option>
                  <option value="expired">Has Expired Plan</option>
                  <option value="none">No Active Plan</option>
                </select>
              </div>

              {/* 5. SPECIFIC PLAN NAME FILTER */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Specific Plan
                </label>
                <select
                  value={planNameFilter}
                  onChange={(e) => {
                    setPlanNameFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc]"
                >
                  <option value="">All Membership Plans</option>
                  {allPlanNames.map((name, idx) => (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* SEARCH AND REFRESH ROW */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80 md:w-96">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search by name, email, or mobile..."
                  className="border border-slate-200 pl-10 pr-9 py-2.5 rounded-xl w-full text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] transition"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={fetchUsers}
                  className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition flex items-center gap-2 text-xs font-bold cursor-pointer"
                  title="Refresh user list"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

          </div>

          {loading ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-medium space-y-3">
              <RefreshCw className="w-8 h-8 text-[#8c4bdc] animate-spin mx-auto" />
              <p className="text-sm font-semibold">Loading users list...</p>
            </div>
          ) : (
            <UserTable
              users={users}
              onDelete={deleteUser}
              onApprove={handleApprove}
              onReject={handleReject}
              onToggleBlock={handleToggleBlock}
            />
          )}

          {pagination?.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* ================= TAB 2: PENDING APPROVALS ================= */}
      {activeTab === "pending" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Pending Builder & Dealer Verification Requests</span>
            </h2>
            <button
              onClick={fetchPendingApprovals}
              className="p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh List</span>
            </button>
          </div>

          {loading ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-medium space-y-3">
              <RefreshCw className="w-8 h-8 text-[#8c4bdc] animate-spin mx-auto" />
              <p className="text-sm font-semibold">Loading pending applications…</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-extrabold text-slate-900">All Verification Requests Handled!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are currently no pending builder or dealer verification applications awaiting your approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingUsers.map((u) => (
                <div
                  key={u._id}
                  className="bg-white rounded-3xl p-6 border-2 border-amber-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                          {u.role === "builder" ? <Building2 className="w-5 h-5 text-indigo-700" /> : <Briefcase className="w-5 h-5 text-amber-700" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{u.name || "N/A"}</h3>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase">
                        {u.role} (Pending)
                      </span>
                    </div>

                    {/* Quick View & Edit Links */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users/${u._id}`}
                        className="text-xs text-[#8c4bdc] font-bold hover:underline flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Profile</span>
                      </Link>
                      <Link
                        href={`/admin/users/${u._id}/edit`}
                        className="text-xs text-slate-600 font-bold hover:underline flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit User</span>
                      </Link>
                    </div>

                    {/* Details Box */}
                    {u.role === "builder" && u.builderDetails && (
                      <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1.5 text-slate-700 border border-slate-100">
                        <p><strong>Firm Name:</strong> {u.builderDetails.firmName || "N/A"}</p>
                        <p><strong>RERA Number:</strong> {u.builderDetails.reraNumber || "N/A"}</p>
                        <p><strong>GST Number:</strong> {u.builderDetails.gstNumber || "N/A"}</p>
                        <p><strong>PAN Card:</strong> {u.builderDetails.panNumber || "N/A"}</p>
                        <p><strong>Aadhaar:</strong> {u.builderDetails.aadhaarNumber || "N/A"}</p>
                        <p><strong>Office Address:</strong> {u.builderDetails.officeAddress || "N/A"}</p>
                        <p><strong>Completed Projects:</strong> {u.builderDetails.completedProjectsCount || 0}</p>
                      </div>
                    )}

                    {u.role === "dealer" && u.dealerDetails && (
                      <div className="bg-slate-50 p-4 rounded-2xl text-xs space-y-1.5 text-slate-700 border border-slate-100">
                        <p><strong>Agency Name:</strong> {u.dealerDetails.agencyName || "N/A"}</p>
                        <p><strong>License Number:</strong> {u.dealerDetails.licenseNumber || "N/A"}</p>
                        <p><strong>GST Number:</strong> {u.dealerDetails.gstNumber || "N/A"}</p>
                        <p><strong>PAN Card:</strong> {u.dealerDetails.panNumber || "N/A"}</p>
                        <p><strong>Aadhaar:</strong> {u.dealerDetails.aadhaarNumber || "N/A"}</p>
                        <p><strong>Operating Areas:</strong> {u.dealerDetails.operatingAreas || "N/A"}</p>
                        <p><strong>Experience:</strong> {u.dealerDetails.experienceYears || 0} Years</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleApprove(u._id, u.name)}
                      disabled={approvingId === u._id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-xs transition shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Account</span>
                    </button>
                    <button
                      onClick={() => handleReject(u._id, u.name)}
                      disabled={approvingId === u._id}
                      className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= PLAN PURCHASERS MODAL ================= */}
      {showPurchasersModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-100">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#8c4bdc]" />
                  <span>Membership Plan Purchasers</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed breakdown of users who bought membership plans, amount paid, and invoice info.
                </p>
              </div>
              <button
                onClick={() => setShowPurchasersModal(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter in modal */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Filter purchasers by user name, email, plan name, or invoice..."
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc]"
                  value={purchaserSearch}
                  onChange={(e) => setPurchaserSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Body Table */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {filteredPurchasers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No purchaser records found.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500 font-extrabold">
                      <tr>
                        <th className="px-4 py-3">Purchaser Info</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Plan Bought</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Purchase & Expiry</th>
                        <th className="px-4 py-3">Invoice & ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredPurchasers.map((sub, idx) => {
                        const isSubActive = sub.status === "active" && new Date(sub.expiryDate) > new Date();
                        const u = sub.userId;

                        return (
                          <tr key={sub._id || idx} className="hover:bg-slate-50/80 transition">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              <div>
                                <p className="font-bold text-slate-900">{u?.name || "User"}</p>
                                <p className="text-[11px] text-slate-500">{u?.email || "—"}</p>
                                <p className="text-[10px] text-slate-400">{u?.phone || ""}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {sub.role || u?.role || "User"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                  isSubActive
                                    ? "bg-purple-100 text-[#8c4bdc]"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {isSubActive ? "👑" : "⌛"} {sub.planName}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-black text-slate-900">
                              {sub.amount > 0 ? `₹${sub.amount.toLocaleString("en-IN")}` : "Free"}
                            </td>
                            <td className="px-4 py-3 text-slate-600 text-[11px]">
                              <p>Start: {new Date(sub.startDate).toLocaleDateString("en-IN")}</p>
                              <p className={isSubActive ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                                Exp: {new Date(sub.expiryDate).toLocaleDateString("en-IN")}
                              </p>
                            </td>
                            <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                              <p className="font-bold text-slate-700">{sub.invoiceNumber || "N/A"}</p>
                              <p>{sub.paymentId || sub.razorpayPaymentId || "—"}</p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowPurchasersModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
