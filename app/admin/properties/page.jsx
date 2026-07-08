"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Pagination from "../../components/admin/Pagination";
import { toast } from "react-hot-toast";

const BASE =
  (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
  "/api/properties";

export default function AdminPropertiesPage() {
  const router = useRouter();

  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [soldFilter, setSoldFilter] = useState("all");
  const [viewsSort, setViewsSort] = useState("none");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  /* ================= FETCH ================= */
  useEffect(() => {
    let active = true;
    const fetchProps = async () => {
      try {
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
        if (active) {
          if (json?.success) {
            setProperties(json?.data?.properties || []);
            setPagination(json?.data?.pagination);
          } else {
            setProperties([]);
            setPagination(null);
          }
        }
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchProps();
    return () => {
      active = false;
    };
  }, [page, search, token, fetchTrigger]);

  /* ================= FLAG / UNFLAG ================= */
  const toggleFlag = async (id, isFlagged) => {
    if (!id) return toast.error("Invalid property id");

    setLoading(true);
    const res = await fetch(`${BASE}/admin/${id}/flag`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: isFlagged ? "" : "Flagged by admin",
      }),
    });

    if (res.ok) {
      toast.success(isFlagged ? "Property is now visible" : "Property is now hidden");
      setFetchTrigger((prev) => prev + 1);
    } else {
      toast.error("Failed to update property status");
      setLoading(false);
    }
  };

  /* ================= TOGGLE SOLD ================= */
  const toggleSold = async (id, currentIsSold) => {
    if (!id) return toast.error("Invalid property id");

    setLoading(true);
    const res = await fetch(`${BASE}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isSold: !currentIsSold,
      }),
    });

    if (res.ok) {
      toast.success(currentIsSold ? "Property marked as available" : "Property marked as sold");
      setFetchTrigger((prev) => prev + 1);
    } else {
      const data = await res.json();
      toast.error(data.message || "Failed to update property status");
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteProperty = async (id) => {
    if (!id) return toast.error("Invalid property id");

    if (!confirm("Are you sure you want to delete this property?")) return;

    setLoading(true);
    const res = await fetch(`${BASE}/admin/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Property deleted successfully");
      setFetchTrigger((prev) => prev + 1);
    } else {
      toast.error("Failed to delete property");
      setLoading(false);
    }
  };

  const filteredProperties = properties
    .filter((p) => {
      if (soldFilter === "sold") return p?.isSold === true;
      if (soldFilter === "available") return p?.isSold !== true;
      return true;
    })
    .sort((a, b) => {
      if (viewsSort === "most") {
        return (b?.views ?? 0) - (a?.views ?? 0);
      }
      if (viewsSort === "least") {
        return (a?.views ?? 0) - (b?.views ?? 0);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex gap-6 items-center"><h1 className="text-2xl font-bold">Property Management</h1>
      <Link className=" bg-[green] text-white px-6 py-1" href="/sell">Sell</Link></div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          placeholder="Search title / city / locality"
          className="border px-4 py-2 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => {
            setLoading(true);
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Status:</span>
            <select
              value={soldFilter}
              onChange={(e) => setSoldFilter(e.target.value)}
              className="border px-3 py-2 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available (Not Sold)</option>
              <option value="sold">Sold Out</option>
            </select>
          </div>

          {/* Views Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">Views:</span>
            <select
              value={viewsSort}
              onChange={(e) => setViewsSort(e.target.value)}
              className="border px-3 py-2 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Default Order</option>
              <option value="most">Most Viewed first</option>
              <option value="least">Least Viewed first</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center">Loading properties…</div>
      ) : (
        <PropertyTable
          properties={filteredProperties}
          page={page}
          limit={10}
          onView={async (id) => {
            try {
              await fetch(`${BASE}/${id}/admin-click`, { method: "POST" });
            } catch (err) {
              console.error("Failed to increment admin views:", err);
            }
            router.push(`/admin/properties/${id}`);
          }}
          onDelete={deleteProperty}
          onFlag={toggleFlag}
          onToggleSold={toggleSold}
        />
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => {
            setLoading(true);
            setPage(p);
          }}
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
  onToggleSold,
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
            <th className="p-3 text-left">Views</th>
            <th className="p-3 text-left">Admin Views</th>
            <th className="p-3 text-left">Boosted</th>
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
                <td className="p-3 font-medium">
                  <Link
                    href={`/buy/property-details?id=${p?._id || p?.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                  >
                    {p?.title}
                  </Link>
                </td>

                {/* CITY */}
                <td className="p-3">{p?.address?.city || "—"}</td>

                {/* OWNER */}
                <td className="p-3">{p?.owner?.name || "—"}</td>

                {/* VIEWS */}
                <td className="p-3 font-semibold text-gray-700">{p?.views ?? 0}</td>

                {/* ADMIN VIEWS */}
                <td className="p-3 font-semibold text-gray-700">{p?.adminViews ?? 0}</td>

                {/* BOOSTED */}
                <td className="p-3">
                  {p?.isBoosted ? (
                    <div className="flex flex-col">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm inline-block w-max">
                        ★ Premium Boosted
                      </span>
                      {p?.boostExpiresAt && (
                        <span className="text-[10px] text-gray-500 mt-1">
                          Exp: {new Date(p.boostExpiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>

                {/* STATUS */}
                <td className="p-3">
                  <div className="flex flex-col gap-1 items-start">
                    <span
                      className={`px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                        isFlagged
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isFlagged ? "Hidden" : "ACTIVE"}
                    </span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-[11px] font-semibold ${
                        p?.isSold
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {p?.isSold ? "Sold Out" : "Available"}
                    </span>
                  </div>
                </td>

                {/* ACTIONS */}
                <td className="p-3 flex gap-2 flex-wrap">
                  <button
                    onClick={() => onView(p._id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    View
                  </button>

                  <button
                    onClick={() => onToggleSold(p._id, p?.isSold)}
                    className={`px-3 py-1 rounded text-white ${
                      p?.isSold
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {p?.isSold ? "Make Available" : "Mark Sold"}
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
                colSpan="8"
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
