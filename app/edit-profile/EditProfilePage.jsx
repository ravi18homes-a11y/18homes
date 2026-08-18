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
  FileText,
  Building2,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2
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
    role: "user",
    approvalStatus: "approved",
    profileCompleted: false,
    address: {
      houseNo: "",
      street: "",
      locality: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },
    kyc: {
      aadhaarNumber: "",
      panNumber: "",
    },
    builderDetails: {
      firmName: "",
      completedProjectsCount: 0,
      runningProjectsCount: 0,
      runningProjectsNames: "",
      upcomingProjects: "",
      officeAddress: "",
      reraNumber: "",
      gstNumber: "",
      panNumber: "",
      aadhaarNumber: "",
    },
    dealerDetails: {
      agencyName: "",
      experienceYears: 0,
      operatingAreas: "",
      officeAddress: "",
      licenseNumber: "",
      gstNumber: "",
      panNumber: "",
      aadhaarNumber: "",
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
          role: u.role || "user",
          approvalStatus: u.approvalStatus || "approved",
          profileCompleted: !!u.profileCompleted,
          address: {
            houseNo: u.address?.houseNo || "",
            street: u.address?.street || "",
            locality: u.address?.locality || "",
            city: u.address?.city || "",
            district: u.address?.district || "",
            state: u.address?.state || "",
            pincode: u.address?.pincode || "",
          },
          kyc: {
            aadhaarNumber: u.kyc?.aadhaarNumber || "",
            panNumber: u.kyc?.panNumber || "",
          },
          builderDetails: {
            firmName: u.builderDetails?.firmName || "",
            completedProjectsCount: u.builderDetails?.completedProjectsCount || 0,
            runningProjectsCount: u.builderDetails?.runningProjectsCount || 0,
            runningProjectsNames: u.builderDetails?.runningProjectsNames || "",
            upcomingProjects: u.builderDetails?.upcomingProjects || "",
            officeAddress: u.builderDetails?.officeAddress || "",
            reraNumber: u.builderDetails?.reraNumber || "",
            gstNumber: u.builderDetails?.gstNumber || "",
            panNumber: u.builderDetails?.panNumber || "",
            aadhaarNumber: u.builderDetails?.aadhaarNumber || "",
          },
          dealerDetails: {
            agencyName: u.dealerDetails?.agencyName || "",
            experienceYears: u.dealerDetails?.experienceYears || 0,
            operatingAreas: u.dealerDetails?.operatingAreas || "",
            officeAddress: u.dealerDetails?.officeAddress || "",
            licenseNumber: u.dealerDetails?.licenseNumber || "",
            gstNumber: u.dealerDetails?.gstNumber || "",
            panNumber: u.dealerDetails?.panNumber || "",
            aadhaarNumber: u.dealerDetails?.aadhaarNumber || "",
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

  const handleKycChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      kyc: {
        ...prev.kyc,
        [name]: value,
      }
    }));
  };

  const handleBuilderChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      builderDetails: {
        ...prev.builderDetails,
        [name]: value,
      }
    }));
  };

  const handleDealerChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      dealerDetails: {
        ...prev.dealerDetails,
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
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Max size is 10MB");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("files", file);

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

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, avatar: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Photo removed. Click Save Changes below to update your profile.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to save changes");
      return;
    }

    if (!profile.name.trim()) {
      toast.error("Full Name is required");
      return;
    }

    // Role specific validations
    if (profile.role === "owner") {
      if (!profile.kyc.aadhaarNumber.trim() && !profile.kyc.panNumber.trim()) {
        toast.error("Owners must provide either Aadhaar or PAN Number");
        return;
      }
    } else if (profile.role === "builder") {
      if (!profile.builderDetails.firmName.trim()) {
        toast.error("Builder Firm Name is required");
        return;
      }
      if (!profile.builderDetails.reraNumber.trim() && !profile.builderDetails.gstNumber.trim() && !profile.builderDetails.panNumber.trim() && !profile.builderDetails.aadhaarNumber.trim()) {
        toast.error("Builders must fill at least one ID detail (RERA, GST, PAN, or Aadhaar)");
        return;
      }
    } else if (profile.role === "dealer") {
      if (!profile.dealerDetails.agencyName.trim()) {
        toast.error("Dealer / Agency Name is required");
        return;
      }
      if (!profile.dealerDetails.licenseNumber.trim() && !profile.dealerDetails.gstNumber.trim() && !profile.dealerDetails.panNumber.trim() && !profile.dealerDetails.aadhaarNumber.trim()) {
        toast.error("Dealers must fill at least one ID detail (License, GST, PAN, or Aadhaar)");
        return;
      }
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
          role: profile.role,
          address: profile.address,
          kyc: profile.kyc,
          builderDetails: profile.builderDetails,
          dealerDetails: profile.dealerDetails,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success("Profile details saved successfully!");
        
        // Fetch fully populated profile (including plan details)
        try {
          const profileRes = await fetch(`${BASE_API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profileJson = await profileRes.json();
            if (profileJson.success && profileJson.data) {
              localStorage.setItem("userData", JSON.stringify(profileJson.data));
            } else {
              localStorage.setItem("userData", JSON.stringify(data.data));
            }
          } else {
            localStorage.setItem("userData", JSON.stringify(data.data));
          }
        } catch (e) {
          localStorage.setItem("userData", JSON.stringify(data.data));
        }

        window.dispatchEvent(new Event("storage"));

        // Redirect based on role
        setTimeout(() => {
          const freshUserStr = localStorage.getItem("userData");
          let freshUser = data.data;
          if (freshUserStr) {
            try { freshUser = JSON.parse(freshUserStr); } catch (e) {}
          }

          const isAdmin = freshUser?.role === "admin" || freshUser?.role === "super_admin";
          const isDealerOrBuilder = ["dealer", "builder"].includes(freshUser.role);
          const hasNoPaidPlan = !isAdmin && isDealerOrBuilder && (freshUser.planName === "Free" || !freshUser.subscription);

          if (hasNoPaidPlan) {
            toast.info("Please subscribe to a membership plan to activate your account features.");
            router.push("/membership");
          } else if (freshUser.role === "owner") {
            router.push("/dashboard/owner");
          } else if (freshUser.role === "builder") {
            router.push("/dashboard/builder");
          } else if (freshUser.role === "dealer") {
            router.push("/dashboard/dealer");
          }
        }, 1000);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-[#8c4bdc] animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  const defaultAvatar = "https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif";

  return (
    <div className="space-y-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-[#8c4bdc] mb-6 transition-colors font-medium cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to previous page</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          
          {/* Header Band */}
          <div className="bg-gradient-to-r from-[#8c4bdc] via-[#7b3ac5] to-[#c04b7e] px-8 py-10 text-white relative">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-extrabold tracking-tight">Edit Profile & Account Details</h1>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {profile.role}
                  </span>
                </div>
                <p className="text-purple-100 font-light text-sm sm:text-base">
                  Update your contact info, role preferences, address, and verification details.
                </p>
              </div>

              {/* Status Badge */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 px-5 rounded-2xl flex items-center gap-3">
                {profile.approvalStatus === "approved" ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                    <div>
                      <p className="text-xs text-purple-100">Verification Status</p>
                      <p className="font-bold text-sm text-emerald-200">Account Approved</p>
                    </div>
                  </>
                ) : profile.approvalStatus === "rejected" ? (
                  <>
                    <AlertCircle className="w-6 h-6 text-rose-300" />
                    <div>
                      <p className="text-xs text-purple-100">Verification Status</p>
                      <p className="font-bold text-sm text-rose-200">Application Rejected</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-6 h-6 text-amber-300" />
                    <div>
                      <p className="text-xs text-purple-100">Verification Status</p>
                      <p className="font-bold text-sm text-amber-200">Pending Admin Approval</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Profile Image & Account Role Selection */}
              <div className="grid md:grid-cols-12 gap-8 pb-8 border-b border-slate-100 items-center">
                
                {/* Image Upload */}
                <div className="md:col-span-5 flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative group w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-md flex-shrink-0 bg-slate-50">
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
                    <h3 className="text-base font-bold text-slate-800">Profile Picture</h3>
                    <p className="text-xs text-slate-400 mt-0.5 mb-3">
                      JPG/PNG up to 10MB
                    </p>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {uploading ? "Uploading..." : "Upload Photo"}
                      </button>

                      {profile.avatar && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={uploading}
                          className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-rose-200 shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Photo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Account Role Selector */}
                <div className="md:col-span-7 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Account Role Type
                  </label>
                  <select
                    name="role"
                    value={profile.role}
                    onChange={handleChange}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none cursor-pointer"
                  >
                    <option value="user">Normal User (Buy & View Properties Only)</option>
                    <option value="owner">Property Owner (Buy & Sell Homes Directly)</option>
                    <option value="builder">Builder / Real Estate Developer</option>
                    <option value="dealer">Dealer / Agent / Property Consultant</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">
                    {profile.role === "user" && "Normal Users cannot post properties for sale."}
                    {profile.role === "owner" && "Requires Aadhaar or PAN verification to post properties."}
                    {profile.role === "builder" && "Requires Firm details & Admin Approval to unlock builder dashboard features."}
                    {profile.role === "dealer" && "Requires Agency details & Admin Approval to unlock agent features."}
                  </p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-[#8c4bdc]" />
                  <h2 className="text-xl font-bold text-slate-800">Basic Contact Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address <span className="text-xs text-slate-400 font-normal">(Non-editable)</span>
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl outline-none cursor-not-allowed text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* OWNER SPECIFIC KYC SECTION */}
              {profile.role === "owner" && (
                <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200 space-y-6">
                  <div className="flex items-center gap-2 border-b border-emerald-200 pb-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-emerald-900">Owner Identification (Mandatory: Aadhaar or PAN)</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={profile.kyc.aadhaarNumber}
                        onChange={handleKycChange}
                        placeholder="12-digit Aadhaar Number"
                        className="w-full px-4 py-3 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                        PAN Card Number
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={profile.kyc.panNumber}
                        onChange={handleKycChange}
                        placeholder="10-character PAN (e.g. ABCDE1234F)"
                        className="w-full px-4 py-3 bg-white border border-emerald-300 rounded-xl uppercase focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* BUILDER SPECIFIC DETAILS SECTION */}
              {profile.role === "builder" && (
                <div className="bg-purple-50/60 p-6 rounded-2xl border border-purple-200 space-y-6">
                  <div className="flex items-center gap-2 border-b border-purple-200 pb-3">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-purple-900">Builder & Firm Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        Builder / Firm Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firmName"
                        value={profile.builderDetails.firmName}
                        onChange={handleBuilderChange}
                        placeholder="e.g. Apex Infratech Pvt Ltd"
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        Completed Projects Count
                      </label>
                      <input
                        type="number"
                        name="completedProjectsCount"
                        value={profile.builderDetails.completedProjectsCount}
                        onChange={handleBuilderChange}
                        placeholder="e.g. 10"
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        Running Projects Names & Count
                      </label>
                      <input
                        type="text"
                        name="runningProjectsNames"
                        value={profile.builderDetails.runningProjectsNames}
                        onChange={handleBuilderChange}
                        placeholder="e.g. Apex Royal, Green Towers (Total 4)"
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        Upcoming Projects
                      </label>
                      <input
                        type="text"
                        name="upcomingProjects"
                        value={profile.builderDetails.upcomingProjects}
                        onChange={handleBuilderChange}
                        placeholder="e.g. Celestial Palms"
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        Registered Office Address
                      </label>
                      <input
                        type="text"
                        name="officeAddress"
                        value={profile.builderDetails.officeAddress}
                        onChange={handleBuilderChange}
                        placeholder="Full Office Address"
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        RERA Number
                      </label>
                      <input
                        type="text"
                        name="reraNumber"
                        value={profile.builderDetails.reraNumber}
                        onChange={handleBuilderChange}
                        placeholder="UPRERA-12345678"
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={profile.builderDetails.gstNumber}
                        onChange={handleBuilderChange}
                        placeholder="09ABCDE1234F1Z5"
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl uppercase focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        PAN Card Number
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={profile.builderDetails.panNumber}
                        onChange={handleBuilderChange}
                        placeholder="ABCDE1234F"
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl uppercase focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-purple-800 uppercase tracking-wider mb-2">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={profile.builderDetails.aadhaarNumber}
                        onChange={handleBuilderChange}
                        placeholder="12-digit Aadhaar"
                        className="w-full px-4 py-3 bg-white border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* DEALER SPECIFIC DETAILS SECTION */}
              {profile.role === "dealer" && (
                <div className="bg-amber-50/60 p-6 rounded-2xl border border-amber-200 space-y-6">
                  <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
                    <Briefcase className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-bold text-amber-900">Dealer & Agency Profile (Only Agency Name and one is required from RERA , GST , PAN , Adhaar )</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        Agency / Firm Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="agencyName"
                        value={profile.dealerDetails.agencyName}
                        onChange={handleDealerChange}
                        placeholder="Sharma Realty Consultancy"
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="experienceYears"
                        value={profile.dealerDetails.experienceYears}
                        onChange={handleDealerChange}
                        placeholder="e.g. 8"
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        Operating Areas & Cities
                      </label>
                      <input
                        type="text"
                        name="operatingAreas"
                        value={profile.dealerDetails.operatingAreas}
                        onChange={handleDealerChange}
                        placeholder="Noida Sector 62, Indirapuram, Vaishali, Crossing Republik"
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        Office Address
                      </label>
                      <input
                        type="text"
                        name="officeAddress"
                        value={profile.dealerDetails.officeAddress}
                        onChange={handleDealerChange}
                        placeholder="Shop 12, Main Market, Sector 18, Noida"
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        License Number / RERA Agent Reg.
                      </label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={profile.dealerDetails.licenseNumber}
                        onChange={handleDealerChange}
                        placeholder="REA-NOD-2021-9988"
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        GST Number
                      </label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={profile.dealerDetails.gstNumber}
                        onChange={handleDealerChange}
                        placeholder="09LMNOP9876Q1Z3"
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl uppercase focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        PAN Card Number
                      </label>
                      <input
                        type="text"
                        name="panNumber"
                        value={profile.dealerDetails.panNumber}
                        onChange={handleDealerChange}
                        placeholder="LMNOP9876Q"
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl uppercase focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        name="aadhaarNumber"
                        value={profile.dealerDetails.aadhaarNumber}
                        onChange={handleDealerChange}
                        placeholder="12-digit Aadhaar"
                        className="w-full px-4 py-3 bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address Details */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="w-5 h-5 text-[#c04b7e]" />
                  <h2 className="text-xl font-bold text-slate-800">Address Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      House / Flat / Building No
                    </label>
                    <input
                      type="text"
                      name="houseNo"
                      value={profile.address.houseNo}
                      onChange={handleAddressChange}
                      placeholder="e.g. A-123"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Street Name
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={profile.address.street}
                      onChange={handleAddressChange}
                      placeholder="e.g. MG Road"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Locality / Area
                    </label>
                    <input
                      type="text"
                      name="locality"
                      value={profile.address.locality}
                      onChange={handleAddressChange}
                      placeholder="e.g. Sector 62"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profile.address.city}
                      onChange={handleAddressChange}
                      placeholder="Noida / Ghaziabad"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={profile.address.state}
                      onChange={handleAddressChange}
                      placeholder="Uttar Pradesh"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={profile.address.pincode}
                      onChange={handleAddressChange}
                      placeholder="201301"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#8c4bdc]/20 focus:border-[#8c4bdc] outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
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
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#8c4bdc] to-[#c04b7e] hover:from-[#7b3ac5] hover:to-[#ae3a6d] text-white px-8 py-3.5 rounded-xl font-bold transition shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                  {saving ? "Saving Changes..." : "Save Profile & Details"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
