"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../DashboardLayout";
import {
  Building2,
  PlusCircle,
  MapPin,
  ShieldCheck,
  Calendar,
  Layers,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";
import { toast } from "react-hot-toast";

const DEFAULT_PROJECT_IMG =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200";

export default function BuilderProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in first");
        setLoading(false);
        return;
      }

      const res = await fetch(`${databaseUrl}/api/projects/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProjects(data.data);
        }
      } else {
        toast.error("Failed to load your projects");
      }
    } catch (err) {
      console.error("Error fetching my projects:", err);
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleDeleteProject = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeletingId(id);

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${databaseUrl}/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Project deleted successfully");
        setProjects((prev) => prev.filter((p) => p._id !== id));
      } else {
        toast.error("Failed to delete project");
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Error deleting project");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const name = p.projectName || "";
    const city = p.address?.city || "";
    const query = searchTerm.toLowerCase();
    return name.toLowerCase().includes(query) || city.toLowerCase().includes(query);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="bg-white/20 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
              Builder Project Manager
            </span>
            <h1 className="text-2xl sm:text-3xl font-black">
              My Housing Projects
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1">
              Manage your township launches, RERA details, and floor plans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMyProjects}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border border-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/post-project"
              className="bg-white text-purple-800 hover:bg-slate-100 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Project</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by project name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
            />
          </div>

          <p className="text-xs font-bold text-slate-500">
            Total Projects: <span className="text-purple-600">{projects.length}</span>
          </p>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-500">
              Loading your project listings...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-slate-100 text-center space-y-4">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No Projects Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't posted any township or housing project listings yet.
            </p>
            <Link
              href="/post-project"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => {
              const coverImg =
                proj.images && proj.images.length > 0
                  ? proj.images[0]
                  : DEFAULT_PROJECT_IMG;

              const displayPrice =
                proj.priceRange?.displayPrice ||
                (proj.priceRange?.minPrice
                  ? `₹ ${(proj.priceRange.minPrice / 100000).toFixed(1)} Lacs Onwards`
                  : "Price on Request");

              return (
                <div
                  key={proj._id}
                  className="bg-white rounded-3xl overflow-hidden border-2 border-slate-100 hover:border-purple-200 hover:shadow-xl transition flex flex-col justify-between"
                >
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={proj.projectName}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {proj.projectStatus.replace("_", " ")}
                      </span>
                      {proj.reraNumber && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>RERA Verified</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1">
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-900 text-lg">
                        {proj.projectName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {proj.address?.locality
                            ? `${proj.address.locality}, ${proj.address?.city}`
                            : proj.address?.city}
                        </span>
                      </p>
                    </div>

                    <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-900">
                        Price Range:
                      </span>
                      <span className="text-sm font-black text-purple-700">
                        {displayPrice}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>Configurations: {proj.configurations?.length || 0} Types</span>
                      <span>Views: {proj.viewCount || 0}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      href={`/projects/${proj._id}`}
                      target="_blank"
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Live Page</span>
                    </Link>

                    <button
                      onClick={() => handleDeleteProject(proj._id)}
                      disabled={deletingId === proj._id}
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
