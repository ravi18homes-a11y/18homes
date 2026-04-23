"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminContactsPage() {
  const router = useRouter();

  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const LIMIT = 10;

  const API =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    "/api/contacts";

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  /* ================= DEBOUNCE SEARCH ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= FETCH CONTACTS ================= */
  const fetchContacts = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API}?page=${page}&limit=${LIMIT}&search=${debouncedSearch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );

      const data = await res.json();

      setContacts(data?.data?.contacts ?? []);
      setTotalPages(data?.data?.pagination?.totalPages ?? 1);
    } catch (err) {
      console.error("Failed to fetch contacts", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [page, debouncedSearch]);

  /* ================= DELETE ================= */
  const deleteContact = async (id) => {
    if (!confirm("Delete this contact enquiry?")) return;

    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchContacts();
  };

  if (loading) return <div className="p-10">Loading contacts...</div>;

  return (
    <div className=" space-x-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h2 className="text-2xl font-bold">Contact Enquiries</h2>

        <input
          value={search}
          placeholder="Search by message..."
          className="border px-4 py-2 rounded w-full md:w-64"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white shadow rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left w-12">#</th>
              <th className="p-3 text-left">Property</th>
              <th className="p-3 text-left">Buyer</th>
              <th className="p-3 text-left">Owner</th>
              <th className="p-3 text-left">Message</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {contacts.length ? (
              contacts.map((c, index) => (
                <tr key={c?._id} className="border-t">
                  {/* ===== SERIAL NUMBER ===== */}
                  <td className="p-3 font-semibold">
                    {(page - 1) * LIMIT + index + 1}
                  </td>

                  <td className="p-3 font-semibold">
                    {c?.property?.title ?? "—"}
                  </td>

                  <td className="p-3">
                    <p>{c?.buyer?.name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{c?.buyer?.email}</p>
                  </td>

                  <td className="p-3">
                    <p>{c?.owner?.name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{c?.owner?.email}</p>
                  </td>

                  <td className="p-3 max-w-xs truncate">{c?.message ?? "—"}</td>

                  <td className="p-3">
                    {c?.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/contacts/${c._id}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      View
                    </button>

                    <button
                      onClick={() => deleteContact(c._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No contacts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="flex justify-center gap-3 items-center">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2 font-semibold">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
