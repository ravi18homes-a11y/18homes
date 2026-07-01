"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  User, 
  Phone, 
  Mail, 
  Home, 
  MapPin, 
  Building, 
  Upload, 
  Loader2, 
  ArrowLeft,
  Map,
  Compass,
  FileText
} from "lucide-react";

const BASE_API_URL = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

export default function EditProfile() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    address: {
      houseNo: "",
      street: "",
      locality: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to edit your profile");
      router.push("/login-signup");
    } else {
      fetchProfile(token);
    }
  }, [router]);

  const fetchProfile = async (token) => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        const u = data.data;
        setProfile({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          avatar: u.avatar || "",
          address: {
            houseNo: u.address?.houseNo || "",
            street: u.address?.street || "",
            locality: u.address?.locality || "",
            city: u.address?.city || "",
            district: u.address?.district || "",
            state: u.address?.state || "",
            pincode: u.address?.pincode || "",
          }
        });
      } else {
        toast.error(data.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Network error fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      }
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max size is 5MB");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("files", file); // Multer array parameter name is 'files'

      const response = await fetch(`${BASE_API_URL}/api/media/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const uploadedUrl = data.data.media[0].url;
        setProfile((prev) => ({ ...prev, avatar: uploadedUrl }));
        toast.success("Profile photo uploaded!");
      } else {
        toast.error(data.message || "Image upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Network error uploading photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to save changes");
      return;
    }

    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (profile.phone && !/^[6-9][0-9]{9}$/.test(profile.phone)) {
      toast.error("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    if (profile.address.pincode && !/^[1-9][0-9]{5}$/.test(profile.address.pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${BASE_API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          avatar: profile.avatar,
          address: profile.address,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Profile saved successfully!");
        localStorage.setItem("userData", JSON.stringify(data.data));
        
        // Dispatch storage event to notify navbar in real time
        window.dispatchEvent(new Event("storage"));
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Network error saving profile changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#8c4bdc] animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const defaultAvatar = "https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif";

  return (
    <div className="min-h-screen mt-[80px] bg-gradient-to-tr from-gray-50 via-slate-50 to-purple-50/20 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumb / Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-[#8c4bdc] mb-6 transition-colors duration-200 group font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to previous page</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header Band */}
          <div className="bg-gradient-to-r from-[#8c4bdc] via-[#a363ee] to-[#c04b7e] px-8 py-10 text-white relative">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
              <p className="text-purple-100 mt-2 font-light">
                Update your personal info, profile photo, and address details to complete your profile
              </p>
            </div>
            {/* Visual Abstract Design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-xl"></div>
            <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/5 rounded-full blur-lg"></div>
          </div>

          <div className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Profile Image Upload Section */}
              <div className="flex flex-col items-center sm:flex-row gap-6 pb-8 border-b border-slate-100">
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-md flex-shrink-0 bg-slate-50">
                  <Image
                    src={profile.avatar || defaultAvatar}
                    alt="Profile"
                    fill
                    className="object-cover"
                    priority
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-slate-800">Profile Picture</h3>
                  <p className="text-sm text-slate-400 mt-1 mb-4">
                    Supports JPG, PNG. Max file size: 5MB
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-[#8c4bdc] hover:bg-[#7b3ac5] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? "Uploading..." : "Upload New Image"}
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Personal Information Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <User className="w-5 h-5 text-[#8c4bdc]" />
                    <h2 className="text-xl font-bold text-slate-800">Personal Details</h2>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition duration-150"
                      />
                    </div>
                  </div>

                  {/* Email Input (Disabled) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                      Email Address <span className="text-xs text-slate-400 font-normal">(Non-editable)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        disabled
                        placeholder="example@mail.com"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition duration-150"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <MapPin className="w-5 h-5 text-[#c04b7e]" />
                    <h2 className="text-xl font-bold text-slate-800">Address Details</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* House No */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">
                        House/Flat No
                      </label>
                      <div className="relative">
                        <Home className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          name="houseNo"
                          value={profile.address.houseNo}
                          onChange={handleAddressChange}
                          placeholder="e.g. A-123"
                          className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition duration-150"
                        />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">
                        Pincode
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                          type="text"
                          name="pincode"
                          value={profile.address.pincode}
                          onChange={handleAddressChange}
                          placeholder="e.g. 201010"
                          className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition duration-150"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                      Street Name
                    </label>
                    <div className="relative">
                      <Compass className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        name="street"
                        value={profile.address.street}
                        onChange={handleAddressChange}
                        placeholder="e.g. Mahatma Gandhi Road"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition duration-150"
                      />
                    </div>
                  </div>

                  {/* Locality */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                      Locality / Area
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        name="locality"
                        value={profile.address.locality}
                        onChange={handleAddressChange}
                        placeholder="e.g. Indirapuram"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition duration-150"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={profile.address.city}
                        onChange={handleAddressChange}
                        placeholder="e.g. Ghaziabad"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition duration-150"
                      />
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-600 mb-2">
                        District
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={profile.address.district}
                        onChange={handleAddressChange}
                        placeholder="e.g. Ghaziabad"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition duration-150"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">
                      State
                    </label>
                    <div className="relative">
                      <Map className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        name="state"
                        value={profile.address.state}
                        onChange={handleAddressChange}
                        placeholder="e.g. Uttar Pradesh"
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none transition duration-150"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-8 mt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#8c4bdc] to-[#c04b7e] hover:from-[#7b3ac5] hover:to-[#ae3a6d] text-white px-8 py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
