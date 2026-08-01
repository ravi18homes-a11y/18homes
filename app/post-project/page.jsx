"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../COMMON/Navbar";
import Footer from "../COMMON/Footer";
import DashboardLayout from "../dashboard/DashboardLayout";
import {
  Building2,
  MapPin,
  FileText,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  DollarSign,
  Calendar,
  Layers,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function PostProjectPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    projectName: "",
    reraNumber: "",
    tagline: "",
    description: "",
    projectType: "residential",
    projectStatus: "under_construction",
    address: {
      locality: "",
      city: "",
      state: "",
      pincode: "",
    },
    priceRange: {
      minPrice: "",
      maxPrice: "",
      displayPrice: "",
    },
    possessionDate: "",
    masterPlanImage: "",
    brochureUrl: "",
    images: [""],
    amenities: [],
  });

  const [configurations, setConfigurations] = useState([
    { bhk: "2 BHK", areaSqft: 1200, priceText: "₹ 75 Lacs", floorPlanImage: "" },
    { bhk: "3 BHK", areaSqft: 1650, priceText: "₹ 1.10 Cr", floorPlanImage: "" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [uploadingMasterPlan, setUploadingMasterPlan] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingFloorPlanIdx, setUploadingFloorPlanIdx] = useState(null);

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === "user") {
          toast.error("Normal users cannot post projects");
          router.replace("/dashboard");
        }
      }
    } catch (e) {}
  }, [router]);

  // Helper function to upload file to Cloudinary via backend or fallback route
  const uploadSingleFile = async (file) => {
    if (!file) return null;
    const token = localStorage.getItem("authToken");
    const data = new FormData();
    data.append("files", file);

    try {
      const res = await fetch(`${databaseUrl}/api/media/upload`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: data,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.media?.[0]?.url) {
          return json.data.media[0].url;
        }
      }

      // Fallback route /api/upload
      const fallbackData = new FormData();
      fallbackData.append("file", file);
      const fbRes = await fetch("/api/upload", {
        method: "POST",
        body: fallbackData,
      });

      if (fbRes.ok) {
        const fbJson = await fbRes.json();
        return fbJson.url;
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
    return null;
  };

  const handleMasterPlanUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMasterPlan(true);
    toast.loading("Uploading Master Plan layout...", { id: "mp-upload" });

    const url = await uploadSingleFile(file);
    setUploadingMasterPlan(false);

    if (url) {
      setFormData((prev) => ({ ...prev, masterPlanImage: url }));
      toast.success("Master Plan uploaded!", { id: "mp-upload" });
    } else {
      toast.error("Failed to upload Master Plan file", { id: "mp-upload" });
    }
  };

  const handleBrochureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrochure(true);
    toast.loading("Uploading E-Brochure...", { id: "brochure-upload" });

    const url = await uploadSingleFile(file);
    setUploadingBrochure(false);

    if (url) {
      setFormData((prev) => ({ ...prev, brochureUrl: url }));
      toast.success("Brochure uploaded!", { id: "brochure-upload" });
    } else {
      toast.error("Failed to upload brochure file", { id: "brochure-upload" });
    }
  };

  const handleFloorPlanUpload = async (index, file) => {
    if (!file) return;

    setUploadingFloorPlanIdx(index);
    toast.loading("Uploading floor plan image...", { id: "fp-upload" });

    const url = await uploadSingleFile(file);
    setUploadingFloorPlanIdx(null);

    if (url) {
      const updated = [...configurations];
      updated[index].floorPlanImage = url;
      setConfigurations(updated);
      toast.success("Floor plan uploaded!", { id: "fp-upload" });
    } else {
      toast.error("Failed to upload floor plan image", { id: "fp-upload" });
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingGallery(true);
    toast.loading(`Uploading ${files.length} gallery image(s)...`, {
      id: "gallery-upload",
    });

    const uploadedUrls = [];
    for (const file of files) {
      const url = await uploadSingleFile(file);
      if (url) uploadedUrls.push(url);
    }

    setUploadingGallery(false);

    if (uploadedUrls.length > 0) {
      setFormData((prev) => ({
        ...prev,
        images: [
          ...prev.images.filter((img) => img.trim() !== ""),
          ...uploadedUrls,
        ],
      }));
      toast.success(`${uploadedUrls.length} image(s) uploaded!`, {
        id: "gallery-upload",
      });
    } else {
      toast.error("Failed to upload gallery images", { id: "gallery-upload" });
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleConfigChange = (index, field, value) => {
    const updated = [...configurations];
    updated[index][field] = value;
    setConfigurations(updated);
  };

  const addConfiguration = () => {
    setConfigurations([
      ...configurations,
      { bhk: "3 BHK", areaSqft: 1500, priceText: "₹ 95 Lacs", floorPlanImage: "" },
    ]);
  };

  const removeConfiguration = (index) => {
    if (configurations.length === 1) return;
    setConfigurations(configurations.filter((_, i) => i !== index));
  };

  const handleImageChange = (index, value) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData({ ...formData, images: updated });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImageField = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.projectName.trim()) {
      toast.error("Please enter Project Name");
      return;
    }

    if (!formData.address.city.trim()) {
      toast.error("Please enter City");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please log in to post project");
      router.push("/login-signup");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        priceRange: {
          minPrice: Number(formData.priceRange.minPrice) || 0,
          maxPrice: Number(formData.priceRange.maxPrice) || 0,
          displayPrice:
            formData.priceRange.displayPrice ||
            (formData.priceRange.minPrice
              ? `₹ ${(Number(formData.priceRange.minPrice) / 100000).toFixed(1)} Lacs Onwards`
              : "Price on Request"),
        },
        configurations,
        images: formData.images.filter((img) => img.trim() !== ""),
      };

      const res = await fetch(`${databaseUrl}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Project listed successfully!");
        router.push(`/projects/${data.data._id}`);
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to create project");
      }
    } catch (err) {
      console.error("Project submit error:", err);
      toast.error("Error submitting project");
    } finally {
      setSubmitting(false);
    }
  };

  const AMENITIES_LIST = [
    "Clubhouse",
    "Swimming Pool",
    "Gymnasium",
    "24/7 Security",
    "Landscaped Gardens",
    "Children Play Area",
    "Power Backup",
    "Jogging Track",
    "Tennis Court",
    "EV Charging Station",
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-purple-500/20 text-purple-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Builder & Developer Module
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Post New Real Estate Project
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1">
            List housing societies, townships, and multi-unit new launches with RERA details and master plans.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Basic Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-purple-600" />
              <span>1. Project Basic Details</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Purvanchal Royal City"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData({ ...formData, projectName: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>RERA Registration Number</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPRERAPRJ12345"
                  value={formData.reraNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, reraNumber: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Project Type
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) =>
                    setFormData({ ...formData, projectType: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="residential">Residential Township</option>
                  <option value="commercial">Commercial Hub</option>
                  <option value="plots">Plotted Development</option>
                  <option value="township">Mixed Mega Township</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Construction Status
                </label>
                <select
                  value={formData.projectStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, projectStatus: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="new_launch">New Launch</option>
                  <option value="under_construction">Under Construction</option>
                  <option value="ready_to_move">Ready To Move</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Expected Possession Date
                </label>
                <input
                  type="date"
                  value={formData.possessionDate}
                  onChange={(e) =>
                    setFormData({ ...formData, possessionDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catchy Tagline
              </label>
              <input
                type="text"
                placeholder="e.g. Ultra-Luxury 3/4 BHK Residences facing 15-acre Central Park"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Project Overview & Highlights
              </label>
              <textarea
                rows={4}
                placeholder="Describe master layout, nearby expressways, architecture, and specifications..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
              />
            </div>
          </div>

          {/* 2. Address & Pricing */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span>2. Location & Pricing Slabs</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Locality / Sector *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector 150"
                  value={formData.address.locality}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, locality: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Noida"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uttar Pradesh"
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Minimum Price (₹ in INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 7500000"
                  value={formData.priceRange.minPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceRange: {
                        ...formData.priceRange,
                        minPrice: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Maximum Price (₹ in INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15000000"
                  value={formData.priceRange.maxPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceRange: {
                        ...formData.priceRange,
                        maxPrice: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Display Price Format
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹ 75 Lacs - ₹ 1.5 Cr"
                  value={formData.priceRange.displayPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priceRange: {
                        ...formData.priceRange,
                        displayPrice: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-purple-600 transition"
                />
              </div>
            </div>
          </div>

          {/* 3. Multi-Unit Configurations */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <span>3. Unit Configurations (Floor Plans)</span>
              </h2>
              <button
                type="button"
                onClick={addConfiguration}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Unit Type</span>
              </button>
            </div>

            <div className="space-y-4">
              {configurations.map((config, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full md:w-32">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        BHK / Variant
                      </label>
                      <input
                        type="text"
                        placeholder="2 BHK"
                        value={config.bhk}
                        onChange={(e) =>
                          handleConfigChange(idx, "bhk", e.target.value)
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div className="w-full md:w-36">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Super Area (sq.ft)
                      </label>
                      <input
                        type="number"
                        placeholder="1200"
                        value={config.areaSqft}
                        onChange={(e) =>
                          handleConfigChange(idx, "areaSqft", e.target.value)
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    <div className="w-full md:w-40">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Price Text
                      </label>
                      <input
                        type="text"
                        placeholder="₹ 75 Lacs"
                        value={config.priceText}
                        onChange={(e) =>
                          handleConfigChange(idx, "priceText", e.target.value)
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                      />
                    </div>

                    {configurations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeConfiguration(idx)}
                        className="text-red-500 hover:text-red-700 p-2 self-end md:self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Floor Plan Image Upload Only */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Floor Plan Image
                    </label>

                    {config.floorPlanImage ? (
                      <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <img
                            src={config.floorPlanImage}
                            alt="Floor Plan"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-100"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Floor Plan Attached</p>
                            <span className="text-[10px] text-emerald-600 font-semibold">Uploaded ✓</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleConfigChange(idx, "floorPlanImage", "")}
                          className="text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg border border-red-100 bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="w-full bg-white hover:bg-slate-100 text-purple-700 border-2 border-dashed border-purple-200 p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
                        {uploadingFloorPlanIdx === idx ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span>Upload Floor Plan Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleFloorPlanUpload(idx, e.target.files?.[0])
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Amenities */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span>4. Project Amenities</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
              {AMENITIES_LIST.map((amenity) => {
                const selected = formData.amenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`p-3 rounded-2xl text-xs font-extrabold transition border text-center ${
                      selected
                        ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-100"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Master Plan & Images Upload */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Upload className="w-5 h-5 text-purple-600" />
              <span>5. Master Plan & Project Media Uploads</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Master Plan Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Master Layout Plan Image
                </label>

                {formData.masterPlanImage ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.masterPlanImage}
                        alt="Master Plan"
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">Master Plan Attached</p>
                        <span className="text-[10px] font-semibold text-emerald-600">Uploaded ✓</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, masterPlanImage: "" })}
                      className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-xl border border-red-100 bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-dashed border-purple-200 p-4 rounded-2xl text-xs font-extrabold transition flex flex-col items-center justify-center gap-2 cursor-pointer">
                    {uploadingMasterPlan ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                    <span>Click to Upload Master Plan Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMasterPlanUpload}
                    />
                  </label>
                )}
              </div>

              {/* Brochure Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  E-Brochure PDF Document
                </label>

                {formData.brochureUrl ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">E-Brochure Attached</p>
                        <span className="text-[10px] font-semibold text-emerald-600">Uploaded ✓</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, brochureUrl: "" })}
                      className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1.5 rounded-xl border border-red-100 bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-dashed border-purple-200 p-4 rounded-2xl text-xs font-extrabold transition flex flex-col items-center justify-center gap-2 cursor-pointer">
                    {uploadingBrochure ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                    <span>Click to Upload E-Brochure (PDF)</span>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={handleBrochureUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Project Gallery Photos (Pure Multi-File Upload Only) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900">
                    Project Gallery Photos
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Upload project site photos from your device.
                  </p>
                </div>

                <label className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-purple-100">
                  {uploadingGallery ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Upload Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />
                </label>
              </div>

              {/* Gallery Image Previews Grid */}
              {formData.images.filter((img) => img.trim() !== "").length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50">
                  <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">
                    No gallery photos uploaded yet. Click "Upload Photos" above.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {formData.images
                    .filter((img) => img.trim() !== "")
                    .map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-2xl overflow-hidden border border-slate-200 h-28 bg-slate-900"
                      >
                        <img
                          src={url}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx),
                            }))
                          }
                          className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white p-1 rounded-lg transition opacity-90 hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/dashboard/builder"
              className="px-6 py-3.5 rounded-2xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || uploadingMasterPlan || uploadingBrochure || uploadingGallery}
              className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl text-xs font-black transition shadow-xl shadow-purple-100 flex items-center gap-2"
            >
              <span>{submitting ? "Publishing Project..." : "Publish Real Estate Project"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
