"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  User,
  MapPin,
  Shield,
  Eye
} from "lucide-react";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const API =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    "/api/users";

  const MEDIA_API =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    "/api/media/upload";

  /* ================= FETCH USER ================= */
  useEffect(() => {
    fetch(`${API}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        const u = res.data;
        setUser({
          ...u,
          address: u.address || {},
          kyc: u.kyc || {},
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  /* ================= AVATAR UPLOAD ================= */
  const uploadAvatar = async (file) => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("files", file);

    try {
      const res = await fetch(MEDIA_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.data?.media?.length) {
        setUser((prev) => ({
          ...prev,
          avatar: data.data.media[0].url,
        }));
        toast.success("Avatar uploaded successfully!");
      } else {
        toast.error(data.message || "Avatar upload failed");
      }
    } catch (err) {
      toast.error("Avatar upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ================= SAVE USER ================= */
  const saveChanges = async () => {
    setSaving(true);

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (res.ok || data.success) {
        toast.success("User updated successfully!");
        setTimeout(() => {
          router.push(`/admin/users/${id}`);
        }, 800);
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE USER ================= */
  const deleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user account permanently?")) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok || data.success) {
        toast.success("User deleted successfully");
        router.push("/admin/users");
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#8c4bdc] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading user edit form...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 min-h-screen bg-slate-50/50">

      {/* ================= HEADER BAR ================= */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push(`/admin/users/${id}`)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/admin/users/${id}`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>View User</span>
          </button>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#8c4bdc] hover:bg-[#7b3ec5] text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* ================= BASIC INFO CARD ================= */}
      <Card title="Basic Information" icon={<User className="w-5 h-5 text-[#8c4bdc]" />}>
        <div className="flex flex-col sm:flex-row gap-6 mb-6 items-center">
          <div className="relative w-24 h-24 rounded-full bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-200 shadow-sm">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-2xl text-slate-400">
                {user.name?.[0] || "U"}
              </div>
            )}
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider">
              Profile Avatar
            </label>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl cursor-pointer shadow-sm transition">
              <Upload className="w-4 h-4 text-[#8c4bdc]" />
              <span>{uploading ? "Uploading..." : "Upload New Photo"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => uploadAvatar(e.target.files[0])}
              />
            </label>
            {uploading && <p className="text-xs text-[#8c4bdc] font-semibold">Uploading profile picture...</p>}
          </div>
        </div>

        <Grid>
          <Input
            label="Full Name"
            value={user.name || ""}
            onChange={(v) => setUser({ ...user, name: v })}
          />

          <Input label="Email Address" value={user.email} disabled />

          <Input
            label="Phone Number"
            value={user.phone || ""}
            onChange={(v) => setUser({ ...user, phone: v })}
          />

          <Select
            label="System Role"
            value={user.role || "user"}
            options={["user", "admin", "builder", "dealer", "owner"]}
            onChange={(v) => setUser({ ...user, role: v })}
          />

          <Select
            label="Account Status"
            value={user.isBlocked ? "Blocked" : "Active"}
            options={["Active", "Blocked"]}
            onChange={(v) =>
              setUser({ ...user, isBlocked: v === "Blocked" })
            }
          />

          <Select
            label="Verification Status"
            value={user.approvalStatus || "approved"}
            options={["approved", "pending", "rejected"]}
            onChange={(v) => setUser({ ...user, approvalStatus: v })}
          />
        </Grid>
      </Card>

      {/* ================= ADDRESS CARD ================= */}
      <Card title="Address Details" icon={<MapPin className="w-5 h-5 text-indigo-600" />}>
        <Grid>
          {[
            ["houseNo", "House / Flat No"],
            ["street", "Street"],
            ["locality", "Locality"],
            ["city", "City"],
            ["district", "District"],
            ["state", "State"],
            ["pincode", "Pincode"],
            ["country", "Country"],
          ].map(([k, label]) => (
            <Input
              key={k}
              label={label}
              value={user.address?.[k] || ""}
              onChange={(v) =>
                setUser({
                  ...user,
                  address: { ...user.address, [k]: v },
                })
              }
            />
          ))}
        </Grid>
      </Card>

      {/* ================= KYC CARD ================= */}
      <Card title="KYC Verification Info" icon={<Shield className="w-5 h-5 text-emerald-600" />}>
        <Grid cols={3}>
          <Input
            label="Aadhaar Number"
            value={user.kyc?.aadhaarNumber || ""}
            onChange={(v) =>
              setUser({ ...user, kyc: { ...user.kyc, aadhaarNumber: v } })
            }
          />

          <Input
            label="PAN Card Number"
            value={user.kyc?.panNumber || ""}
            onChange={(v) =>
              setUser({ ...user, kyc: { ...user.kyc, panNumber: v } })
            }
          />

          <Select
            label="KYC Verified Flag"
            value={user.kyc?.isVerified ? "Yes" : "No"}
            options={["Yes", "No"]}
            onChange={(v) =>
              setUser({
                ...user,
                kyc: { ...user.kyc, isVerified: v === "Yes" },
              })
            }
          />
        </Grid>
      </Card>

      {/* ================= BOTTOM ACTIONS ================= */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <button
          onClick={deleteUser}
          className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 text-rose-700 px-5 py-2.5 rounded-xl font-bold text-xs transition border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete User Account</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => router.push(`/admin/users/${id}`)}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full sm:w-auto bg-[#8c4bdc] hover:bg-[#7b3ec5] text-white px-6 py-2.5 rounded-xl font-bold text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Card({ title, icon, children }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        {icon}
        <h3 className="font-extrabold text-slate-900 text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Grid({ children, cols = 4 }) {
  const colsClass = cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4";
  return <div className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass} gap-4`}>{children}</div>;
}

function Input({ label, value, onChange, disabled }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <input
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] transition disabled:bg-slate-100 disabled:text-slate-500 font-medium"
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] transition font-medium capitalize"
      >
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
