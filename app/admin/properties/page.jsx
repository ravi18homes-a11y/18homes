"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "../../components/admin/Pagination";

const BASE =
  (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
  "/api/properties";

export default function AdminPropertiesPage() {
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  /* ================= FETCH ================= */
  const fetchProperties = async () => {
    setLoading(true);

    const res = await fetch(
      `${BASE}/admin/all?page=${page}&limit=10&search=${encodeURIComponent(
        search
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    const json = await res.json();

    if (json?.success) {
      setProperties(json?.data?.properties || []);
      setPagination(json?.data?.pagination);
    } else {
      setProperties([]);
      setPagination(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, [page, search]);

  /* ================= FLAG / UNFLAG ================= */
  const toggleFlag = async (id, isFlagged) => {
    if (!id) return alert("Invalid property id");

    await fetch(`${BASE}/admin/${id}/flag`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: isFlagged ? "" : "Flagged by admin",
      }),
    });

    fetchProperties();
  };

  /* ================= DELETE ================= */
  const deleteProperty = async (id) => {
    if (!id) return alert("Invalid property id");

    if (!confirm("Are you sure you want to delete this property?")) return;

    await fetch(`${BASE}/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchProperties();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Property Management</h1>

      <input
        placeholder="Search title / city / locality"
        className="border px-4 py-2 rounded w-full md:w-1/3"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      {loading ? (
        <div className="p-10 text-center">Loading properties…</div>
      ) : (
        <PropertyTable
          properties={properties}
          page={page}
          limit={10}
          onView={(id) => router.push(`/admin/properties/${id}`)}
          onDelete={deleteProperty}
          onFlag={toggleFlag}
        />
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

/* ================= TABLE ================= */

function PropertyTable({
  properties = [],
  page,
  limit,
  onView,
  onDelete,
  onFlag,
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">City</th>
            <th className="p-3 text-left">Owner</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {properties.map((p, i) => {
            const isFlagged = p?.isFlagged;

            return (
              <tr
                key={p?._id}
                className={`border-t transition ${
                  isFlagged ? "bg-red-50" : "hover:bg-gray-50"
                }`}
              >
                {/* SERIAL */}
                <td className="p-3 font-semibold">
                  {(page - 1) * limit + i + 1}
                </td>

                {/* TITLE */}
                <td className="p-3 font-medium">{p?.title}</td>

                {/* CITY */}
                <td className="p-3">{p?.address?.city || "—"}</td>

                {/* OWNER */}
                <td className="p-3">{p?.owner?.name || "—"}</td>

                {/* STATUS */}
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isFlagged
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {isFlagged ? "Hide" : "ACTIVE"}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => onView(p._id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    View
                  </button>

                  <button
                    onClick={() => onFlag(p._id, isFlagged)}
                    className={`px-3 py-1 rounded text-white ${
                      isFlagged
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    {isFlagged ? "Visible" : "Hide"}
                  </button>

                  <button
                    onClick={() => onDelete(p._id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}

          {!properties.length && (
            <tr>
              <td
                colSpan="6"
                className="p-6 text-center text-gray-500"
              >
                No properties found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
