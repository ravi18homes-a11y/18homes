"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  Filter,
  Heart,
  ChevronDown,
  X,
  Upload,
  Plus,
  Camera,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const RealEstateApp = () => {
  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const [currentPage, setCurrentPage] = useState("sell");
  const [favorites, setFavorites] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [token, setToken] = useState("");
  const router = useRouter();

  const [shouldBoost, setShouldBoost] = useState(false);
  const [boostPlan, setBoostPlan] = useState("7days");
  const [boostPlans, setBoostPlans] = useState([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${databaseUrl}/api/properties/boost/plans`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setBoostPlans(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching boost plans:", err);
      }
    };
    fetchPlans();
  }, [databaseUrl]);

  const activePlans = boostPlans.length > 0 ? boostPlans : [
    { key: "7days", name: "7 Days Boost", price: 19, durationDays: 7 },
    { key: "15days", name: "15 Days Boost", price: 49, durationDays: 15 },
    { key: "30days", name: "30 Days Boost", price: 99, durationDays: 30 },
  ];

  // Track auth state from localStorage (login saves 'authToken')
  useEffect(() => {
    const checkAuth = () => {
      try {
        setToken(localStorage.getItem("authToken"));
      } catch (e) {
        setToken("");
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // const databaseUrl = "http://localhost:5000";

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
    priceNumber: "",
    priceUnit: "Lac",
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
    ageOfProperty: "New Construction",
    balconies: "0",
    amenities: [],
    distances: {
      busStand: "",
      metroStation: "",
      atm: "",
      school: "",
      hospital: "",
    },
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

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
      const token = localStorage.getItem("authToken");

      if (!token) {
        toast.error("Please login first");
        setIsSubmitting(false);
        return;
      }

      // Combine images and videos for backend
      const allMedia = [...sellForm.images, ...sellForm.videos];

      const response = await fetch(`${databaseUrl}/api/properties`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

          priceText: `${sellForm.priceNumber} ${sellForm.priceUnit}`,
          priceValue: parsePrice(`${sellForm.priceNumber} ${sellForm.priceUnit}`),

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
          ageOfProperty: sellForm.ageOfProperty,
          balconies: Number(sellForm.balconies) || 0,
          amenities: sellForm.amenities,
          distances: sellForm.distances,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const createdProperty = data.data;
        const propertyId = createdProperty?._id || createdProperty?.id;

        const resetForm = () => {
          setSellForm({
            title: "",
            description: "",
            purpose: "sell",
            propertyType: "apartment",
            commercialType: "",
            commercialTypeCustom: "",
            isHighRise: false,
            floorNo: "",
            totalFloors: "",
            priceNumber: "",
            priceUnit: "Lac",
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
            ageOfProperty: "New Construction",
            balconies: "0",
            amenities: [],
            distances: {
              busStand: "",
              metroStation: "",
              atm: "",
              school: "",
              hospital: "",
            },
          });
        };

        if (shouldBoost && propertyId) {
          try {
            toast.loading("Initiating payment gateway...", { id: "boost-toast" });
            const orderRes = await fetch(`${databaseUrl}/api/properties/${propertyId}/boost/order`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ planKey: boostPlan }),
            });
            const orderData = await orderRes.json();

            if (!orderData.success) {
              throw new Error(orderData.message || "Failed to create order");
            }

            toast.dismiss("boost-toast");

            const options = {
              key: orderData.data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TAwig7RAJNiuHo",
              amount: orderData.data.amount,
              currency: orderData.data.currency,
              name: "18Homes",
              description: `Property Boost - ${boostPlan}`,
              order_id: orderData.data.orderId,
              handler: async function (response) {
                toast.loading("Verifying payment...", { id: "boost-toast" });
                try {
                  const verifyRes = await fetch(`${databaseUrl}/api/properties/${propertyId}/boost/verify`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      planKey: boostPlan,
                    }),
                  });
                  const verifyData = await verifyRes.json();
                  if (verifyData.success) {
                    toast.success("Property posted and boosted to Premium!", { id: "boost-toast" });
                    resetForm();
                    router.push("/my-properties");
                  } else {
                    toast.error("Payment verification failed. Property is listed without boost.", { id: "boost-toast" });
                    resetForm();
                    router.push("/my-properties");
                  }
                } catch (verifyErr) {
                  console.error(verifyErr);
                  toast.error("Error verifying payment. Property listed without boost.", { id: "boost-toast" });
                  resetForm();
                  router.push("/my-properties");
                }
              },
              modal: {
                ondismiss: function () {
                  toast.success("Property submitted successfully! (Boost canceled)", { duration: 5000 });
                  resetForm();
                  router.push("/my-properties");
                }
              },
              prefill: {
                name: localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).name : "",
                email: localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).email : "",
                contact: localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).phone : "",
              },
              theme: {
                color: "#7c3aed",
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
          } catch (boostError) {
            console.error(boostError);
            toast.error("Failed to boost property. Listing created successfully.", { id: "boost-toast" });
            resetForm();
            router.push("/my-properties");
          }
        } else {
          setSubmitSuccess(true);
          toast.success("Property submitted successfully!");
          resetForm();
          router.push("/buy");
        }
      } else {
        toast.error(data.message || "Error submitting property");
      }
    } catch (error) {
      console.error(error);
      toast.error("There is a server issue. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm mt-20"></header>

      {currentPage === "sell" && (
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
                Success! Your property has been successfully submitted.
                Redirecting you to the buy page...
              </span>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Sell Your Property
              </h2>
              <p className="text-gray-600">
                Fill in your property details and reach thousands of buyers
              </p>
            </div>

            <div className="space-y-6">
              {/* Property Images & Videos - Separate Sections */}
              <div className="space-y-6">
                {/* Images Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      📸 Property Images
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {sellForm.images.length} images uploaded
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
                      {sellForm.videos.length} videos uploaded
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
                      Total {sellForm.images.length + sellForm.videos.length}/15
                      media
                    </span>
                    {" • "}
                    {sellForm.images.length} images and {sellForm.videos.length}{" "}
                    videos uploaded
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
                  onChange={(e) =>
                    handleSellFormChange("title", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleSellFormChange("description", e.target.value)
                  }
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
                    onChange={(e) =>
                      handleSellFormChange("propertyType", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="flat">Flat</option>
                    <option value="house">House</option>
                    <option value="plot">Plot</option>
                    <option value="shop">Shop</option>
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
                      onChange={(e) =>
                        handleSellFormChange("commercialType", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleSellFormChange("commercialTypeCustom", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleSellFormChange("isHighRise", e.target.checked)
                      }
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
                          onChange={(e) =>
                            handleSellFormChange("floorNo", e.target.value)
                          }
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
                          onChange={(e) =>
                            handleSellFormChange("totalFloors", e.target.value)
                          }
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
                    onChange={(e) =>
                      handleSellFormChange("purpose", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleSellFormChange("address", e.target.value)
                    }
                    placeholder="e.g. Sector 62, Noida"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      required
                      value={sellForm.priceNumber}
                      onChange={(e) =>
                        handleSellFormChange("priceNumber", e.target.value)
                      }
                      placeholder="e.g. 2.5 or 25"
                      className="w-2/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <select
                      value={sellForm.priceUnit}
                      onChange={(e) =>
                        handleSellFormChange("priceUnit", e.target.value)
                      }
                      className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                      <option value="Thousand">Thousand</option>
                      <option value="Lac">Lakh / Lac</option>
                      <option value="Cr">Crore / Cr</option>
                    </select>
                  </div>
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
                      onChange={(e) =>
                        handleSellFormChange("bedrooms", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleSellFormChange("bathrooms", e.target.value)
                      }
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

              {/* Age of Property & Balconies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age of Property *
                  </label>
                  <select
                    required
                    value={sellForm.ageOfProperty}
                    onChange={(e) =>
                      handleSellFormChange("ageOfProperty", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Under Construction">Under Construction</option>
                    <option value="New Construction">New Construction</option>
                    <option value="1-5 Years">1-5 Years</option>
                    <option value="5-10 Years">5-10 Years</option>
                    <option value="More than 10 Years">More than 10 Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Balconies *
                  </label>
                  <select
                    required
                    value={sellForm.balconies}
                    onChange={(e) =>
                      handleSellFormChange("balconies", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
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
                    onChange={(e) =>
                      handleSellFormChange("furnishing", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi-furnished">Semi Furnished</option>
                    <option value="fully-furnished">Fully Furnished</option>
                  </select>
                </div>
              )}

              {/* Listed By */}
              <div className="border-t pt-6">
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
                      onChange={(e) =>
                        handleSellFormChange("ownerName", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleSellFormChange("ownerPhone", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleSellFormChange("ownerEmail", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Email"
                    />
                  </div>
                </div>
              </div> */}

              {/* Amenities Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Amenities (Select all that apply)(Optional)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[
                    "Garden",
                    "Reserve Parking",
                    "Visitor Parking",
                    "Lift",
                    "Security",
                    "Waste Disposal",
                    "Parks",
                    "24X7 Water",
                    "Kids Area",
                    "Bus Service",
                    "Piped Gas",
                    "ATM"
                  ].map((amenity) => {
                    const isChecked = sellForm.amenities.includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${isChecked
                            ? "bg-red-50 border-red-500 text-red-700 font-medium animate-pulse-subtle"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const nextAmenities = e.target.checked
                              ? [...sellForm.amenities, amenity]
                              : sellForm.amenities.filter((a) => a !== amenity);
                            handleSellFormChange("amenities", nextAmenities);
                          }}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Distances Section */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Distances to Key Facilities (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "busStand", label: "Bus Stand (e.g. 200 mtr)" },
                    { key: "metroStation", label: "Metro Station (e.g. 500 mtr)" },
                    { key: "atm", label: "ATM (e.g. Nearby)" },
                    { key: "school", label: "School (e.g. 600 mtr)" },
                    { key: "hospital", label: "Hospital (e.g. 2 KM)" }
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {item.label}
                      </label>
                      <input
                        type="text"
                        value={sellForm.distances[item.key] || ""}
                        onChange={(e) => {
                          const nextDistances = {
                            ...sellForm.distances,
                            [item.key]: e.target.value
                          };
                          handleSellFormChange("distances", nextDistances);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                        placeholder="Distance details"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Boost Property Option */}
              <label className="block text-sm bg-[blue] px-4 py-2 font-medium text-white mb-0">Optional</label>
              <div className="border-t border-purple-100 pt-6 mt-2 bg-gradient-to-r from-purple-50 to-indigo-50/50 p-6 rounded-2xl border border-purple-100/80">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="shouldBoost"
                    checked={shouldBoost}
                    onChange={(e) => setShouldBoost(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <div>
                    <label htmlFor="shouldBoost" className="text-base font-bold text-purple-900 select-none cursor-pointer flex items-center gap-2">
                      🚀 Boost this property to High Rated!
                    </label>
                    <p className="text-xs text-purple-600 mt-0.5">
                      High Rated (Boosted) properties rank at the very top of search results and appear in the homepage slider.
                    </p>
                  </div>
                </div>

                {shouldBoost && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 animate-fadeIn">
                    {activePlans.map((plan) => (
                      <div
                        key={plan.key}
                        onClick={() => setBoostPlan(plan.key)}
                        className={`border rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${boostPlan === plan.key
                          ? "bg-purple-600 text-white border-transparent shadow-lg shadow-purple-600/20 scale-105"
                          : "bg-white text-gray-700 border-purple-100 hover:border-purple-300 hover:shadow"
                          }`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wider opacity-85">
                          {plan.name}
                        </span>
                        <span className="text-2xl font-extrabold mt-2">
                          ₹{plan.price}
                        </span>
                        <span className="text-[10px] mt-1 opacity-75">
                          Valid for {plan.durationDays} days
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Link
                  href={"/"}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>

                <button
                  type="button"
                  onClick={handleSubmitProperty}
                  disabled={isSubmitting || isUploading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateApp;
