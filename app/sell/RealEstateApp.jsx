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

const RealEstateApp = () => {
  const [currentPage, setCurrentPage] = useState("sell");
  const [favorites, setFavorites] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [token, setToken] = useState("");

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

  // const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";
  const databaseUrl = "http://localhost:5000";

  const [sellForm, setSellForm] = useState({
    title: "",
    description: "",
    purpose: "sell",
    propertyType: "apartment",
    price: "",
    area: "",
    bedrooms: "1",
    bathrooms: "1",
    furnishing: "unfurnished",
    address: "",
    images: [],
    videos: [],
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
  });

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const handleSellFormChange = (field, value) => {
    setSellForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Check if total media (images + videos) will exceed 15
    const currentMediaCount = sellForm.images.length + sellForm.videos.length;
    if (currentMediaCount + files.length > 15) {
      alert(
        `अधिकतम 15 इमेज/वीडियो अपलोड कर सकते हैं। आप ${
          15 - currentMediaCount
        } और अपलोड कर सकते हैं।`
      );
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Upload to backend
      const response = await fetch(`${databaseUrl}/api/media/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Separate images and videos based on type from response
        const newImages = [];
        const newVideos = [];

        data.data.media.forEach((item) => {
          if (item.type === "image") {
            newImages.push(item.url);
          } else if (item.type === "video") {
            newVideos.push(item.url);
          }
        });

        setSellForm((prev) => ({
          ...prev,
          images: [...prev.images, ...newImages],
          videos: [...prev.videos, ...newVideos],
        }));
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("अपलोड में समस्या आई। कृपया दोबारा प्रयास करें।");
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

  const handleSubmitProperty = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        alert("कृपया पहले लॉगिन करें");
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
          price: Number(sellForm.price),
          area: Number(sellForm.area),
          bedrooms: Number(sellForm.bedrooms),
          bathrooms: Number(sellForm.bathrooms),
          furnishing: sellForm.furnishing,
          address: sellForm.address,
          images: allMedia, // Send all media URLs
          ownerName: sellForm.ownerName,
          ownerPhone: sellForm.ownerPhone,
          ownerEmail: sellForm.ownerEmail,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitSuccess(true);

        // Reset form
        setSellForm({
          title: "",
          description: "",
          purpose: "sell",
          propertyType: "apartment",
          price: "",
          area: "",
          bedrooms: "1",
          bathrooms: "1",
          furnishing: "unfurnished",
          address: "",
          images: [],
          videos: [],
          ownerName: "",
          ownerPhone: "",
          ownerEmail: "",
        });

        setTimeout(() => {
          setSubmitSuccess(false);
          setCurrentPage("buy");
        }, 3000);
      } else {
        alert(data.message || "प्रॉपर्टी सबमिट करने में समस्या आई");
      }
    } catch (error) {
      console.error(error);
      alert("सर्वर में समस्या है। कृपया बाद में प्रयास करें।");
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
                सफलता! आपकी प्रॉपर्टी सफलतापूर्वक सबमिट हो गई है। आपको खरीद पेज
                पर रीडायरेक्ट किया जा रहा है...
              </span>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                अपनी प्रॉपर्टी बेचें
              </h2>
              <p className="text-gray-600">
                अपनी प्रॉपर्टी की जानकारी भरें और हजारों खरीदारों तक पहुंचें
              </p>
            </div>

            <div className="space-y-6">
              {/* Property Images & Videos - Separate Sections */}
              <div className="space-y-6">
                {/* Images Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      📸 प्रॉपर्टी की तस्वीरें
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {sellForm.images.length} इमेज अपलोड की गई
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
                              इमेज अपलोड
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
                      🎥 प्रॉपर्टी के वीडियो
                    </label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {sellForm.videos.length} वीडियो अपलोड किया गया
                    </span>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {/* Display Videos */}
                    {sellForm.videos.map((video, index) => (
                      <div key={`vid-${index}`} className="relative group">
                        <video
                          src={video}
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
                              वीडियो अपलोड
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
                      कुल {sellForm.images.length + sellForm.videos.length}/15
                      मीडिया
                    </span>
                    {" • "}
                    {sellForm.images.length} इमेज और {sellForm.videos.length}{" "}
                    वीडियो अपलोड किया गया
                  </p>
                </div>
              </div>

              {/* Property Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  प्रॉपर्टी का शीर्षक *
                </label>
                <input
                  type="text"
                  required
                  value={sellForm.title}
                  onChange={(e) =>
                    handleSellFormChange("title", e.target.value)
                  }
                  placeholder="जैसे: आधुनिक 3BHK फ्लैट"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Property Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  विवरण *
                </label>
                <textarea
                  required
                  value={sellForm.description}
                  onChange={(e) =>
                    handleSellFormChange("description", e.target.value)
                  }
                  placeholder="अपनी प्रॉपर्टी के बारे में विस्तार से बताएं..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Property Type and Purpose */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    प्रॉपर्टी टाइप *
                  </label>
                  <select
                    required
                    value={sellForm.propertyType}
                    onChange={(e) =>
                      handleSellFormChange("propertyType", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="apartment">अपार्टमेंट</option>
                    <option value="villa">विला</option>
                    <option value="house">हाउस</option>
                    <option value="penthouse">पेंटहाउस</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    उद्देश्य *
                  </label>
                  <select
                    required
                    value={sellForm.purpose}
                    onChange={(e) =>
                      handleSellFormChange("purpose", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="sell">बिक्री</option>
                    <option value="rent">किराया</option>
                  </select>
                </div>
              </div>

              {/* Location and Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    स्थान *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.address}
                    onChange={(e) =>
                      handleSellFormChange("address", e.target.value)
                    }
                    placeholder="जैसे: सेक्टर 62, नोएडा"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    कीमत (₹) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sellForm.price}
                    onChange={(e) =>
                      handleSellFormChange("price", e.target.value)
                    }
                    placeholder="जैसे: 8500000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Beds, Baths & Area */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    बेडरूम *
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    बाथरूम *
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    क्षेत्र (sq.ft) *
                  </label>
                  <input
                    type="number"
                    required
                    value={sellForm.area}
                    onChange={(e) =>
                      handleSellFormChange("area", e.target.value)
                    }
                    placeholder="जैसे: 1450"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  फर्निशिंग *
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

              {/* Owner Details */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  मालिक की जानकारी
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      मालिक का नाम
                    </label>
                    <input
                      type="text"
                      value={sellForm.ownerName}
                      onChange={(e) =>
                        handleSellFormChange("ownerName", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="नाम"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      फोन नंबर
                    </label>
                    <input
                      type="tel"
                      value={sellForm.ownerPhone}
                      onChange={(e) =>
                        handleSellFormChange("ownerPhone", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="मोबाइल नंबर"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ईमेल (वैकल्पिक)
                    </label>
                    <input
                      type="email"
                      value={sellForm.ownerEmail}
                      onChange={(e) =>
                        handleSellFormChange("ownerEmail", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="ईमेल"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Link
                  href={"/"}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  रद्द करें
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
                      सबमिट हो रहा है...
                    </>
                  ) : (
                    "सबमिट करें"
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
