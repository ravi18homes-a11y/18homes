"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, MapPin, Loader2, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function RecentHistoryPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("all"); // "all", "week", "month"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const router = useRouter();

  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "";

  // Filter properties based on visitedAt (last week = 7 days, last month = 30 days)
  const filteredProperties = properties.filter((property) => {
    if (timeFilter === "all") return true;
    if (!property.visitedAt) return false;

    const visitDate = new Date(property.visitedAt);
    const now = new Date();
    const diffTime = now.getTime() - visitDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (timeFilter === "week") {
      return diffDays <= 7;
    }
    if (timeFilter === "month") {
      return diffDays <= 30;
    }
    return true;
  });

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const displayedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Keep currentPage in bounds if properties list updates
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredProperties.length, totalPages, currentPage]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const token = localStorage.getItem("authToken");
    if (token && databaseUrl) {
      try {
        const res = await fetch(`${databaseUrl}/api/properties/my/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setProperties(json.data);
          } else if (Array.isArray(json)) {
            setProperties(json);
          }
        } else {
          toast.error("Failed to load history from server");
        }
      } catch (err) {
        console.error("Error loading server history:", err);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const historyJson = localStorage.getItem("recentProperties");
        if (historyJson) {
          const parsed = JSON.parse(historyJson);
          if (Array.isArray(parsed)) {
            setProperties(parsed);
          }
        }
      } catch (error) {
        console.error("Error loading history from localStorage:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearHistory = async () => {
    const token = localStorage.getItem("authToken");
    if (token && databaseUrl) {
      try {
        const res = await fetch(`${databaseUrl}/api/properties/my/history/clear`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setProperties([]);
          toast.success("Recent history cleared successfully!");
        } else {
          toast.error("Failed to clear history on server");
        }
      } catch (error) {
        console.error("Error clearing history:", error);
        toast.error("Failed to clear history");
      }
    } else {
      try {
        localStorage.removeItem("recentProperties");
        setProperties([]);
        toast.success("Recent history cleared successfully!");
      } catch (error) {
        console.error("Error clearing history:", error);
        toast.error("Failed to clear history");
      }
    }
  };

  const handleRemoveItem = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("authToken");
    if (token && databaseUrl) {
      try {
        setProperties((prev) => prev.filter((p) => (p._id || p.id) !== id));
        const res = await fetch(`${databaseUrl}/api/properties/${id}/history`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          toast.success("Removed from history");
        } else {
          toast.error("Failed to remove item on server");
          loadHistory();
        }
      } catch (error) {
        console.error("Error removing item:", error);
        toast.error("Failed to remove item");
        loadHistory();
      }
    } else {
      try {
        const updated = properties.filter((p) => (p._id || p.id) !== id);
        setProperties(updated);
        localStorage.setItem("recentProperties", JSON.stringify(updated));
        toast.success("Removed from history");
      } catch (error) {
        console.error("Error removing item from history:", error);
        toast.error("Failed to remove item");
      }
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

  const formatVisitedAt = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Recent History</h1>
              <p className="text-gray-600 mt-2">View properties you have recently visited</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {properties.length > 0 && (
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    onClick={() => setTimeFilter("all")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${timeFilter === "all"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    All Time
                  </button>
                  <button
                    onClick={() => setTimeFilter("week")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${timeFilter === "week"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Last Week
                  </button>
                  <button
                    onClick={() => setTimeFilter("month")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${timeFilter === "month"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Last Month
                  </button>
                </div>
              )}
              {properties.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 text-sm font-semibold transition-all cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear History
                </button>
              )}
            </div>
          </div>

          {properties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No recently viewed properties</h3>
              <p className="text-gray-500 mb-6">Explore the buy page to find properties.</p>
              <Link
                href="/buy"
                className="inline-flex px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Browse Properties
              </Link>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No properties viewed in this period</h3>
              <p className="text-gray-500 mb-6">Try changing the time filter or browse more properties.</p>
              <button
                onClick={() => setTimeFilter("all")}
                className="inline-flex px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProperties.map((property, idx) => {
                  const propertyId = property._id || property.id;
                  return (
                    <Link
                      key={`${propertyId}-${property.visitedAt || idx}`}
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
                          onClick={(e) => handleRemoveItem(e, propertyId)}
                          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-600 hover:bg-gray-100 z-20 transition-transform hover:scale-110"
                          title="Remove from history"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {property.visitedAt && (
                          <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-medium text-white flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Viewed: {formatVisitedAt(property.visitedAt)}</span>
                          </div>
                        )}

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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors bg-white text-gray-700 cursor-pointer active:scale-95"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1
                    )
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && arr[idx - 1] !== p - 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item)}
                          className={`w-10 h-10 flex items-center justify-center border rounded-lg text-sm font-semibold transition-all cursor-pointer active:scale-95 ${currentPage === item
                              ? "bg-red-600 text-white border-red-600 shadow-sm"
                              : "border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                            }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors bg-white text-gray-700 cursor-pointer active:scale-95"
                    title="Next Page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
