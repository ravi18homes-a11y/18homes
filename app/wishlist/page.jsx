"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin, Loader2, Home } from "lucide-react";
import Navbar from "../COMMON/Navbar";
import Footer from "../COMMON/Footer";
import { toast } from "react-hot-toast";

const DEFAULT_IMAGE = "https://res.cloudinary.com/domwj0m7s/image/upload/v1785084052/ChatGPT_Image_Jul_26_2026_10_10_07_PM_uuqc8u.png";

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

export default function WishlistPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please login to view your wishlist");
        router.push("/login-signup");
        return;
      }

      const res = await fetch(`${databaseUrl}/api/properties/my/saved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProperties(data.data);
        } else if (Array.isArray(data)) {
          setProperties(data);
        } else if (data.data && Array.isArray(data.data.properties)) {
          setProperties(data.data.properties);
        }
      } else {
        toast.error("Failed to load wishlist properties");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Server issue while fetching wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      // Optimistic UI update
      setProperties((prev) => prev.filter((p) => p._id !== id && p.id !== id));

      const res = await fetch(`${databaseUrl}/api/properties/${id}/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Removed from wishlist");
      } else {
        toast.error("Failed to remove from wishlist");
        fetchWishlist(); // Rollback by reloading from server
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("An error occurred while removing from wishlist");
      fetchWishlist(); // Rollback
    }
  };

  const formatPrice = (price) => {
    if (typeof price === "object" && price !== null && price.unit) {
      return `${price.value} ${price.unit}`;
    }
    if (!price || price === 0) return "N/A";

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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
            <p className="text-gray-600 mt-2">View and manage properties you have saved</p>
          </div>

          {properties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Explore the buy page to find and save properties.</p>
              <Link
                href="/buy"
                className="inline-flex px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const propertyId = property._id || property.id;
                return (
                  <Link
                    key={propertyId}
                    href={{
                      pathname: "/buy/property-details",
                      query: { id: propertyId },
                    }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative group"
                  >
                    <div className="relative h-48 bg-gray-200">
                      {property.isSold && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                          <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-lg uppercase border border-white">
                            Sold Out
                          </span>
                        </div>
                      )}
                      <img
                        src={getMediaThumbnail(property.images?.[0] || property.image)}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                      {property.purpose && (
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800 capitalize">
                          For {property.purpose === "rent" ? "Rent" : "Sale"}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFromWishlist(e, propertyId)}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-20 transition-transform hover:scale-110"
                      >
                        <Heart className="w-5 h-5 fill-red-600 text-red-600" />
                      </button>
                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded text-[10px] font-semibold text-white">
                        By {property.listedBy === "dealer" ? "Dealer" : "Owner"}
                      </div>
                    </div>

                    <div className="p-5 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 flex-1 pr-2">
                          {property.title}
                        </h3>
                        <span className="text-red-600 font-bold whitespace-nowrap">
                          {formatPrice(property.priceText || property.priceValue || property.price)}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {typeof property.address === 'object' && property.address !== null
                            ? `${property.address.locality ? property.address.locality + ", " : ""}${property.address.city || ""}`
                            : property.address || property.location || "Location not available"}
                        </span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3 justify-between items-center">
                        <span className="text-xs text-gray-400 capitalize">
                          Type: {property.propertyType || "Property"}
                        </span>
                        <span className="text-sm font-semibold text-red-600 group-hover:underline">
                          View Details &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
