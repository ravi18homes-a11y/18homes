"use client";

import Link from "next/link";
import { Eye, Edit3, Ban, ShieldCheck, Trash2, Check, X, User } from "lucide-react";

export default function UserTable({
  users = [],
  onDelete,
  onApprove,
  onReject,
  onToggleBlock,
}) {
  /* ================= GUARDS ================= */
  if (!Array.isArray(users)) {
    return (
      <div className="p-8 text-center text-rose-500 font-semibold bg-rose-50 rounded-2xl border border-rose-200">
        Invalid users data format
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-semibold text-slate-700">No users found</p>
        <p className="text-xs text-slate-400 mt-1">Try refining your search or filter criteria.</p>
      </div>
    );
  }

  /* ================= DELETE HANDLER ================= */
  const handleDelete = (id, name) => {
    const ok = confirm(`Are you sure you want to delete user "${name || "User"}"?`);
    if (!ok) return;
    onDelete?.(id);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-slate-200">
      <table className="w-full border-collapse text-left">
        <thead className="bg-slate-50/80 border-b border-slate-200">
          <tr>
            <Th>#</Th>
            <Th>User Info</Th>
            <Th>Contact</Th>
            <Th>Role</Th>
            <Th>Rating</Th>
            <Th>Verification</Th>
            <Th>Plan & Subscription</Th>
            <Th>Account Status</Th>
            <Th className="text-right pr-6">Actions</Th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {users.map((u, index) => {
            const isBlocked = u?.isBlocked;
            const sub = u?.subscription;
            const isSubActive = sub?.status === "active" && new Date(sub?.expiryDate) > new Date();

            return (
              <tr
                key={u?._id || index}
                className="hover:bg-slate-50/70 transition duration-150 group"
              >
                {/* ===== SERIAL NUMBER ===== */}
                <Td className="font-bold text-slate-400 text-xs">
                  {index + 1}
                </Td>

                {/* ===== USER INFO ===== */}
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={u?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || "User")}&background=8c4bdc&color=fff`}
                        alt={u?.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          isBlocked ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-[#8c4bdc] transition">
                        {u?.name || "—"}
                      </p>
                      <p className="text-xs text-slate-500">{u?.email || "—"}</p>
                    </div>
                  </div>
                </Td>

                {/* ===== CONTACT ===== */}
                <Td className="text-slate-600 font-medium text-xs">
                  {u?.phone || "—"}
                </Td>

                {/* ===== ROLE ===== */}
                <Td>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      u?.role === "admin"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : u?.role === "builder"
                        ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                        : u?.role === "dealer"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : u?.role === "owner"
                        ? "bg-teal-100 text-teal-800 border border-teal-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {u?.role || "user"}
                  </span>
                </Td>

                {/* ===== SELLER / USER RATING ===== */}
                <Td>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1">
                    <span className="text-amber-500 font-extrabold text-xs">★</span>
                    <span>{Number(u?.averageRating !== undefined ? u.averageRating : 5.0).toFixed(1)}</span>
                    {u?.totalRatings > 0 && (
                      <span className="text-[10px] text-amber-600 font-normal">({u.totalRatings})</span>
                    )}
                  </span>
                </Td>

                {/* ===== APPROVAL / VERIFICATION STATUS ===== */}
                <Td>
                  {u?.approvalStatus === "approved" ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Approved
                    </span>
                  ) : u?.approvalStatus === "pending" ? (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Pending Review
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Rejected
                    </span>
                  )}
                </Td>

                {/* ===== PLAN & SUBSCRIPTION ===== */}
                <Td>
                  {sub ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 ${
                            isSubActive
                              ? "bg-purple-100 text-[#8c4bdc] border border-purple-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isSubActive ? "👑" : "⌛"} {sub.planName || "Plan"}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {sub.amount > 0 ? `₹${sub.amount.toLocaleString("en-IN")}` : "Free"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {isSubActive
                          ? `Expires: ${new Date(sub.expiryDate).toLocaleDateString("en-IN")}`
                          : "Expired / Ended"}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
                      No Active Plan
                    </span>
                  )}
                </Td>

                {/* ===== ACCOUNT STATUS ===== */}
                <Td>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 ${
                      isBlocked
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {isBlocked ? "Blocked" : "Active"}
                  </span>
                </Td>

                {/* ===== ACTIONS ===== */}
                <Td className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* VIEW BUTTON */}
                    <Link
                      href={`/admin/users/${u?._id}`}
                      className="p-2 text-slate-600 hover:text-[#8c4bdc] hover:bg-[#8c4bdc]/10 rounded-xl transition cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* EDIT BUTTON */}
                    <Link
                      href={`/admin/users/${u?._id}/edit`}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                      title="Edit User"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>

                    {/* BLOCK / UNBLOCK TOGGLE BUTTON */}
                    <button
                      onClick={() => onToggleBlock?.(u?._id, u?.isBlocked, u?.name)}
                      className={`p-2 rounded-xl transition cursor-pointer ${
                        isBlocked
                          ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          : "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                      }`}
                      title={isBlocked ? "Unblock Account" : "Block Account"}
                    >
                      {isBlocked ? (
                        <ShieldCheck className="w-4 h-4" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                    </button>

                    {/* APPROVE / REJECT FOR PENDING USERS */}
                    {u?.approvalStatus === "pending" && (
                      <>
                        <button
                          onClick={() => onApprove?.(u?._id, u?.name)}
                          className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl transition cursor-pointer"
                          title="Approve Account"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReject?.(u?._id, u?.name)}
                          className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition cursor-pointer"
                          title="Reject Account"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => handleDelete(u?._id, u?.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

const Th = ({ children, className = "" }) => (
  <th className={`px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 ${className}`}>
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3.5 text-sm ${className}`}>
    {children}
  </td>
);
