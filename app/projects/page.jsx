"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../COMMON/Navbar";
import Footer from "../COMMON/Footer";
import {
  Building2,
  MapPin,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

const DEFAULT_PROJECT_IMG =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = `${databaseUrl}/api/projects?limit=50`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (cityFilter) url += `&city=${encodeURIComponent(cityFilter)}`;
      if (typeFilter) url += `&projectType=${encodeURIComponent(typeFilter)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.projects) {
          setProjects(data.data.projects);
        } else if (Array.isArray(data.data)) {
          setProjects(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [cityFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="min-h-screen mt-[80px] bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="bg-white/20 text-white text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">
              Townships & Society Launches
            </span>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight">
              Explore Top Builder Real Estate Projects
            </h1>
            <p className="text-purple-200 text-sm sm:text-base">
              Verified RERA registered townships, ultra-luxury apartments, and new launches with direct developer pricing.
            </p>

            {/* Search Bar inside banner */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 rounded-2xl shadow-xl flex items-center gap-2"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search project name, RERA ID, or locality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none px-2"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold text-xs transition whitespace-nowrap shadow-md"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-4 h-4" />
              <span>Filters:</span>
            </span>

            {/* City Filter */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Cities</option>
              <option value="Noida">Noida</option>
              <option value="Gurgaon">Gurgaon</option>
              <option value="Delhi">Delhi</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="residential">Residential Township</option>
              <option value="commercial">Commercial Hub</option>
              <option value="plots">Plotted Development</option>
            </select>
          </div>

          <p className="text-xs font-bold text-slate-500">
            Showing <span className="text-purple-600">{projects.length}</span> verified projects
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border-2 border-slate-100 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">
              Loading townships and projects...
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border-2 border-slate-100 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No Projects Found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your city or search keywords to find new township launches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const coverImg =
                proj.images && proj.images.length > 0
                  ? proj.images[0]
                  : DEFAULT_PROJECT_IMG;

              const displayPrice =
                proj.priceRange?.displayPrice ||
                (proj.priceRange?.minPrice
                  ? `₹ ${(proj.priceRange.minPrice / 100000).toFixed(1)} Lacs Onwards`
                  : "Price on Request");

              const builderName =
                proj.builder?.builderDetails?.firmName ||
                proj.builder?.name ||
                "Verified Developer";

              return (
                <Link
                  key={proj._id}
                  href={`/projects/${proj._id}`}
                  className="bg-white rounded-3xl overflow-hidden border-2 border-slate-100 hover:border-purple-300 hover:shadow-xl transition group flex flex-col"
                >
                  {/* Image Banner */}
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img
                      src={coverImg}
                      alt={proj.projectName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {proj.projectStatus.replace("_", " ")}
                      </span>
                      {proj.reraNumber && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>RERA</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-extrabold text-purple-600 uppercase tracking-wider">
                        {builderName}
                      </p>
                      <h3 className="font-extrabold text-slate-900 text-xl group-hover:text-purple-600 transition-colors">
                        {proj.projectName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {proj.address?.locality
                            ? `${proj.address.locality}, ${proj.address?.city}`
                            : proj.address?.city || "Location details"}
                        </span>
                      </p>

                      {proj.tagline && (
                        <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                          "{proj.tagline}"
                        </p>
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Starting Price
                        </p>
                        <h4 className="text-lg font-black text-slate-900">
                          {displayPrice}
                        </h4>
                      </div>

                      <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
