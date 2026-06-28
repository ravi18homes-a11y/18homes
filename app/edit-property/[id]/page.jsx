"use client";
import React, { useEffect, useState, use } from "react";
import {
  X,
  Upload,
  Camera,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/app/COMMON/Navbar";
import Footer from "@/app/COMMON/Footer";
import { toast } from "react-hot-toast";

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  let cleaned = String(priceStr).replace(/[₹,\s]/g, "").toLowerCase();
  
  const match = cleaned.match(/^([\d.]+)([a-z]*)$/);
  if (!match) {
    let num = parseFloat(cleaned);
    if (isNaN(num)) return 0;
    if (cleaned.includes("cr") || cleaned.includes("crore")) return num * 10000000;
    if (cleaned.includes("lakh") || cleaned.includes("lac") || cleaned.includes("l")) return num * 100000;
    if (cleaned.includes("k") || cleaned.includes("thousand")) return num * 1000;
    return num;
  }
  
  const numVal = parseFloat(match[1]);
  const suffix = match[2];
  if (isNaN(numVal)) return 0;
  
  if (suffix.includes("cr") || suffix.includes("crore")) return numVal * 10000000;
  if (suffix.includes("lakh") || suffix.includes("lac") || suffix.includes("l")) return numVal * 100000;
  if (suffix.includes("k") || suffix.includes("thousand")) return numVal * 1000;
  return numVal;
};

const EditPropertyApp = ({ params }) => {
  // Extract id from params Promise in Next.js 15+
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);

  const [token, setToken] = useState("");
  const router = useRouter();

  // Track auth state from localStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        setToken(storedToken);
        if (!storedToken) {
          router.push("/login-signup");
        }
      } catch (e) {
        setToken("");
        router.push("/login-signup");
      }
    };

    checkAuth();
  }, [router]);

  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const [sellForm, setSellForm] = useState({
    title: "",
    description: "",
    purpose: "sell",
    propertyType: "apartment",
    commercialType: "",
    commercialTypeCustom: "",
    isHighRise: false,
    floorNo: "",
    totalFloors: "",
    price: "",
    area: [{ size: "", unit: "sqft" }],
    bedrooms: "1",
    bathrooms: "1",
    furnishing: "unfurnished",
    address: "",
    images: [],
    videos: [],
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    listedBy: "owner",
    isSold: false,
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const res = await fetch(`${databaseUrl}/api/properties/${id}`);
        if (res.ok) {
          const data = await res.json();
          const property = data.data || data; // handle different api response structures

          setSellForm({
            title: property.title || "",
            description: property.description || "",
            purpose: property.purpose || "sell",
            propertyType: property.propertyType || "apartment",
            commercialType: property.commercialType || "",
            commercialTypeCustom: property.commercialTypeCustom || "",
            isHighRise: property.isHighRise || false,
            floorNo: property.floorNo || "",
            totalFloors: property.totalFloors || "",
            price: property.priceText || property.priceValue || property.price || "",
            area: [{
              size: property.area?.size || (typeof property.area === 'number' ? property.area : ""),
              unit: property.area?.unit || "sqft"
            }],
            bedrooms: (property.bedrooms || "1").toString(),
            bathrooms: (property.bathrooms || "1").toString(),
            furnishing: property.furnishing || "unfurnished",
            address: property.address?.city || property.address?.locality || (typeof property.address === 'string' ? property.address : ""),
            images: property.images?.filter(media => !media.endsWith('.mp4')) || [],
            videos: property.images?.filter(media => media.endsWith('.mp4')) || [], // assuming videos were mixed in images array or separate
            ownerName: property.owner?.name || property.ownerName || "",
            ownerPhone: property.owner?.phone || property.ownerPhone || "",
            ownerEmail: property.owner?.email || property.ownerEmail || "",
            listedBy: property.listedBy || "owner",
            isSold: property.isSold || false,
          });
        } else {
          toast.error("Could not fetch property details.");
          router.push("/my-properties");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error("An error occurred while fetching the property.");
        router.push("/my-properties");
      } finally {
        setIsLoadingProperty(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id, databaseUrl, router]);

  const handleSellFormChange = (field, value) => {
    setSellForm((prev) => ({ ...prev, [field]: value }));
  };

  const CLOUDINARY_CLOUD_NAME = "domwj0m7s";
  const CLOUDINARY_UPLOAD_PRESET = "18homes_unsigned";

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "18homes/media");

    const isVideo = file.type.startsWith("video");
    const resourceType = isVideo ? "video" : "image";

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!res.ok) {
      throw new Error("Cloudinary upload failed");
    }

    return await res.json();
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const currentMediaCount = sellForm.images.length + sellForm.videos.length;

    if (currentMediaCount + files.length > 15) {
      toast.error("You can upload a maximum of 15 images/videos");
      return;
    }

    setIsUploading(true);

    try {
      const uploadedImages = [];
      const uploadedVideos = [];

      for (const file of files) {
        const result = await uploadToCloudinary(file);

        if (file.type.startsWith("image")) {
          uploadedImages.push(result.secure_url);
        } else if (file.type.startsWith("video")) {
          uploadedVideos.push(result.secure_url);
        }
      }

      setSellForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
        videos: [...prev.videos, ...uploadedVideos],
      }));
      toast.success("Media uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Cloudinary upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    setSellForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeVideo = (index) => {
    setSellForm((prev) => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index),
    }));
  };

  const showBedrooms =
    sellForm.propertyType !== "plot" &&
    sellForm.propertyType !== "shop" &&
    sellForm.propertyType !== "office" &&
    sellForm.propertyType !== "commercial";
  const showBathrooms =
    sellForm.propertyType !== "plot" &&
    sellForm.propertyType !== "shop" &&
    sellForm.commercialType !== "commercial land";
  const showFurnishing =
    sellForm.propertyType !== "plot" &&
    sellForm.commercialType !== "commercial land";
  const areaColSpan =
    showBedrooms && showBathrooms
      ? ""
      : showBedrooms || showBathrooms
        ? "md:col-span-2"
        : "md:col-span-3";

  const handleSubmitProperty = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentToken = localStorage.getItem("authToken");

      if (!currentToken) {
        toast.error("Please login first");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`${databaseUrl}/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          title: sellForm.title,
          description: sellForm.description,
          purpose: sellForm.purpose,
          propertyType: sellForm.propertyType,
          commercialType: sellForm.propertyType === "commercial" ? sellForm.commercialType : undefined,
          commercialTypeCustom: (sellForm.propertyType === "commercial" && sellForm.commercialType === "other") ? sellForm.commercialTypeCustom : undefined,
          isHighRise: (sellForm.propertyType === "flat" || sellForm.propertyType === "apartment") ? sellForm.isHighRise : false,
          floorNo: (sellForm.propertyType === "flat" || sellForm.propertyType === "apartment" || sellForm.propertyType === "office" || sellForm.propertyType === "shop" || sellForm.propertyType === "commercial") ? sellForm.floorNo : undefined,
          totalFloors: (sellForm.propertyType === "flat" || sellForm.propertyType === "apartment" || sellForm.propertyType === "office" || sellForm.propertyType === "shop" || sellForm.propertyType === "commercial") ? sellForm.totalFloors : undefined,

          priceText: sellForm.price,
          priceValue: parsePrice(sellForm.price),

          area: {
            size: sellForm.area[0]?.size || "",
            unit: sellForm.area[0]?.unit || "sqft",
          },
          bedrooms: showBedrooms ? Number(sellForm.bedrooms) : 0,
          bathrooms: showBathrooms ? Number(sellForm.bathrooms) : 0,
          furnishing: sellForm.furnishing,

          address: {
            city: sellForm.address,
            locality: sellForm.address,
          },

          images: [...sellForm.images, ...sellForm.videos],
          listedBy: sellForm.listedBy || "owner",
          isSold: sellForm.isSold,

          // Allow passing owner info if supported by the put endpoint
          owner: {
            name: sellForm.ownerName,
            phone: sellForm.ownerPhone,
            email: sellForm.ownerEmail,
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        toast.success("Property updated successfully!");
        setTimeout(() => {
          router.push("/my-properties");
        }, 1500);
      } else {
        toast.error(data.message || "Error updating property");
      }
    } catch (error) {
      console.error(error);
      toast.error("There is a server issue. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProperty) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-12 bg-gray-50">
        {/* Header padding space equivalent */}
        <header className="bg-transparent mt-20"></header>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Success Message */}
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-semibold">
                Success! Your property has been successfully updated. Redirecting...
              </span>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Edit Property
              </h2>
              <p className="text-gray-600">
                Update the details of your property listing
              </p>
            </div>

            <form onSubmit={handleSubmitProperty} className="space-y-6">
              {/* Property Images & Videos - Separate Sections */}
              <div className="space-y-6">
                {/* Images Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      📸 Property Images
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {sellForm.images.length} images
                    </span>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {/* Display Images */}
                    {sellForm.images.map((img, index) => (
                      <div key={`img-${index}`} className="relative group">
                        <img
                          src={img}
                          alt={`Property ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Image Upload Button */}
                    {sellForm.images.length + sellForm.videos.length < 15 && (
                      <label className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-colors">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                        ) : (
                          <>
                            <Camera className="w-6 h-6 text-blue-500" />
                            <span className="text-xs text-blue-600 mt-1 font-medium">
                              Upload Image
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Videos Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      🎥 Property Videos
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {sellForm.videos.length} videos
                    </span>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {/* Display Videos */}
                    {sellForm.videos.map((video, index) => (
                      <div key={`vid-${index}`} className="relative group">
                        <video
                          src={video}
                          muted
                          preload="metadata"
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center pointer-events-none">
                          <span className="text-white text-xs font-bold bg-red-600 px-2 py-1 rounded">
                            VIDEO
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {/* Video Upload Button */}
                    {sellForm.images.length + sellForm.videos.length < 15 && (
                      <label className="border-2 border-dashed border-purple-300 bg-purple-50 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-100 transition-colors">
                        {isUploading ? (
                          <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-purple-500" />
                            <span className="text-xs text-purple-600 mt-1 font-medium">
                              Upload Video
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Total Media Count */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-gray-600 text-center">
                    <span className="font-semibold text-gray-800">
                      Total {sellForm.images.length + sellForm.videos.length}/15 media
                    </span>
                    {" • "}
                    {sellForm.images.length} images and {sellForm.videos.length} videos
                  </p>
                </div>
              </div>

              {/* Property Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <input
                  type="text"
                  required
                  value={sellForm.title}
                  onChange={(e) => handleSellFormChange("title", e.target.value)}
                  placeholder="e.g. Modern 3BHK Flat"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Property Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={sellForm.description}
                  onChange={(e) => handleSellFormChange("description", e.target.value)}
                  placeholder="Explain your property in detail..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Property Type and Purpose */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Type *
                  </label>
                  <select
                    required
                    value={sellForm.propertyType}
                    onChange={(e) => handleSellFormChange("propertyType", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="flat">Flat</option>
                    <option value="house">House</option>
                    <option value="plot">Plot</option>
                    <option value="shop">Shop</option>
                    <option value="office">Office</option>
                    <option value="apartment">Apartment</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

              {sellForm.propertyType === "commercial" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commercial Type *
                  </label>
                  <select
                    required
                    value={sellForm.commercialType}
                    onChange={(e) => handleSellFormChange("commercialType", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="" disabled hidden>Select Commercial Type</option>
                    <option value="hotel">Hotel</option>
                    <option value="hospital">Hospital</option>
                    <option value="school">School</option>
                    <option value="pg">P.G</option>
                    <option value="lease land">Lease Land</option>
                    <option value="commercial land">Commercial Land</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {sellForm.propertyType === "commercial" && sellForm.commercialType === "other" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Commercial Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.commercialTypeCustom || ""}
                    onChange={(e) => handleSellFormChange("commercialTypeCustom", e.target.value)}
                    placeholder="e.g. Warehouse, Showroom"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {(sellForm.propertyType === "flat" || sellForm.propertyType === "apartment") && (
                <div className="flex items-center gap-2 pt-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="isHighRise"
                    checked={sellForm.isHighRise}
                    onChange={(e) => handleSellFormChange("isHighRise", e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isHighRise" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                    Flat in High-Rise Building
                  </label>
                </div>
              )}

              {(sellForm.propertyType === "flat" ||
                sellForm.propertyType === "apartment" ||
                sellForm.propertyType === "office" ||
                sellForm.propertyType === "shop" ||
                sellForm.propertyType === "commercial") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor Number
                    </label>
                    <input
                      type="text"
                      value={sellForm.floorNo || ""}
                      onChange={(e) => handleSellFormChange("floorNo", e.target.value)}
                      placeholder="e.g. 5 (or Ground, Basement)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Floors in Building
                    </label>
                    <input
                      type="text"
                      value={sellForm.totalFloors || ""}
                      onChange={(e) => handleSellFormChange("totalFloors", e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose *
                  </label>
                  <select
                    required
                    value={sellForm.purpose}
                    onChange={(e) => handleSellFormChange("purpose", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="sell">Sell</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>
              </div>

              {/* Location and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.address}
                    onChange={(e) => handleSellFormChange("address", e.target.value)}
                    placeholder="e.g. Sector 62, Noida"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.price}
                    onChange={(e) => handleSellFormChange("price", e.target.value)}
                    placeholder="e.g. 25 Lakh or 2.5 Cr"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Beds, Baths & Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {showBedrooms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bedrooms *
                    </label>
                    <select
                      required
                      value={sellForm.bedrooms}
                      onChange={(e) => handleSellFormChange("bedrooms", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                )}

                {showBathrooms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bathrooms *
                    </label>
                    <select
                      required
                      value={sellForm.bathrooms}
                      onChange={(e) => handleSellFormChange("bathrooms", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                )}

                <div className={areaColSpan}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.area[0]?.size}
                    onChange={(e) =>
                      handleSellFormChange("area", [
                        {
                          ...sellForm.area[0],
                          size: e.target.value,
                        },
                      ])
                    }
                    placeholder="e.g. 1450 sqft or 150 sq yards"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Furnishing */}
              {showFurnishing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing *
                  </label>
                  <select
                    required
                    value={sellForm.furnishing}
                    onChange={(e) => handleSellFormChange("furnishing", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi Furnished</option>
                    <option value="fully-furnished">Fully Furnished</option>
                  </select>
                </div>
              )}

              {/* Listed By and Status */}
              <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listed By *
                  </label>
                  <select
                    required
                    value={sellForm.listedBy}
                    onChange={(e) =>
                      handleSellFormChange("listedBy", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="owner">Owner</option>
                    <option value="dealer">Dealer / Broker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Listing Status *
                  </label>
                  <select
                    required
                    value={sellForm.isSold ? "sold" : "available"}
                    onChange={(e) =>
                      handleSellFormChange("isSold", e.target.value === "sold")
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                  >
                    <option value="available" className="text-green-600">Available</option>
                    <option value="sold" className="text-red-600 font-bold">Sold Out</option>
                  </select>
                </div>
              </div>

              {/* Owner Details */}
              {/* <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Owner Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner's Name
                    </label>
                    <input
                      type="text"
                      value={sellForm.ownerName}
                      onChange={(e) => handleSellFormChange("ownerName", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={sellForm.ownerPhone}
                      onChange={(e) => handleSellFormChange("ownerPhone", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Mobile Number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={sellForm.ownerEmail}
                      onChange={(e) => handleSellFormChange("ownerEmail", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Email"
                    />
                  </div>
                </div>
              </div> */}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Link
                  href="/my-properties"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditPropertyApp;
