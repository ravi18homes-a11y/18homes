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
  X,
  Building2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminCitiesPage() {
  const [cities, setCities] = useState([]);
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

  const fetchCities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cities?all=true");
      const data = await res.json();
      if (data.success) {
        setCities(data.cities || []);
      } else {
        toast.error("Failed to load cities");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading cities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const slugifyTitle = (titleText) => {
    const clean = String(titleText || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return clean ? `/${clean}` : "";
  };

  const handleTitleChange = (newTitle) => {
    setFormData((prev) => {
      const autoOldSlug = slugifyTitle(prev.title);
      const isAutoSlug = !prev.link || prev.link === autoOldSlug;

      const newAutoSlug = slugifyTitle(newTitle);
      return {
        ...prev,
        title: newTitle,
        link: isAutoSlug ? (newAutoSlug || prev.link) : prev.link,
      };
    });
  };

  const openAddModal = () => {
    const nextOrder = cities.length > 0 ? Math.max(...cities.map((c) => c.order || 0)) + 1 : 1;
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

  const openEditModal = (city) => {
    setFormData({
      id: city.id || city._id,
      title: city.title || "",
      description: city.description || "",
      image: city.image || "",
      link: city.link || slugifyTitle(city.title),
      order: city.order || 1,
      isActive: city.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "cities");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Image upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Please enter a city name");

    try {
      setSaving(true);
      const isEdit = Boolean(formData.id);
      const url = isEdit ? `/api/cities/${formData.id}` : "/api/cities";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        title: formData.title,
        description: formData.description,
        image: formData.image,
        link: formData.link || slugifyTitle(formData.title),
        order: Number(formData.order),
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEdit ? "City updated successfully!" : "City created successfully!");
        setIsModalOpen(false);
        fetchCities();
      } else {
        toast.error(data.error || "Failed to save city");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving city");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(id);
      const res = await fetch(`/api/cities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("City deleted");
        fetchCities();
      } else {
        toast.error(data.error || "Failed to delete city");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting city");
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleStatus = async (city) => {
    try {
      const res = await fetch(`/api/cities/${city.id || city._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !city.isActive }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`City set to ${!city.isActive ? "Active" : "Inactive"}`);
        setCities((prev) =>
          prev.map((c) =>
            (c.id || c._id) === (city.id || city._id)
              ? { ...c, isActive: !city.isActive }
              : c
          )
        );
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const newCities = [...cities];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCities.length) return;

    const temp = newCities[index];
    newCities[index] = newCities[targetIndex];
    newCities[targetIndex] = temp;

    setCities(newCities);

    try {
      const itemsToUpdate = newCities.map((item, idx) => ({
        id: item.id || item._id,
        order: idx + 1,
      }));

      await fetch("/api/cities/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToUpdate }),
      });
      toast.success("City sorting updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save reorder");
      fetchCities();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Building2 className="text-blue-600" size={32} /> Cities Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Add & manage city showcase cards (e.g. Ghaziabad, Noida, Delhi). Each city links directly to its custom route.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition shadow-md hover:shadow-lg cursor-pointer"
        >
          <Plus size={20} />
          <span>Add New City</span>
        </button>
      </div>

      {/* CONTENT GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium">Loading cities...</p>
        </div>
      ) : cities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
          <Building2 className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800">No cities found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Add cities (e.g. Ghaziabad, Noida, Delhi). They will automatically show on the /city page and navbar.
          </p>
          <button
            onClick={openAddModal}
            className="mt-5 inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm"
          >
            <Plus size={18} /> Add City
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city, index) => (
            <div
              key={city.id || city._id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                !city.isActive ? "opacity-60 border-slate-200 bg-slate-50/50" : "border-slate-100"
              }`}
            >
              <div>
                {/* IMAGE CONTAINER */}
                <div className="relative w-full h-48 bg-slate-100 overflow-hidden group">
                  {city.image ? (
                    <img
                      src={city.image}
                      alt={city.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <Building2 size={36} />
                    </div>
                  )}

                  {/* ACTIVE BADGE */}
                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => toggleStatus(city)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition shadow-xs ${
                        city.isActive
                          ? "bg-blue-600/90 text-white"
                          : "bg-slate-700/90 text-slate-200"
                      }`}
                    >
                      {city.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{city.isActive ? "Active" : "Inactive"}</span>
                    </button>
                  </div>

                  {/* SORTING CONTROLS */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-lg">
                    <button
                      onClick={() => handleMoveOrder(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-white hover:text-blue-300 disabled:opacity-30 transition cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, "down")}
                      disabled={index === cities.length - 1}
                      className="p-1 text-white hover:text-blue-300 disabled:opacity-30 transition cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                    <span className="bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      Order: #{index + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                    {city.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                    {city.description || "No description provided."}
                  </p>

                  {/* LINK / ROUTE */}
                  {city.link && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                      <LinkIcon size={12} className="text-blue-500 flex-shrink-0" />
                      <span className="truncate font-mono">{city.link}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* CARD FOOTER / ACTIONS */}
              <div className="p-5 pt-0 flex items-center gap-3 border-t border-slate-100 mt-4">
                <button
                  onClick={() => openEditModal(city)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(city.id || city._id)}
                  disabled={isDeleting === (city.id || city._id)}
                  className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Delete City"
                >
                  {isDeleting === (city.id || city._id) ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in duration-200">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6 pb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {formData.id ? "Edit City Card" : "Add New City Card"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <form id="cityForm" onSubmit={handleSubmit} className="space-y-4">
                {/* TITLE */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    City Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Ghaziabad, Noida, Delhi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of properties in this city..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* IMAGE UPLOAD */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    City Cover Image
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="Image URL or upload below"
                      className="flex-1 w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <label className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition w-full sm:w-auto justify-center">
                      {uploading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <div className="mt-3 relative h-32 w-full rounded-xl overflow-hidden border border-slate-200">
                      <Image
                        src={formData.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* LINK / ROUTE */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    City Page Route / Link
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    placeholder="/ghaziabad"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Route for this city (e.g. /ghaziabad). Visitors clicking this card will go to this URL.
                  </p>
                </div>

                {/* ACTIVE TOGGLE */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Active (visible on website & navbar)
                  </label>
                </div>
              </form>
            </div>

            {/* MODAL FOOTER */}
            <div className="border-t border-slate-100 p-6 pt-4 flex items-center justify-end gap-3 bg-slate-50/50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="cityForm"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                <span>{formData.id ? "Save Changes" : "Create City"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
