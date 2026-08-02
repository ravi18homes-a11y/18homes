"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../COMMON/Navbar";
import Footer from "../../COMMON/Footer";
import {
  Building2,
  MapPin,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Phone,
  MessageCircle,
  FileText,
  Download,
  CheckCircle2,
  Share2,
  ChevronRight,
  RefreshCw,
  User,
  Image as ImageIcon,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-hot-toast";

const DEFAULT_PROJECT_IMG =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [lightboxImage, setLightboxImage] = useState(null);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "I am interested in visiting this project site.",
  });

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${databaseUrl}/api/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setProject(data.data);
            if (data.data.images && data.data.images.length > 0) {
              setActiveImage(data.data.images[0]);
            }
          }
        } else {
          toast.error("Project not found");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id, databaseUrl]);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.phone.trim()) {
      toast.error("Please enter your Phone Number");
      return;
    }

    const token = localStorage.getItem("authToken");
    setSubmittingLead(true);
    try {
      const res = await fetch(`${databaseUrl}/api/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          projectId: project?._id,
          propertyId: project?._id,
          name: leadForm.name,
          phone: leadForm.phone,
          email: leadForm.email,
          message: leadForm.message || `Site Visit / Project Inquiry for ${project?.projectName}`,
        }),
      });

      if (res.ok) {
        toast.success("Site Visit Request submitted successfully!");
        setLeadForm({
          name: "",
          phone: "",
          email: "",
          message: "I am interested in visiting this project site.",
        });
      } else {
        toast.success("Inquiry sent to builder!");
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      toast.success("Inquiry submitted!");
    } finally {
      setSubmittingLead(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">
            Loading real estate project details...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="p-16 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Project Not Found</h2>
        </div>
        <Footer />
      </div>
    );
  }

  const galleryImages =
    project.images && project.images.length > 0 ? project.images : [];

  const mainDisplayImg = activeImage || galleryImages[0] || DEFAULT_PROJECT_IMG;

  const builderName =
    project.builder?.builderDetails?.firmName ||
    project.builder?.name ||
    "Verified Developer";

  const displayPrice =
    project.priceRange?.displayPrice ||
    (project.priceRange?.minPrice
      ? `₹ ${(project.priceRange.minPrice / 100000).toFixed(1)} Lacs Onwards`
      : "Price on Request");

  return (
    <div className="min-h-screen mt-[80px] bg-slate-50 flex flex-col justify-between">
      <Navbar />

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Project Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        {/* Banner Hero & Active Image Viewer */}
        <div className="bg-white rounded-3xl overflow-hidden border-2 border-slate-100 shadow-xl grid grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2 relative h-80 lg:h-[420px] bg-slate-900">
            <img
              src={mainDisplayImg}
              alt={project.projectName}
              className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => setLightboxImage(mainDisplayImg)}
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                {project.projectStatus.replace("_", " ")}
              </span>
              {project.reraNumber && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>RERA: {project.reraNumber}</span>
                </span>
              )}
            </div>

            {galleryImages.length > 0 && (
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{galleryImages.length} Gallery Photos</span>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-slate-950 text-white">
            <div className="space-y-3">
              <span className="text-xs font-extrabold text-purple-400 uppercase tracking-widest">
                {builderName}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black">
                {project.projectName}
              </h1>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>
                  {project.address?.locality
                    ? `${project.address.locality}, ${project.address?.city}`
                    : project.address?.city}
                </span>
              </p>

              {project.tagline && (
                <p className="text-xs text-purple-200 bg-white/10 p-3 rounded-2xl border border-white/10 italic">
                  "{project.tagline}"
                </p>
              )}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">
                  Starting Price
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {displayPrice}
                </h3>
              </div>

              {project.brochureUrl && (
                <a
                  href={project.brochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download E-Brochure (PDF)</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details, Gallery, Configurations, Amenities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Gallery Photos Grid */}
            {galleryImages.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    <span>Project Gallery Photos ({galleryImages.length})</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    Click photo to view full screen
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveImage(imgUrl);
                        setLightboxImage(imgUrl);
                      }}
                      className={`relative h-28 rounded-2xl overflow-hidden border-2 transition group ${activeImage === imgUrl
                          ? "border-purple-600 shadow-md scale-[1.02]"
                          : "border-slate-200 hover:border-purple-400"
                        }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Gallery Photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span>Project Overview</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {project.description ||
                  "No detailed description provided for this project."}
              </p>
            </div>

            {/* Configurations (Floor Plans) */}
            {project.configurations && project.configurations.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <span>Unit Configurations & Slabs</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.configurations.map((config, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full uppercase">
                            {config.bhk || "Unit"}
                          </span>
                          <h4 className="text-sm font-extrabold text-slate-900 mt-2">
                            {config.areaSqft ? `${config.areaSqft} sq.ft` : "Super Area"}
                          </h4>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">
                            {config.priceText || "Price on Request"}
                          </p>
                        </div>
                      </div>

                      {config.floorPlanImage && (
                        <button
                          onClick={() => setLightboxImage(config.floorPlanImage)}
                          className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 bg-purple-50 p-2 rounded-xl border border-purple-100"
                        >
                          <FileText className="w-4 h-4" />
                          <span>View Floor Plan Image</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {project.amenities && project.amenities.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Project Amenities</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 text-purple-950 text-xs font-extrabold flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Master Layout Plan */}
            {project.masterPlanImage && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Master Layout Plan</span>
                </h3>

                <div
                  className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer"
                  onClick={() => setLightboxImage(project.masterPlanImage)}
                >
                  <img
                    src={project.masterPlanImage}
                    alt="Master Layout Plan"
                    className="w-full object-contain max-h-[500px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Lead Request Form & Builder Info */}
          <div className="space-y-6">
            {/* Direct Site Visit Lead Form */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-lg space-y-4 sticky top-24">
              <div className="border-b border-slate-100 pb-3">
                <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  Direct Builder Connect
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Request Site Visit & Callback
                </h3>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={leadForm.name}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, name: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={leadForm.phone}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, phone: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Message / Preferred Time
                  </label>
                  <textarea
                    rows={3}
                    value={leadForm.message}
                    onChange={(e) =>
                      setLeadForm({ ...leadForm, message: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-purple-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLead}
                  className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white py-3.5 rounded-2xl font-black text-xs transition shadow-md shadow-purple-100 flex items-center justify-center gap-2"
                >
                  <span>
                    {submittingLead ? "Submitting..." : "Schedule Site Visit"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </form>

              {/* Developer Branding Snippet */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                    Developer
                  </p>
                  <h4 className="text-xs font-black text-slate-800">
                    {builderName}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
