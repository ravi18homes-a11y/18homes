"use client";
import React, { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

const RealEstateApp = () => {
  const [currentPage, setCurrentPage] = useState("sell"); 

  const [favorites, setFavorites] = useState([]);

  const [sellForm, setSellForm] = useState({
    title: "",
    description: "",
    propertyType: "apartment",
    price: "",
    location: "",
    bedrooms: "1",
    bathrooms: "1",
    area: "",
    status: "ready",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    images: [],
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setSellForm((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls].slice(0, 5), // Max 5 images
    }));
  };

  const removeImage = (index) => {
    setSellForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitProperty = (e) => {
    e.preventDefault();

    const newProperty = {
      id: properties.length + 1,
      title: sellForm.title,
      location: sellForm.location,
      price: parseInt(sellForm.price),
      bedrooms: parseInt(sellForm.bedrooms),
      bathrooms: parseInt(sellForm.bathrooms),
      area: parseInt(sellForm.area),
      type: sellForm.propertyType,
      image:
        sellForm.images[0] ||
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
      status:
        sellForm.status === "ready" ? "Ready to Move" : "Under Construction",
      featured: false,
      userSubmitted: true,
      description: sellForm.description,
      ownerName: sellForm.ownerName,
      ownerPhone: sellForm.ownerPhone,
      ownerEmail: sellForm.ownerEmail,
      allImages: sellForm.images,
    };

    setProperties((prev) => [newProperty, ...prev]);
    setSubmitSuccess(true);

    // Reset form
    setSellForm({
      title: "",
      description: "",
      propertyType: "apartment",
      price: "",
      location: "",
      bedrooms: "1",
      bathrooms: "1",
      area: "",
      status: "ready",
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
      images: [],
    });


    setTimeout(() => {
      setSubmitSuccess(false);
      setCurrentPage("buy");
    }, 3000);
  };


  return (
    <div className="min-h-screen bg-gray-50">
 
      <header className="bg-white shadow-sm  mt-20">
       
      </header>

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

            <form onSubmit={handleSubmitProperty} className="space-y-6">
              {/* Property Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  प्रॉपर्टी की तस्वीरें (अधिकतम 5)
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {sellForm.images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img}
                        alt={`Property ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {sellForm.images.length < 5 && (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-red-500 hover:bg-red-50">
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">अपलोड</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
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

              {/* Property Type and Status */}
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
                    स्थिति *
                  </label>
                  <select
                    required
                    value={sellForm.status}
                    onChange={(e) =>
                      handleSellFormChange("status", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="ready">Ready to Move</option>
                    <option value="construction">Under Construction</option>
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
                    value={sellForm.location}
                    onChange={(e) =>
                      handleSellFormChange("location", e.target.value)
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
                    बेडरूम
                  </label>
                  <select
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
                    बाथरूम
                  </label>
                  <select
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
                    क्षेत्र (sq.ft)
                  </label>
                  <input
                    type="number"
                    value={sellForm.area}
                    onChange={(e) =>
                      handleSellFormChange("area", e.target.value)
                    }
                    placeholder="जैसे: 1450"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Owner Details */}
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

              <div className="flex justify-end gap-3">
                <Link href={"/"} 
                                  
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  रद्द करें
                </Link>

                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  सबमिट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateApp;
