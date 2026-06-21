"use client";

import { useEffect, useState, useCallback } from "react";
import UserTable from "../../components/admin/UserTable";
import Pagination from "../../components/admin/Pagination";
import { toast } from "react-hot-toast";

const API =
  (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
  "/api/users";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  /* ================= FETCH USERS ================= */
  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${API}?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      const json = await res.json();

      if (json?.success) {
        setUsers(json?.data?.users || []);
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
  }, [page, search, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /* ================= DELETE USER ================= */
  const deleteUser = async (userId) => {
    if (!userId) return;

    try {
      const res = await fetch(`${API}/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json?.success) {
        toast.success(json?.message || "User deleted successfully");
        fetchUsers();
      } else {
        toast.error(json?.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-2xl font-bold">User Management</h1>

      {/* ================= SEARCH ================= */}
      <input
        placeholder="Search name / email / phone"
        className="border px-4 py-2 rounded w-full md:w-1/3"
        value={search}
        onChange={(e) => {
          setPage(1);
          setSearch(e.target.value);
        }}
      />

      {/* ================= TABLE ================= */}
      {loading ? (
        <div className="p-10 text-center text-gray-500">
          Loading users…
        </div>
      ) : (
        <UserTable users={users} onDelete={deleteUser} />
      )}

      {/* ================= PAGINATION ================= */}
      {pagination?.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
