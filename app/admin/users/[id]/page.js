"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const API =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    "/api/users";

  useEffect(() => {
    fetch(`${API}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setUser(res?.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!user) return <div className="p-10">User not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* ================= USER CARD ================= */}
      <div className="bg-white rounded-xl shadow p-6 flex gap-6">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
            {user?.name?.[0] || "U"}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{user?.name || "—"}</h2>

            {user?.role === "admin" && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
                ADMIN
              </span>
            )}
          </div>

          <p className="text-gray-600">{user?.email}</p>
          <p className="text-gray-600">{user?.phone || "—"}</p>

          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <Info
              label="Status"
              value={user?.isBlocked ? "Blocked" : "Active"}
            />
            <Info
              label="Last Login"
              value={
                user?.lastLogin
                  ? new Date(user.lastLogin).toISOString().slice(0, 10)
                  : "—"
              }
            />
            <Info
              label="Created At"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toISOString().slice(0, 10)
                  : "—"
              }
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Back
            </button>
            <button
              onClick={() => router.push(`/admin/users/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Edit User
            </button>
          </div>
        </div>
      </div>

      {/* ================= ADDRESS ================= */}
      <Section title="Address">
        <Grid>
          <Field label="House No" value={user?.address?.houseNo} />
          <Field label="Street" value={user?.address?.street} />
          <Field label="Locality" value={user?.address?.locality} />
          <Field label="City" value={user?.address?.city} />
          <Field label="District" value={user?.address?.district} />
          <Field label="State" value={user?.address?.state} />
          <Field label="Pincode" value={user?.address?.pincode} />
          <Field label="Country" value={user?.address?.country || "India"} />
        </Grid>
      </Section>

      {/* ================= SAVED PROPERTIES ================= */}
      <Section title="Saved Properties">
        {user?.savedProperties?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">City</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {user.savedProperties.map((p, i) => (
                  <tr key={p?._id} className="border-t">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-semibold">{p?.title || "—"}</td>
                    <td className="p-3">{p?.address?.city || "—"}</td>
                    <td className="p-3">₹ {p?.price || "—"}</td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          router.push(`/admin/properties/${p?._id}`)
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No saved properties</p>
        )}
      </Section>
    </div>
  );
}

/* ================= REUSABLE ================= */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold">{value || "—"}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children, cols = 4 }) {
  return (
    <div className={`grid grid-cols-${cols} gap-4 text-sm`}>{children}</div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold">{value || "—"}</p>
    </div>
  );
}
