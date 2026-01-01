"use client";

import Link from "next/link";

export default function UserTable({ users = [], onDelete }) {
  /* ================= GUARDS ================= */
  if (!Array.isArray(users)) {
    return (
      <div className="p-6 text-center text-red-500">
        Invalid users data
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No users found
      </div>
    );
  }

  /* ================= DELETE HANDLER ================= */
  const handleDelete = (id, name) => {
    const ok = confirm(
      `Are you sure you want to delete user "${name}"?`
    );
    if (!ok) return;

    onDelete?.(id);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <Th>#</Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody>
          {users.map((u, index) => (
            <tr
              key={u?._id}
              className="border-t hover:bg-gray-50"
            >
              {/* ===== SERIAL NUMBER ===== */}
              <Td className="font-semibold">
                {index + 1}
              </Td>

              <Td>{u?.name || "—"}</Td>
              <Td>{u?.email || "—"}</Td>
              <Td>{u?.phone || "—"}</Td>
              <Td className="capitalize">
                {u?.role || "—"}
              </Td>

              <Td>
                <span
                  className={`font-semibold ${
                    u?.isBlocked
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {u?.isBlocked ? "Blocked" : "Active"}
                </span>
              </Td>

              <Td className="space-x-2">
                <Link
                  href={`/admin/users/${u._id}`}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  View
                </Link>

                <button
                  onClick={() =>
                    handleDelete(u._id, u?.name)
                  }
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const Th = ({ children }) => (
  <th className="p-3 text-left text-sm font-semibold">
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={`p-3 text-sm ${className}`}>
    {children}
  </td>
);
