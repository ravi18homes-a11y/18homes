"use client";
import React, { useState, useEffect } from "react";
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

const PropertyDetailsPage = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get ID from URL
  const getIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('id');
    }
    return null;
  };

  const id = getIdFromUrl();
  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || 'http://localhost:3000';

  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        const res = await fetch(`${databaseUrl}/api/properties/${id}`);
        const data = await res.json();

        if (data.success && data.data) {
          const transformedProperty = {
            ...data.data,
            area: typeof data.data.area === 'object' 
              ? (data.data.area.value || 'Not specified')
              : (data.data.area || 'Not specified'),
            images: (data.data.images || []).filter(
              (img) => img && !img.startsWith('blob:') && img.trim() !== ''
            ),
            location: data.data.address || data.data.location || 'Location not available',
          };
          setProperty(transformedProperty);
        }
      } catch (err) {
        console.error("Error fetching property:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, databaseUrl]);

  const formatPrice = (price) => {
    if (typeof price === 'object' && price !== null && price.unit) {
      return `${price.value} ${price.unit}`;
    }
    if (!price || price === 0) return 'न्यूनतम मूल्य';
    const numPrice = Number(price);
    if (isNaN(numPrice)) return 'मूल्य अनुपलब्ध';
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
    (img) => img && !img.startsWith('blob:') && img.trim() !== ''
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
            <span className="font-medium">वापस जाएं</span>
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
                className={`h-2 rounded-full transition-all ${
                  currentImageIndex === index ? 'bg-white w-8' : 'bg-white/50 w-2'
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
                  <span className={`px-4 py-2 rounded-full text-white font-semibold whitespace-nowrap self-start ${
                    property.status === "Ready to Move" ? "bg-green-600" : "bg-orange-600"
                  }`}>
                    {property.status}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">{property.bedrooms || 0} BHK</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">{property.bathrooms || 0} बाथरूम</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">
                    {typeof property.area === 'number' ? property.area : property.area} sqft
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">विवरण</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">फोटो गैलरी</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images && images.length > 0 && images[0] !== DEFAULT_IMAGE ? (
                  images.map((image, index) => (
                    <img
                      key={index}
                      src={image || DEFAULT_IMAGE}
                      alt={`Property ${index + 1}`}
                      onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <img src={DEFAULT_IMAGE} alt="Property" className="w-full h-64 object-cover rounded-lg" />
                    <p className="text-gray-600 mt-4">असली छवि उपलब्ध नहीं है</p>
                  </div>
                )}
              </div>
            </div>

            {/* Videos */}
            {property.videos && property.videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">वीडियो टूर</h2>
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
                      <p className="mt-2 font-semibold text-gray-800">{video.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">सुविधाएं</h2>
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
                <h2 className="text-2xl font-bold text-gray-800 mb-4">आसपास की जगहें</h2>
                <div className="space-y-3">
                  {property.nearbyPlaces.map((place, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b last:border-b-0"
                    >
                      <span className="text-gray-700 font-medium">{place.name}</span>
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
              <h3 className="text-xl font-bold text-gray-800 mb-4">संपर्क करें</h3>

              {property.owner ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl font-bold">
                        {property.owner.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {property.owner.name || 'विक्रेता'}
                      </p>
                      <p className="text-sm text-gray-600">संपत्ति मालिक</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {property.owner.phone && (
                      <a
                        href={`tel:${property.owner.phone}`}
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-gray-700">{property.owner.phone}</span>
                      </a>
                    )}

                    {property.owner.email && (
                      <a
                        href={`mailto:${property.owner.email}`}
                        className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Mail className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-gray-700 text-sm break-all">{property.owner.email}</span>
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-600 mb-6">संपर्क जानकारी उपलब्ध नहीं है</p>
              )}

              <button className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                अभी कॉल करें
              </button>

              <button className="w-full mt-3 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                संदेश भेजें
              </button>
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