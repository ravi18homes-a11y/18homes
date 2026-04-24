"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import Link from "next/link";

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
  const searchParams = useSearchParams();
  const id = searchParams?.get("id");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "";

  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";

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
                  ? data.data.area.value || "Not specified"
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
          description: fallbackProperty.description || "Description not available.",
        });
      }
    };

    fetchProperty().finally(() => setLoading(false));
  }, [id, databaseUrl]);

  const formatPrice = (price) => {
    if (typeof price === "object" && price !== null && price.unit) {
      return `${price.value} ${price.unit}`;
    }
    if (!price || price === 0) return "Min Price";
    const numPrice = Number(price);
    if (isNaN(numPrice)) return "Price Unavailable";
    if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    return `₹${(numPrice / 100000).toFixed(2)} Lac`;
  };

  const openVideo = (video) => {
    setCurrentVideo(video);
    setShowVideoModal(true);
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

  const validImages = (property.images || []).filter(
    (img) => img && !img.startsWith("blob:") && img.trim() !== "",
  );
  const images = validImages.length > 0 ? validImages : [DEFAULT_IMAGE];

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="relative bg-gray-900">
        <img
          src={images[currentImageIndex]}
          onError={(e) => (e.target.src = DEFAULT_IMAGE)}
          alt={property.title}
          className="w-full h-[500px] object-cover"
        />

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
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
        </div>

        {property.featured && (
          <span className="absolute top-4 left-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-full">
            Featured
          </span>
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
              </div>

              <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">
                    {property.bedrooms || 0} BHK
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">
                    {property.bathrooms || 0} Bathrooms
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">
                    {typeof property.area === "number"
                      ? property.area
                      : property.area}{" "}
                    sqft
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-4xl font-bold text-red-600">
                  {formatPrice(property.price)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Description</h2>
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
                    const isVideo = media?.toLowerCase().endsWith(".mp4");

                    return isVideo ? (
                      <video
                        key={index}
                        src={media}
                        controls
                        className="w-full h-48 object-contain rounded-lg cursor-pointer"
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ) : (
                      <img
                        key={index}
                        src={media || DEFAULT_IMAGE}
                        alt={`Property ${index + 1}`}
                        onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setCurrentImageIndex(index)}
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
                    {property.owner.phone && (
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

                    {property.owner.email && (
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

              <a href="tel:${property.owner.phone}" className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Call Now
              </a>

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
    </div>
  );
};

export default PropertyDetailsPage;
