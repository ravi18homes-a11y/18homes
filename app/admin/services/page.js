"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    image: "",
    link: "",
    order: 1,
    isActive: true,
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services?all=true");
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      } else {
        toast.error("Failed to load services");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const slugifyTitle = (titleText) => {
    const clean = String(titleText || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return clean ? `/service/${clean}` : "";
  };

  const handleTitleChange = (newTitle) => {
    setFormData((prev) => {
      const autoOldSlug = slugifyTitle(prev.title);
      const isAutoSlug = !prev.link || prev.link === autoOldSlug || prev.link === "/service/house";

      const newAutoSlug = slugifyTitle(newTitle);
      return {
        ...prev,
        title: newTitle,
        link: isAutoSlug ? (newAutoSlug || prev.link) : prev.link,
      };
    });
  };

  const openAddModal = () => {
    const nextOrder = services.length > 0 ? Math.max(...services.map((s) => s.order || 0)) + 1 : 1;
    setFormData({
      id: null,
      title: "",
      description: "",
      image: "",
      link: "",
      order: nextOrder,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setFormData({
      id: service.id || service._id,
      title: service.title || "",
      description: service.description || "",
      image: service.image || "",
      link: service.link || "",
      order: service.order || 1,
      isActive: service.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Method 1: Try server API /api/upload
      const data = new FormData();
      data.append("file", file);

      let imageUrl = null;

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        const json = await res.json();
        if (res.ok && json.url) {
          imageUrl = json.url;
        }
      } catch (err) {
        console.warn("API upload failed, trying direct Cloudinary upload...", err);
      }

      // Method 2: Direct Cloudinary Upload fallback
      if (!imageUrl) {
        const cloudData = new FormData();
        cloudData.append("file", file);
        cloudData.append("upload_preset", "18homes_unsigned");
        cloudData.append("folder", "18homes/services");

        const cloudRes = await fetch(
          "https://api.cloudinary.com/v1_1/domwj0m7s/image/upload",
          {
            method: "POST",
            body: cloudData,
          }
        );
        const cloudJson = await cloudRes.json();
        if (cloudRes.ok && cloudJson.secure_url) {
          imageUrl = cloudJson.secure_url;
        }
      }

      if (imageUrl) {
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setSaving(true);
      const isEdit = !!formData.id;
      const url = isEdit ? `/api/services/${formData.id}` : "/api/services";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(isEdit ? "Service updated!" : "Service created!");
        setIsModalOpen(false);
        fetchServices();
      } else {
        toast.error(json.error || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service card?")) return;

    try {
      setIsDeleting(id);
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
      const json = await res.json();

      if (json.success) {
        toast.success("Service deleted");
        setServices((prev) => prev.filter((s) => (s.id || s._id) !== id));
      } else {
        toast.error(json.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting service");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleStatus = async (service) => {
    const sId = service.id || service._id;
    const newStatus = !service.isActive;

    // Optimistic update
    setServices((prev) =>
      prev.map((s) => ((s.id || s._id) === sId ? { ...s, isActive: newStatus } : s))
    );

    try {
      const res = await fetch(`/api/services/${sId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error("Failed to update status");
        fetchServices();
      } else {
        toast.success(newStatus ? "Service published" : "Service hidden");
      }
    } catch (err) {
      console.error(err);
      fetchServices();
    }
  };

  const moveService = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const newServices = [...services];
    const temp = newServices[index];
    newServices[index] = newServices[targetIndex];
    newServices[targetIndex] = temp;

    // Re-assign order numbers strictly 1..N
    const reorderedItems = newServices.map((item, idx) => ({
      id: item.id || item._id,
      order: idx + 1,
    }));

    setServices(newServices.map((s, idx) => ({ ...s, order: idx + 1 })));

    try {
      const res = await fetch("/api/services/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reorderedItems }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Order updated successfully!");
      } else {
        toast.error("Failed to reorder");
        fetchServices();
      }
    } catch (err) {
      console.error(err);
      toast.error("Error reordering items");
      fetchServices();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-green-600" size={28} /> Service Cards Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Add, edit, re-order, and manage dynamic service cards shown on the Service Page and Navbar dropdown.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus size={20} /> Add New Service
        </button>
      </div>

      {/* SERVICES LIST */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="animate-spin text-green-600 mb-3" size={36} />
          <p className="text-sm font-medium">Loading service cards...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-4">
          <Layers className="mx-auto text-slate-300" size={48} />
          <h3 className="text-lg font-semibold text-slate-700">No Services Found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Click on "Add New Service" above to create your first dynamic service card.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition cursor-pointer"
          >
            <Plus size={18} /> Add Service Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4 text-center w-16">Sort</th>
                  <th className="py-4 px-4 w-20">Image</th>
                  <th className="py-4 px-4">Title & Description</th>
                  <th className="py-4 px-4">Link / Route</th>
                  <th className="py-4 px-4 text-center w-28">Status</th>
                  <th className="py-4 px-4 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {services.map((service, index) => {
                  const sId = service.id || service._id;
                  return (
                    <tr key={sId} className="hover:bg-slate-50/70 transition">
                      {/* SORTING CONTROLS */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => moveService(index, "up")}
                            disabled={index === 0}
                            className={`p-1 rounded hover:bg-slate-200 transition cursor-pointer ${index === 0 ? "opacity-25 cursor-not-allowed" : "text-slate-700"
                              }`}
                            title="Move Up (First)"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <span className="font-bold text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            #{service.order || index + 1}
                          </span>
                          <button
                            onClick={() => moveService(index, "down")}
                            disabled={index === services.length - 1}
                            className={`p-1 rounded hover:bg-slate-200 transition cursor-pointer ${index === services.length - 1
                                ? "opacity-25 cursor-not-allowed"
                                : "text-slate-700"
                              }`}
                            title="Move Down (Last)"
                          >
                            <ArrowDown size={16} />
                          </button>
                        </div>
                      </td>

                      {/* IMAGE */}
                      <td className="py-4 px-4">
                        <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                              No Img
                            </div>
                          )}
                        </div>
                      </td>

                      {/* TITLE & DESC */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800 text-base">
                          {service.title}
                        </div>
                        <p className="text-slate-500 text-xs line-clamp-2 mt-0.5">
                          {service.description || "No description provided."}
                        </p>
                      </td>

                      {/* LINK */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium max-w-[200px] truncate">
                          <LinkIcon size={14} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{service.link || "/service/house"}</span>
                        </div>
                      </td>

                      {/* STATUS TOGGLE */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleStatus(service)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${service.isActive
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            }`}
                        >
                          {service.isActive ? (
                            <>
                              <Eye size={12} /> Active
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} /> Hidden
                            </>
                          )}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(service)}
                            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(sId)}
                            disabled={isDeleting === sId}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            {isDeleting === sId ? (
                              <Loader2 size={16} className="animate-spin text-red-600" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200 max-h-[75vh] sm:max-h-[90vh] flex flex-col my-auto">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                {formData.id ? "Edit Service Card" : "Add New Service Card"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2BHK Flat In Govindpuram"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the service offered..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm resize-none"
                />
              </div>

              {/* Image Upload / URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Image (Upload or Image URL)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                  />
                  <label className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition cursor-pointer flex-shrink-0">
                    {uploading ? (
                      <Loader2 size={18} className="animate-spin text-green-600" />
                    ) : (
                      <Upload size={18} />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Link / URL (Auto-slugged & Editable) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Card Action Link / Route
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Auto-generated & Editable</span>
                </div>
                <input
                  type="text"
                  placeholder="/service/2bhk-flat-in-govindpuram or custom link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm font-mono text-slate-700"
                />
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sorting Order Sequence
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Visibility Status
                  </label>
                  <label className="flex items-center gap-2 pt-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      {formData.isActive ? "Published / Active" : "Draft / Hidden"}
                    </span>
                  </label>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-xl transition text-sm shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> {formData.id ? "Update Service" : "Create Service"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
