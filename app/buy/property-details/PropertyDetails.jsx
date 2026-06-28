"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Phone,
  Mail,
  Share2,
  CheckCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

// const staticProperties = [
//   {
//     id: "1",
//     title: "Modern 3BHK Flat",
//     location: "Sector 62, Noida",
//     price: 8500000,
//     bedrooms: 3,
//     bathrooms: 2,
//     area: 1450,
//     type: "apartment",
//     image:
//       "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
//     status: "Ready to Move",
//     featured: true,
//     description:
//       "This is a modern 3BHK flat with a comfortable lifestyle and wonderful amenities.",
//     owner: {
//       name: "Property Owner",
//       phone: "+91 98765 43210",
//       email: "owner@example.com",
//     },
//     images: [
//       "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
//       "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
//     ],
//   },
//   {
//     id: "2",
//     title: "Luxury Villa",
//     location: "Golf Course Road, Gurgaon",
//     price: 25000000,
//     bedrooms: 4,
//     bathrooms: 4,
//     area: 3200,
//     type: "villa",
//     image:
//       "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
//     status: "Under Construction",
//     featured: true,
//     description:
//       "This villa offers a luxurious lifestyle, featuring spacious rooms and a beautiful garden.",
//     owner: {
//       name: "Property Owner",
//       phone: "+91 98765 43210",
//       email: "owner@example.com",
//     },
//     images: [
//       "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
//       "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200",
//     ],
//   },
// ];

const PropertyDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "";

  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";

  const validImages = (property?.images || []).filter(
    (img) => img && !img.startsWith("blob:") && img.trim() !== "",
  );
  const images = validImages.length > 0 ? validImages : [DEFAULT_IMAGE];

  const getMediaThumbnail = (url) => {
    if (!url) return DEFAULT_IMAGE;
    const lowerUrl = url.toLowerCase();
    const videoExtensions = [".mp4", ".mov", ".avi", ".webm", ".mkv", ".3gp", ".ogg", ".ogv", ".wmv"];
    const isVideo = videoExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + "?"));
    
    if (isVideo) {
      return url.replace(/\.(mp4|mov|avi|webm|mkv|3gp|ogg|ogv|wmv)(?=\?|$)/i, ".jpg");
    }
    return url;
  };

  const formatAddress = (address) => {
    if (!address) return "Location not available";
    if (typeof address === "string") return address;
    if (typeof address === "object") {
      const parts = [
        address.locality,
        address.city,
        address.state,
        address.pincode,
      ]
        .filter(Boolean)
        .map((part) => String(part).trim());
      return parts.length ? parts.join(", ") : "Location not available";
    }
    return String(address);
  };

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      const apiUrl = databaseUrl
        ? `${databaseUrl}/api/properties/${id}`
        : `/api/properties/${id}`;

      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const transformedProperty = {
              ...data.data,
              area:
                typeof data.data.area === "object"
                  ? data.data.area.size || "Not specified"
                  : data.data.area || "Not specified",
              images: (data.data.images || []).filter(
                (img) => img && !img.startsWith("blob:") && img.trim() !== "",
              ),
              location: formatAddress(data.data.address || data.data.location),
            };
            setProperty(transformedProperty);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      }

      const fallbackProperty = staticProperties.find(
        (prop) => prop.id.toString() === id.toString(),
      );

      if (fallbackProperty) {
        setProperty({
          ...fallbackProperty,
          images: [fallbackProperty.image],
          location: formatAddress(fallbackProperty.location),
          description:
            fallbackProperty.description || "Description not available.",
        });
      }
    };

    fetchProperty().finally(() => setLoading(false));
  }, [id, databaseUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal) return;
      if (e.key === "Escape") {
        setShowImageModal(false);
      } else if (e.key === "ArrowLeft") {
        setModalImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        setModalImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageModal, images.length]);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchMove = (event) => {
    touchEndX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (distance > threshold) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    } else if (distance < -threshold) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex - 1 + images.length) % images.length,
      );
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handlePrevSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNextSlide = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const formatPrice = (price) => {
    if (typeof price === "object" && price !== null && price.unit) {
      return `${price.value} ${price.unit}`;
    }
    if (!price || price === 0) return "Min Price";

    // If price is a string and contains alphabetic characters
    if (typeof price === "string" && /[a-zA-Z]/.test(price)) {
      if (!price.includes("₹")) {
        return `₹ ${price}`;
      }
      return price;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice)) return price;
    if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    return `₹${(numPrice / 100000).toFixed(2)} Lac`;
  };

  const openVideo = (video) => {
    setCurrentVideo(video);
    setShowVideoModal(true);
  };

  const handleViewDetails = async () => {
    const userDataStr = localStorage.getItem("userData");
    const authToken = localStorage.getItem("authToken");
    
    if (!userDataStr || !authToken) {
      router.push("/login-signup");
      return;
    }
    
    setIsLoadingDetails(true);
    
    try {
      const parsedUser = JSON.parse(userDataStr);
      
      await fetch('/api/send-view-details-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: parsedUser,
          property: {
            ...property,
            formattedPrice: formatPrice(property.priceText || property.priceValue || property.price),
          }
        })
      });
      
      setShowDetails(true);
    } catch (error) {
      console.error("Error viewing details", error);
      setShowDetails(true);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Property not found</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[40px] bg-gray-50">
      {/* Back Button */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Go Back</span>
          </button>
        </div>
      </div>

      {/* Hero Image Section */}
      <div
        className="relative bg-gray-900"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {(() => {
          const currentMedia = images[currentImageIndex];
          const isVideo = currentMedia && [".mp4", ".mov", ".avi", ".webm", ".mkv", ".3gp", ".ogg", ".ogv", ".wmv"].some(ext => currentMedia.toLowerCase().endsWith(ext) || currentMedia.toLowerCase().includes(ext + "?"));
          return isVideo ? (
            <video
              src={currentMedia}
              controls
              poster={getMediaThumbnail(currentMedia)}
              className="w-full h-[500px] object-contain bg-black"
            />
          ) : (
            <img
              src={currentMedia}
              onError={(e) => (e.target.src = DEFAULT_IMAGE)}
              alt={property.title}
              className="w-full h-[500px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => {
                setModalImageIndex(currentImageIndex);
                setShowImageModal(true);
              }}
            />
          );
        })()}

        {/* Action Buttons */}
        {/* <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <Heart
              className={`w-6 h-6 ${isFavorite ? "fill-red-600 text-red-600" : "text-gray-600"}`}
            />
          </button>
          <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors">
            <Share2 className="w-6 h-6 text-gray-600" />
          </button>
        </div> */}

        {property.featured && (
          <span className="absolute top-4 left-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-full">
            Featured
          </span>
        )}

        {/* Slide Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-4 cursor-pointer top-1/2 transform -translate-y-1/2 p-2 bg-white/70 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-4 cursor-pointer top-1/2 transform -translate-y-1/2 p-2 bg-white/70 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Navigation Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all ${currentImageIndex === index
                  ? "bg-white w-8"
                  : "bg-white/50 w-2"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Price */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {property.isSold && (
                    <span className="px-4 py-2 rounded-full bg-red-600 text-white font-extrabold whitespace-nowrap self-start border border-white animate-pulse">
                      SOLD OUT
                    </span>
                  )}
                  {property.status && (
                    <span
                      className={`px-4 py-2 rounded-full text-white font-semibold whitespace-nowrap self-start ${property.status === "Ready to Move"
                        ? "bg-green-600"
                        : "bg-orange-600"
                        }`}
                    >
                      {property.status}
                    </span>
                  )}
                  <span className="px-4 py-2 rounded-full bg-blue-600 text-white font-semibold whitespace-nowrap self-start capitalize">
                    {property.propertyType === "commercial"
                      ? (property.commercialType === "other" && property.commercialTypeCustom
                        ? `Commercial - ${property.commercialTypeCustom}`
                        : (property.commercialType ? `Commercial - ${property.commercialType === "pg" ? "P.G" : property.commercialType}` : "Commercial"))
                      : property.propertyType || "Apartment"}
                  </span>
                  {property.isHighRise && (
                    <span className="px-4 py-2 rounded-full bg-indigo-600 text-white font-semibold whitespace-nowrap self-start">
                      High-Rise Building
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b">
                {property.propertyType !== "plot" &&
                  property.propertyType !== "shop" &&
                  property.propertyType !== "office" &&
                  property.propertyType !== "commercial" && (
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">
                        {property.bedrooms || 0} BHK
                      </span>
                    </div>
                  )}
                {property.propertyType !== "plot" &&
                  property.propertyType !== "shop" &&
                  property.commercialType !== "commercial land" &&
                  property.commercialType !== "lease land" && (
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold">
                        {property.bathrooms || 0} Bathrooms
                      </span>
                    </div>
                  )}
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">
                    {/^[0-9\s.,]+$/.test(String(property.area).trim())
                      ? `${property.area} sqft`
                      : property.area}
                  </span>
                </div>
                {property.floorNo && (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700">
                    <span>Floor no : {property.floorNo}{property.totalFloors ? `  Total floors : ${property.totalFloors}` : ""}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center flex-wrap gap-4">
                <span className="text-4xl font-bold text-red-600">
                  {formatPrice(property.priceText || property.priceValue || property.price)}
                </span>
                <span className="px-4 py-1.5 bg-gray-100 border border-gray-200 text-gray-700 text-sm font-semibold rounded-full">
                  Listed by: <span className="text-red-600 capitalize font-bold">{property.listedBy === "dealer" ? "Dealer / Broker" : "Owner"}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Photo Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images && images.length > 0 && images[0] !== DEFAULT_IMAGE ? (
                  images.map((media, index) => {
                    const videoExtensions = [".mp4", ".mov", ".avi", ".webm", ".mkv", ".3gp", ".ogg", ".ogv", ".wmv"];
                    const isVideo = media && videoExtensions.some(ext => media.toLowerCase().endsWith(ext) || media.toLowerCase().includes(ext + "?"));

                    return isVideo ? (
                      <video
                        key={index}
                        src={media}
                        controls
                        poster={getMediaThumbnail(media)}
                        className="w-full h-48 object-contain rounded-lg cursor-pointer bg-black"
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ) : (
                      <img
                        key={index}
                        src={media || DEFAULT_IMAGE}
                        alt={`Property ${index + 1}`}
                        onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setModalImageIndex(index);
                          setShowImageModal(true);
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-8">
                    <img
                      src={DEFAULT_IMAGE}
                      alt="Property"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <p className="text-gray-600 mt-4">
                      Real image not available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Videos */}
            {property.videos && property.videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Video Tour
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.videos.map((video) => (
                    <div
                      key={video.id}
                      className="relative cursor-pointer group"
                      onClick={() => openVideo(video)}
                    >
                      <img
                        src={video.thumbnail || DEFAULT_IMAGE}
                        alt={video.title}
                        onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center group-hover:bg-opacity-50 transition-all">
                        <Play className="w-16 h-16 text-white" />
                      </div>
                      <p className="mt-2 font-semibold text-gray-800">
                        {video.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Places */}
            {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Nearby Places
                </h2>
                <div className="space-y-3">
                  {property.nearbyPlaces.map((place, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                      <span className="text-gray-700 font-medium">
                        {place.name}
                      </span>
                      <span className="text-gray-600">{place.distance}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Agent */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Contact Us
              </h3>

              {showDetails ? (
                <>
                  {property.owner ? (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-2xl font-bold">
                            {property.owner.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {property.owner.name || "Seller"}
                          </p>
                          <p className="text-sm text-gray-600">Property Owner</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        {property.owner?.phone && (
                          <a
                            href={`tel:${property.owner.phone}`}
                            className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Phone className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-gray-700">
                              {property.owner.phone}
                            </span>
                          </a>
                        )}
                        {property.owner?.phone && (
                          <a
                            href={`https://wa.me/91${property.owner.phone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <FaWhatsapp className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">
                              {property.owner.phone}
                            </span>
                          </a>
                        )}

                        {property.owner?.email && (
                          <a
                            href={`mailto:${property.owner.email}`}
                            className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Mail className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <span className="text-gray-700 text-sm break-all">
                              {property.owner.email}
                            </span>
                          </a>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600 mb-6">
                      Contact information not available
                    </p>
                  )}

                  {property.owner?.phone ? (
                    <a
                      href={`tel:${property.owner.phone}`}
                      className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Call Now
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Phone unavailable
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Contact the Seller</h4>
                  <p className="text-gray-600 text-center text-sm mb-6 px-4">
                    Login to view the seller's phone number and email address directly.
                  </p>
                  <button 
                    onClick={handleViewDetails}
                    disabled={isLoadingDetails}
                    className="w-[90%] py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoadingDetails ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      "View Contact"
                    )}
                  </button>
                </div>
              )}

              {/* <button className="w-full mt-3 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                Send Message
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && currentVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">{currentVideo.title}</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={currentVideo.url}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image/Media Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/95 z-[999] flex flex-col items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setShowImageModal(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-[1000] cursor-pointer"
            aria-label="Close fullscreen view"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation Arrows inside modal */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
                }}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[1000] cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImageIndex((prevIndex) => (prevIndex + 1) % images.length);
                }}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[1000] cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Media Content */}
          <div
            className="max-w-[90%] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const modalMedia = images[modalImageIndex];
              const isVideo = modalMedia && [".mp4", ".mov", ".avi", ".webm", ".mkv", ".3gp", ".ogg", ".ogv", ".wmv"].some(ext => modalMedia.toLowerCase().endsWith(ext) || modalMedia.toLowerCase().includes(ext + "?"));
              return isVideo ? (
                <video
                  src={modalMedia}
                  controls
                  autoPlay
                  poster={getMediaThumbnail(modalMedia)}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-black"
                />
              ) : (
                <img
                  src={modalMedia}
                  onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                  alt={property.title}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
                />
              );
            })()}
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-6 text-white/80 font-medium text-lg px-4 py-2 bg-white/10 rounded-full select-none">
              {modalImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyDetailsPage;
