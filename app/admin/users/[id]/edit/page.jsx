"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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
      });
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
        toast.success("User updated successfully");
        setTimeout(() => {
          router.push(`/admin/users/${id}`);
        }, 1200);
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
    if (!confirm("Delete this user?")) return;

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

  if (loading) return <div className="p-10">Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* ================= BASIC INFO ================= */}
      <Card title="Edit User">
        <div className="flex flex-col sm:flex-row gap-6 mb-6 sm:items-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold">
                {user.name?.[0] || "U"}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Upload Avatar
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadAvatar(e.target.files[0])}
            />
            {uploading && (
              <p className="text-sm text-blue-600 mt-1">
                Uploading...
              </p>
            )}
          </div>
        </div>

        <Grid>
          <Input label="Name" value={user.name || ""}
            onChange={(v) => setUser({ ...user, name: v })} />

          <Input label="Email" value={user.email} disabled />

          <Input label="Phone" value={user.phone || ""}
            onChange={(v) => setUser({ ...user, phone: v })} />

          <Select label="Role" value={user.role}
            options={["admin", "user"]}
            onChange={(v) => setUser({ ...user, role: v })} />

          <Select label="Status"
            value={user.isBlocked ? "Blocked" : "Active"}
            options={["Active", "Blocked"]}
            onChange={(v) =>
              setUser({ ...user, isBlocked: v === "Blocked" })
            } />
        </Grid>
      </Card>

      {/* ================= ADDRESS ================= */}
      <Card title="Address">
        <Grid>
          {[
            ["houseNo","House No"],
            ["street","Street"],
            ["locality","Locality"],
            ["city","City"],
            ["district","District"],
            ["state","State"],
            ["pincode","Pincode"],
            ["country","Country"],
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

      {/* ================= KYC ================= */}
      <Card title="KYC Details">
        <Grid cols={3}>
          <Input label="Aadhaar"
            value={user.kyc?.aadhaarNumber || ""}
            onChange={(v) =>
              setUser({ ...user, kyc: { ...user.kyc, aadhaarNumber: v } })
            } />

          <Input label="PAN"
            value={user.kyc?.panNumber || ""}
            onChange={(v) =>
              setUser({ ...user, kyc: { ...user.kyc, panNumber: v } })
            } />

          <Select label="Verified"
            value={user.kyc?.isVerified ? "Yes" : "No"}
            options={["Yes", "No"]}
            onChange={(v) =>
              setUser({
                ...user,
                kyc: { ...user.kyc, isVerified: v === "Yes" },
              })
            } />
        </Grid>
      </Card>

      {/* ================= ACTIONS ================= */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <button
          onClick={saveChanges}
          disabled={saving}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          onClick={() => router.push(`/admin/users/${id}`)}
          className="w-full sm:w-auto bg-gray-600 text-white px-6 py-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={deleteUser}
          className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded"
        >
          Delete User
        </button>
      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */

function Card({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h3 className="font-bold mb-4">{title}</h3>
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
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border p-2 rounded"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
