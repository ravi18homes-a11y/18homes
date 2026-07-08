"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Home, MessageSquare, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

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
import Link from "next/link";

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
        
         <Link href="/admin/users" >
          <Stat title="Total Users" value={stats.users} icon={<Users />} />
         </Link>
        <Stat
          title="Blocked Users"
          value={stats.blockedUsers}
          danger
          icon={<AlertTriangle />}
        />
       
        <Link href="/admin/properties" >
           <Stat
          title="Total Properties"
          value={stats.properties}
          icon={<Home />}
        />
         </Link>
        
         <Link href="/admin/contacts" >
         <Stat
          title="Contacts"
          value={stats.contacts}
          icon={<MessageSquare />}
        />
         </Link>
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

      {/* ===== BOOST PLAN PRICE MANAGEMENT ===== */}
      <BoostPlanManager BASE={BASE} />
    </div>
  );
}

/* ================= BOOST PLAN MANAGER COMPONENT ================= */

function BoostPlanManager({ BASE }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingKey, setUpdatingKey] = useState("");
  const [newPrices, setNewPrices] = useState({});

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${BASE}/properties/boost/plans`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (json?.success) {
        setPlans(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching boost plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleUpdatePrice = async (planKey) => {
    const priceToUpdate = newPrices[planKey];
    if (priceToUpdate === undefined || priceToUpdate === "" || isNaN(Number(priceToUpdate))) {
      return toast.error("Please enter a valid price");
    }

    setUpdatingKey(planKey);
    try {
      const res = await fetch(`${BASE}/properties/admin/boost/plans/${planKey}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ price: Number(priceToUpdate) }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Price updated successfully!");
        setNewPrices((prev) => ({ ...prev, [planKey]: "" }));
        fetchPlans();
      } else {
        toast.error(json.message || "Failed to update price");
      }
    } catch (err) {
      console.error("Error updating price:", err);
      toast.error("Error updating price");
    } finally {
      setUpdatingKey("");
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow mt-8 text-center text-gray-500">
        Loading boost plan configuration...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-8">
      <h3 className="font-bold text-lg text-gray-800 mb-2 flex items-center gap-2">
        ⚙️ Property Boost Plans Pricing Manager
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Set the price in Rs. (INR) for each boost plan duration. Changes will reflect instantly on the listing page and user checkout.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.key} className="border border-purple-100 bg-purple-50/10 rounded-xl p-4 flex flex-col justify-between hover:shadow-sm transition">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-purple-950 text-sm">{plan.name}</h4>
                <span className="text-purple-700 bg-purple-100 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  ₹{plan.price}
                </span>
              </div>
              <p className="text-xs text-gray-500">Duration: {plan.durationDays} Days</p>
            </div>
            
            <div className="mt-4 flex gap-2">
              <input
                type="number"
                placeholder="New Price"
                value={newPrices[plan.key] || ""}
                onChange={(e) => {
                  setNewPrices((prev) => ({ ...prev, [plan.key]: e.target.value }));
                }}
                className="w-full border border-purple-100 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => handleUpdatePrice(plan.key)}
                disabled={updatingKey === plan.key}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center justify-center min-w-[70px]"
              >
                {updatingKey === plan.key ? <Loader2 className="w-3 h-3 animate-spin" /> : "Update"}
              </button>
            </div>
          </div>
        ))}
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
