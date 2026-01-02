"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Home, MessageSquare, AlertTriangle } from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const BASE =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    "/api";

  /* ================= SAFE FETCH ================= */
  const safeFetch = async (url) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const text = await res.text();
    if (!text) return null;

    return JSON.parse(text);
  };

  /* ================= LOAD DASHBOARD ================= */
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [usersRes, propertiesRes, contactsRes] = await Promise.all([
          safeFetch(`${BASE}/users`),
          safeFetch(`${BASE}/properties/admin/all`),
          safeFetch(`${BASE}/contacts`),
        ]);

        if (!alive) return;

        /* ===== NORMALIZE ARRAYS (🔥 MAIN FIX) ===== */
        const users = usersRes?.data?.users ?? usersRes?.data ?? [];

        const properties =
          propertiesRes?.data?.properties ?? propertiesRes?.data ?? [];

        const contacts = contactsRes?.data?.contacts ?? contactsRes?.data ?? [];

        if (!Array.isArray(users) || !Array.isArray(properties)) {
          throw new Error("Invalid API structure");
        }

        const blockedUsers = users.filter((u) => u?.isBlocked === true).length;

        const flaggedProperties = properties.filter(
          (p) => p?.isFlagged === true
        ).length;

        setStats({
          users: users.length,
          blockedUsers,
          activeUsers: users.length - blockedUsers,
          properties: properties.length,
          flaggedProperties,
          activeProperties: properties.length - flaggedProperties,
          contacts: contacts.length,
        });
      } catch (err) {
        console.error(err);
        if (alive) setError("Failed to load dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* ================= CHART DATA ================= */
  const userPie = useMemo(
    () => [
      { name: "Active Users", value: stats?.activeUsers ?? 0 },
      { name: "Blocked Users", value: stats?.blockedUsers ?? 0 },
    ],
    [stats]
  );

  const propertyBar = useMemo(
    () => [
      { name: "Total", value: stats?.properties ?? 0 },
      { name: "Active", value: stats?.activeProperties ?? 0 },
      { name: "Flagged", value: stats?.flaggedProperties ?? 0 },
    ],
    [stats]
  );

  /* ================= UI STATES ================= */
  if (loading) return <Skeleton />;
  if (error)
    return <div className="p-10 text-red-600 font-semibold">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Stat title="Total Users" value={stats.users} icon={<Users />} />
        <Stat
          title="Blocked Users"
          value={stats.blockedUsers}
          danger
          icon={<AlertTriangle />}
        />
        <Stat
          title="Total Properties"
          value={stats.properties}
          icon={<Home />}
        />
        <Stat
          title="Contacts"
          value={stats.contacts}
          icon={<MessageSquare />}
        />
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">Users Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={userPie}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                label
              >
                <Cell fill="#16a34a" />
                <Cell fill="#dc2626" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">Properties Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={propertyBar}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function Stat({ title, value, icon, danger }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
      <div>
        <p className="text-gray-500">{title}</p>
        <p
          className={`text-3xl font-bold ${
            danger ? "text-red-600" : "text-gray-900"
          }`}
        >
          {value}
        </p>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
