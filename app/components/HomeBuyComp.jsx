"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin, Bed, Bath, Square, Heart, Home, Loader2, Share2, X } from "lucide-react";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";

const DEFAULT_IMAGE =
  "https://res.cloudinary.com/domwj0m7s/image/upload/v1785084052/ChatGPT_Image_Jul_26_2026_10_10_07_PM_uuqc8u.png";

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

export default function HomeBuyComp() {
  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "";
  const [filters, setFilters] = useState({ purpose: "" });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [activePopover, setActivePopover] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("authToken");
      if (!token || !databaseUrl) return;
      try {
        const res = await fetch(`${databaseUrl}/api/properties/my/saved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const savedList = json.data || json;
          if (Array.isArray(savedList)) {
            setFavorites(savedList.map((p) => p._id || p.id));
          }
        }
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };
    fetchFavorites();
  }, [databaseUrl]);

  const handlePropertyClick = (propertyId) => {
    if (!databaseUrl || !propertyId) return;
    fetch(`${databaseUrl}/api/properties/${propertyId}/click`, {
      method: "POST",
    }).catch((err) => console.error("Error calling click API:", err));
  };

  const fetchProperties = useCallback(async () => {
    if (!databaseUrl) {
      setError("Database URL is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.purpose) params.append("purpose", filters.purpose);
      params.append("isBoosted", "true");
      params.append("limit", "6");

      const apiUrl = `${databaseUrl}/api/properties?${params.toString()}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data.properties)) {
        const transformedProperties = data.data.properties.map((prop) => {
          let areaValue = "—";
          if (typeof prop.area === "object" && prop.area !== null) {
            if (prop.area.size) {
              const sizeStr = String(prop.area.size);
              areaValue = /^[0-9\s.,]+$/.test(sizeStr.trim())
                ? `${sizeStr} ${prop.area.unit || "sqft"}`
                : sizeStr;
            }
          } else if (prop.area !== undefined && prop.area !== null) {
            areaValue = prop.area;
          }

          const validImages = Array.isArray(prop.images)
            ? prop.images.filter(
              (img) => img && !img.startsWith("blob:") && img.trim() !== "",
            )
            : [];

          const ownerInfo = prop.owner
            ? `${prop.owner.name || "Owner"}, ${prop.owner.phone || ""}`
            : "Owner info not available";

          return {
            id: prop._id || prop.id,
            title: prop.title || "No Title",
            location: ` ${prop.address.city ? prop.address.city : `NCR Reason (Not Disclosed)`}`,
            price: prop.priceText || prop.priceValue || prop.price || "",
            bedrooms: prop.bedrooms || 0,
            bathrooms: prop.bathrooms || 0,
            area: areaValue,
            type: prop.propertyType === "commercial"
              ? (prop.commercialType === "other" && prop.commercialTypeCustom
                ? `Commercial (${prop.commercialTypeCustom})`
                : (prop.commercialType ? `Commercial (${prop.commercialType === "pg" ? "P.G" : prop.commercialType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')})` : "Commercial"))
              : prop.propertyType || "apartment",
            image: validImages.length > 0 ? getMediaThumbnail(validImages[0]) : DEFAULT_IMAGE,
            status: prop.purpose === "rent" ? "For Rent" : "For Sale",
            featured: prop.featured || false,
            isBoosted: prop.isBoosted || false,
            listedBy: prop.listedBy || "owner",
            isSold: prop.isSold || false,
            owner: prop.owner,
          };
        });

        setProperties(transformedProperties.slice(0, 6));
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [databaseUrl, filters.purpose]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const toggleFavorite = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to add to wishlist");
      return;
    }

    const isSaved = favorites.includes(id);
    // Optimistic UI update
    setFavorites((prev) =>
      isSaved ? prev.filter((fav) => fav !== id) : [...prev, id]
    );

    try {
      const res = await fetch(`${databaseUrl}/api/properties/${id}/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // Rollback
        setFavorites((prev) =>
          isSaved ? [...prev, id] : prev.filter((fav) => fav !== id)
        );
        const data = await res.json();
        toast.error(data.message || "Failed to update wishlist");
      } else {
        const data = await res.json();
        toast.success(data.message || (isSaved ? "Removed from wishlist" : "Added to wishlist"));
        if (!isSaved) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.8 }
          });
        }
      }
    } catch (err) {
      // Rollback
      setFavorites((prev) =>
        isSaved ? [...prev, id] : prev.filter((fav) => fav !== id)
      );
      toast.error("Error updating wishlist");
    }
  };

  const handleShare = async (propertyId, propertyTitle) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/buy/property-details?id=${propertyId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle || "Property Details",
          text: `Check out this property: ${propertyTitle}`,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
          toast.error("Failed to share");
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
        toast.error("Failed to copy link");
      }
    } else {
      toast.error("Sharing not supported on this browser");
    }
  };

  const formatPrice = (price) => {
    if (typeof price === "object" && price !== null && price.unit) {
      return `${price.value} ${price.unit}`;
    }
    if (!price || price === 0) return "Price on Request";

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

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">

      <div className="flex flex-col items-center justify-center mb-[20px]">
        <h3 className="text-center font-medium sm:text-[30px] text-gray-800">Top High Rated Properties</h3>

      </div>
      {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilters({ ...filters, purpose: "sell" })}
            className={`px-4 py-2 rounded-full text-[28px] border transition ${
              filters.purpose === "sell"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Sell
          </button>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, purpose: "rent" })}
            className={`px-4 py-2 rounded-full text-[28px] border transition ${
              filters.purpose === "rent"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Rent
          </button>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              Loading...
            </span>
          ) : error ? (
            "Error loading properties"
          ) : (
            `${properties.length} Properties Available`
          )}
        </h2>
      </div> */}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link
              href={{
                pathname: "/buy/property-details",
                query: { id: property.id },
              }}
              key={property.id}
              onClick={() => handlePropertyClick(property.id)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                {property.isSold && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <span className="bg-red-600 text-white font-extrabold text-lg px-4 py-2 rounded-lg shadow-lg tracking-wider uppercase border-2 border-white">
                      Sold Out
                    </span>
                  </div>
                )}
                <img
                  src={property.image}
                  alt={property.title}
                  onError={(e) => {
                    e.target.src = DEFAULT_IMAGE;
                  }}
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShare(property.id, property.title);
                  }}
                  className="absolute top-3 right-14 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-20"
                  aria-label="Share property link"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(property.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-20"
                >
                  <Heart
                    className={`w-5 h-5 ${favorites.includes(property.id)
                      ? "fill-red-600 text-red-600"
                      : "text-gray-600"
                      }`}
                  />
                </button>
                {/* Verified Badge Icon */}
                {property.owner?.role === "admin" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActivePopover(
                        activePopover?.id === property.id && activePopover?.type === "verified"
                          ? null
                          : { id: property.id, type: "verified" }
                      );
                    }}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center bg-green-600 text-white font-extrabold shadow-md z-20 hover:scale-105 hover:bg-green-700 transition-all text-base"
                    title="Verified Property"
                  >
                    ✓
                  </button>
                )}

                {/* Featured/Boosted Badge Icon */}
                {(property.featured || property.isBoosted) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActivePopover(
                        activePopover?.id === property.id && activePopover?.type === "star"
                          ? null
                          : { id: property.id, type: "star" }
                      );
                    }}
                    className={`absolute top-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold shadow-md z-20 hover:scale-105 transition-all text-base ${property.owner?.role === "admin" ? "left-12" : "left-3"
                      } ${property.isBoosted ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
                    title={property.isBoosted ? "High Rated (Boosted)" : "Featured Property"}
                  >
                    ★
                  </button>
                )}

                {/* Verified Popover */}
                {activePopover?.id === property.id && activePopover?.type === "verified" && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="absolute top-12 left-3 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 z-30 p-3 w-60 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-gray-100">
                      <span className="font-bold text-green-600 text-xs flex items-center gap-1">
                        ✓ Verified Property
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActivePopover(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] leading-relaxed text-[#7a18cf] font-normal">
                      This is a verified listing by a trusted user. The 18homes team has verified the property details and ownership to ensure authenticity.
                    </p>
                  </div>
                )}

                {/* Star Popover */}
                {activePopover?.id === property.id && activePopover?.type === "star" && (
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={`absolute top-12 ${property.owner?.role === "admin" ? "left-12" : "left-3"
                      } bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 z-30 p-3 w-60 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150`}
                  >
                    <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-gray-100">
                      <span className={`font-bold text-xs flex items-center gap-1 ${property.isBoosted ? "text-blue-600" : "text-red-600"
                        }`}>
                        ★ {property.isBoosted ? "Boosted Property" : "Featured"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActivePopover(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] leading-relaxed text-[#7a18cf] font-normal">
                      {property.isBoosted
                        ? "This property is boosted for higher visibility. It is highly rated and recommended by 18homes."
                        : "This property is featured on 18homes for premium reach and stands out for its high value."}
                    </p>
                  </div>
                )}
                <span className={`absolute bottom-3 left-3 px-3 py-1 ${property.status === "For Rent" ? "bg-red-600" : "bg-green-600"} text-white text-sm rounded-full`}>
                  {property.status}
                </span>
                <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                  {property.listedBy === "dealer" ? "Dealer" : "Owner"}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                  {/* {property.isBoosted && (
                    <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm shrink-0" title="Boosted Property">
                      🚀 Boosted
                    </span>
                  )} */}
                  <span>{property.title}</span>
                </h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm truncate">{property.location}</span>
                </div>

                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms} BHK</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      <span>
                        {/^[0-9\s.,]+$/.test(String(property.area).trim())
                          ? `${property.area} sqft`
                          : property.area}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-[#3a40c6]">
                    {formatPrice(property.price)}
                  </div>
                  <span className="px-4 py-2 bg-[#3a40c6] text-white rounded-lg text-sm">
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          ))}

        </div>
      ) : (
        <div className="text-center py-16">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Properties Found
          </h3>
          <p className="text-gray-600">
            Please change your filters or try a different search
          </p>
        </div>
      )}


      <Link
        href="/buy?isBoosted=true"
        className="mt-8 text-center text-[20px] justify-center  bg-[blue] text-white p-2 rounded-lg max-w-[200px] mx-auto font-semibold  hover:underline cursor-pointer transition flex items-center gap-1 group"
      >
        See More
        <span className="transform group-hover:translate-x-1 transition-transform inline-block">➔</span>
      </Link>
    </section>
  );
}
