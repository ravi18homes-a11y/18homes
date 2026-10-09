"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  PlusCircle,
  Search,
  Building,
  Menu,
  X,
  ArrowLeft,
  MapPin,
  User,
  Heart,
  Phone,
  Compass,
  LogIn,
  LogOut,
  Bed,
  Bath,
  Square,
  Share2,
  ChevronDown,
  Layers,
  BookOpen,
  Building2,
  Award,
  Download,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { usePwa } from "@/components/PwaProvider";

export default function BottomTaskbar() {
  const { isInstallable, installApp } = usePwa();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesExpanded, setIsServicesExpanded] = useState(false);
  const [isBlogsExpanded, setIsBlogsExpanded] = useState(false);
  const [isCitiesExpanded, setIsCitiesExpanded] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  // Check auth state
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("authToken");
        setIsLoggedIn(!!token);
        const storedUser = localStorage.getItem("userData");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (e) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [isMenuOpen]);

  // Scroll Lock when Mobile Drawer Menu is Open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const [navData, setNavData] = useState(null);

  // Fetch dynamic navbar links
  useEffect(() => {
    let cancelled = false;
    fetch("/api/navbar")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setNavData(data);
      })
      .catch(() => {
        if (!cancelled) setNavData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch Saved Wishlist
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("authToken");
      if (!token || !databaseUrl) {
        setFavorites([]);
        return;
      }
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
  }, [isLoggedIn, databaseUrl]);

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to add to wishlist");
      setIsSearchOpen(false);
      router.push("/login-signup");
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
      }
    } catch (err) {
      // Rollback
      setFavorites((prev) =>
        isSaved ? [...prev, id] : prev.filter((fav) => fav !== id)
      );
      toast.error("Error updating wishlist");
    }
  };

  const handleShare = async (propertyId, propertyTitle, e) => {
    e.preventDefault();
    e.stopPropagation();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const shareUrl = `${origin}/buy/property-details?id=${propertyId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle || "Property Details",
          text: `Check out this property: ${propertyTitle}`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  const handleAuthLinkClick = (href, e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      toast.error("Please login to access this page");
      setIsMenuOpen(false);
      router.push("/login-signup");
    } else {
      setIsMenuOpen(false);
    }
  };

  const getFlatPages = () => {
    if (!navData?.sitePages) return [];
    const flat = [];
    const traverse = (nodes, depth = 0) => {
      for (const n of nodes) {
        flat.push({ ...n, depth });
        if (n.children?.length) traverse(n.children, depth + 1);
      }
    };
    traverse(navData.sitePages);
    return flat;
  };

  const getMediaThumbnail = (url) => {
    const DEFAULT_IMAGE = "https://res.cloudinary.com/domwj0m7s/image/upload/v1785084052/ChatGPT_Image_Jul_26_2026_10_10_07_PM_uuqc8u.png";
    if (!url) return DEFAULT_IMAGE;
    const lowerUrl = url.toLowerCase();
    const videoExtensions = [".mp4", ".mov", ".avi", ".webm", ".mkv", ".3gp", ".ogg", ".ogv", ".wmv"];
    const isVideo = videoExtensions.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + "?"));

    if (isVideo) {
      return url.replace(/\.(mp4|mov|avi|webm|mkv|3gp|ogg|ogv|wmv)(?=\?|$)/i, ".jpg");
    }
    return url;
  };

  const formatPrice = (price) => {
    if (typeof price === "object" && price !== null && price.unit) {
      return `${price.value} ${price.unit}`;
    }
    if (!price || price === 0) return "Price on Request";

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

  const formatArea = (area) => {
    if (!area) return "";
    if (typeof area === "object") {
      const size = area.size || "";
      const unit = area.unit || "sqft";
      return `${size} ${unit}`;
    }
    return String(area);
  };

  const formatCardDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN");
  };

  // Debounced search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        let url = `${databaseUrl}/api/properties?limit=15`;

        // Detect BHK keywords (e.g. "1 BHK", "2 bhk flat")
        const bhkMatch = searchQuery.match(/(\d+)\s*(bhk|bedroom|bed)/i);
        if (bhkMatch) {
          url += `&bedrooms=${bhkMatch[1]}`;
          const cleanQuery = searchQuery.replace(bhkMatch[0], "").trim();
          if (cleanQuery) {
            url += `&search=${encodeURIComponent(cleanQuery)}`;
          }
        } else {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const list = data.data?.properties || data.data || data;
          setSuggestions(Array.isArray(list) ? list : []);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, databaseUrl]);

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Main Taskbar Container (Visible only below sm screens) */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-[#030ee8] border-t border-gray-200 z-[999] flex items-center justify-around sm:hidden shadow-lg"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 0px)",
          height: "calc(60px + env(safe-area-inset-bottom))",
        }}
      >
        {/* Tab 1: Home */}
        <Link
          href="/"
          onClick={(e) => {
            setIsSearchOpen(false);
            setIsMenuOpen(false);
            if (pathname !== "/") {
              router.push("/");
            }
          }}
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors cursor-pointer ${pathname === "/" ? "text-[#f30d0d] font-bold" : "text-[white]"
            }`}
        >
          <Home className="w-6 h-6 mb-1 pointer-events-none" />
          <span className="text-[10px] tracking-tight pointer-events-none">Home</span>
        </Link>

        {/* Tab 2: Sell / Rent (With Free Badge) */}
        <Link
          href="/sell"
          className={`flex flex-col items-center justify-center w-16 h-full relative transition-colors ${pathname === "/sell" ? "text-[#f30d0d] font-bold" : "text-[white]"
            }`}
        >
          <span className="absolute -top-3.5 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none shadow">
            Free
          </span>
          <PlusCircle className="w-6 h-6 mb-1" />
          <span className="text-[10px] tracking-tight">Sell/Rent</span>
        </Link>

        {/* Tab 3: Search (Center) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${isSearchOpen ? "text-[#f30d0d] font-bold" : "text-[white]"
            }`}
        >
          <Search className="w-6 h-6 mb-1" />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

        {/* Tab 4: Buy */}
        <Link
          href="/buy"
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${pathname === "/buy" ? "text-[#f30d0d] font-bold" : "text-[white]"
            }`}
        >
          <Building className="w-6 h-6 mb-1" />
          <span className="text-[10px] tracking-tight">Buy</span>
        </Link>

        {/* Tab 5: Menu */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${isMenuOpen ? "text-[#f30d0d] font-bold" : "text-[white]"
            }`}
        >
          <Menu className="w-6 h-6 mb-1" />
          <span className="text-[10px] tracking-tight">Menu</span>
        </button>
      </div>

      {/* 1. Dynamic Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col sm:hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
                setSuggestions([]);
              }}
              className="p-1 hover:bg-gray-100 rounded-full transition text-gray-700"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, locality, '2 BHK', etc."
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-white text-black font-medium"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results/Suggestions */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3 animate-pulse bg-white p-3 rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="grid grid-cols-1 gap-6 pb-6">
                <p className="text-xs font-semibold text-gray-400 px-1 -mb-2">
                  MATCHING PROPERTIES ({suggestions.length})
                </p>
                {suggestions.map((p) => {
                  const validImages = Array.isArray(p.images)
                    ? p.images.filter(
                      (img) => img && !img.startsWith("blob:") && img.trim() !== "",
                    )
                    : [];
                  const displayImage = validImages.length > 0
                    ? getMediaThumbnail(validImages[0])
                    : "https://res.cloudinary.com/domwj0m7s/image/upload/v1785084052/ChatGPT_Image_Jul_26_2026_10_10_07_PM_uuqc8u.png";

                  return (
                    <Link
                      key={p._id || p.id}
                      href={`/buy/property-details?id=${p._id || p.id}`}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col border border-gray-100/50 text-black"
                    >
                      {/* Top Image area */}
                      <div className="relative h-48 w-full shrink-0">
                        {p.isSold && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <span className="bg-red-600 text-white font-extrabold text-sm px-4 py-2 rounded-lg shadow-lg tracking-wider uppercase border border-white">
                              Sold Out
                            </span>
                          </div>
                        )}
                        <img
                          src={displayImage}
                          alt={p.title}
                          onError={(e) => {
                            e.target.src = "https://res.cloudinary.com/domwj0m7s/image/upload/v1785084052/ChatGPT_Image_Jul_26_2026_10_10_07_PM_uuqc8u.png";
                          }}
                          className="w-full h-full object-cover"
                        />

                        {/* Share & Wishlist Buttons */}
                        <button
                          onClick={(e) => handleShare(p._id || p.id, p.title, e)}
                          className="absolute top-3 right-14 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-20"
                          aria-label="Share property link"
                        >
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>

                        <button
                          onClick={(e) => toggleFavorite(p._id || p.id, e)}
                          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-20"
                          aria-label="Toggle wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 ${favorites.includes(p._id || p.id)
                              ? "fill-red-600 text-red-600"
                              : "text-gray-600"
                              }`}
                          />
                        </button>

                        <span
                          className={`absolute bottom-3 left-3 px-3 py-1 ${p.purpose === "rent" ? "bg-red-600" : "bg-green-600"
                            } text-white text-xs font-bold rounded-full`}
                        >
                          {p.purpose === "rent" ? "For Rent" : "For Sale"}
                        </span>
                        <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-md font-semibold">
                          {p.listedBy === "dealer" ? "Dealer" : "Owner"}
                        </span>
                      </div>

                      {/* Bottom Details area */}
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-base font-bold text-gray-800 mb-2 truncate">
                          {p.title}
                        </h3>

                        <div className="flex items-center text-gray-500 mb-2">
                          <MapPin className="w-4 h-4 mr-1 shrink-0 text-gray-400" />
                          <span className="text-xs capitalize truncate">
                            {p.address?.locality || p.address?.city || (typeof p.address === "string" ? p.address : "No Location")}
                          </span>
                        </div>

                        {p.createdAt && (
                          <div className="flex items-center text-gray-400 text-xs mb-1">
                            <span>Created at : {formatCardDate(p.createdAt)}</span>
                          </div>
                        )}

                        {p.updatedAt && (
                          <div className="flex items-center text-gray-400 text-xs mb-2.5">
                            <span>Updated at : {formatCardDate(p.updatedAt)}</span>
                          </div>
                        )}

                        {/* BHK / Bath / Size Details */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                            {p.bedrooms && Number(p.bedrooms) > 0 && (
                              <div className="flex items-center gap-1">
                                <Bed className="w-3.5 h-3.5" />
                                <span>{p.bedrooms} BHK</span>
                              </div>
                            )}
                            {p.bathrooms && Number(p.bathrooms) > 0 && (
                              <div className="flex items-center gap-1">
                                <Bath className="w-3.5 h-3.5" />
                                <span>{p.bathrooms} Baths</span>
                              </div>
                            )}
                            {p.area && (
                              <div className="flex items-center gap-1">
                                <Square className="w-3.5 h-3.5" />
                                <span>{formatArea(p.area)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer: Price & View Details Button */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="text-lg font-extrabold text-[#3a40c6]">
                            {formatPrice(p.priceText || p.priceValue || p.price)}
                          </div>
                          <span className="px-4 py-2 bg-[#3a40c6] text-white rounded-lg font-bold text-[11px] shadow hover:bg-opacity-95 transition">
                            View Details
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {!loading && searchQuery && suggestions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <p className="text-gray-400 text-sm font-medium">No properties matching your query.</p>
                <p className="text-gray-400 text-xs mt-1">Try another keyword, city name, or BHK size.</p>
              </div>
            )}

            {!loading && !searchQuery && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-xs font-semibold text-gray-400 mb-3 tracking-wider uppercase">
                  Popular Search Keywords
                </p>
                <div className="flex flex-wrap gap-2">
                  {["1 BHK", "2 BHK", "3 BHK", "Noida", "Sector 62", "Apartment", "Ready to move", "Rent"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-full transition font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Drawer Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex justify-end sm:hidden animate-fade-in"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className="w-[80vw] max-w-[300px] bg-white h-full shadow-2xl flex flex-col p-6 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden  flex items-center justify-center text-sm font-extrabold shadow-inner flex-shrink-0 bg-white text-red-600">
                  {isLoggedIn ? (
                    <img
                      src={user?.avatar || "https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif";
                      }}
                    />
                  ) : (
                    "?"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-gray-800 truncate max-w-[140px]">
                    {isLoggedIn ? (user?.name || "User") : "Welcome Guest"}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                    {isLoggedIn ? (user?.email || "") : "Login to view dashboard"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
              {/* Main Navigation Pages */}
              <Link
                href="/"
                onClick={(e) => {
                  setIsMenuOpen(false);
                  setIsSearchOpen(false);
                  if (pathname !== "/") {
                    router.push("/");
                  }
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold cursor-pointer"
              >
                <Home className="w-5 h-5 text-gray-400 pointer-events-none" />
                <span className="pointer-events-none">Home</span>
              </Link>

              {/* Membership Page Link (Blue Color Highlighted) */}
              {/* <Link
                href="/membership"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition font-bold my-1 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Membership Plans</span>
                </div>
                <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  PRO
                </span>
              </Link> */}

              {/* PWA App Install Button */}
              <button
                type="button"
                onClick={async () => {
                  setIsMenuOpen(false);
                  if (installApp) {
                    await installApp();
                  }
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white hover:from-blue-700 hover:to-indigo-700 transition font-bold shadow-md my-1 cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-white animate-bounce shrink-0" />
                  <span>Install 18Homes App</span>
                </div>
               
              </button>

              {/* <Link
                href="/buy"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
              >
                <Building className="w-5 h-5 text-gray-400" />
                <span>Buy Properties</span>
              </Link> */}

              {/* <Link
                href="/sell"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
              >
                <PlusCircle className="w-5 h-5 text-gray-400" />
                <span>Sell / Rent Property</span>
              </Link> */}

              {/* Dynamic Services Dropdown Section */}
              <div className="space-y-1 my-1">
                <div className="flex items-center justify-between bg-purple-50/50 rounded-xl pr-2">
                  <Link
                    href="/service"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 flex items-center gap-3 p-3 text-slate-800 hover:text-[#8c4bdc] font-bold"
                  >
                    <Layers className="w-5 h-5 text-[#8c4bdc]" />
                    <span>Our Services</span>
                  </Link>
                  <button
                    onClick={() => setIsServicesExpanded(!isServicesExpanded)}
                    className="p-2 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    aria-label="Toggle Services Menu"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isServicesExpanded ? "rotate-180 text-[#8c4bdc]" : ""
                        }`}
                    />
                  </button>
                </div>

                {isServicesExpanded && (
                  <div className="ml-4 pl-3 border-l-2 border-purple-200 space-y-1 py-1">
                    {(navData?.serviceItems || []).map((service) => (
                      <Link
                        key={service.id}
                        href={service.href || "/service/house"}
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-3 text-sm text-slate-700 hover:text-[#8c4bdc] hover:bg-purple-50 rounded-lg font-medium transition"
                      >
                        {service.title}
                      </Link>
                    ))}
                    {(navData?.serviceItems || []).length === 0 && (
                      <Link
                        href="/service"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-1.5 px-3 text-xs text-slate-500 hover:text-[#8c4bdc]"
                      >
                        View All Services &rarr;
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Blogs Dropdown Section */}
              <div className="space-y-1 my-1">
                <div className="flex items-center justify-between bg-emerald-50/50 rounded-xl pr-2">
                  <Link
                    href="/blog"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 flex items-center gap-3 p-3 text-slate-800 hover:text-emerald-600 font-bold"
                  >
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span>Our Blogs</span>
                  </Link>
                  <button
                    onClick={() => setIsBlogsExpanded(!isBlogsExpanded)}
                    className="p-2 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    aria-label="Toggle Blogs Menu"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isBlogsExpanded ? "rotate-180 text-emerald-600" : ""
                        }`}
                    />
                  </button>
                </div>

                {isBlogsExpanded && (
                  <div className="ml-4 pl-3 border-l-2 border-emerald-200 space-y-1 py-1">
                    {(navData?.blogItems || []).map((blog) => (
                      <Link
                        key={blog.id}
                        href={blog.href || "/blog"}
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-3 text-sm text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium transition"
                      >
                        {blog.title}
                      </Link>
                    ))}
                    {(navData?.blogItems || []).length === 0 && (
                      <Link
                        href="/blog"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-1.5 px-3 text-xs text-slate-500 hover:text-emerald-600"
                      >
                        View All Blogs &rarr;
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Cities Dropdown Section */}
              <div className="space-y-1 my-1">
                <div className="flex items-center justify-between bg-blue-50/50 rounded-xl pr-2">
                  <Link
                    href="/city"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 flex items-center gap-3 p-3 text-slate-800 hover:text-blue-600 font-bold"
                  >
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Our Cities</span>
                  </Link>
                  <button
                    onClick={() => setIsCitiesExpanded(!isCitiesExpanded)}
                    className="p-2 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                    aria-label="Toggle Cities Menu"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isCitiesExpanded ? "rotate-180 text-blue-600" : ""
                        }`}
                    />
                  </button>
                </div>

                {isCitiesExpanded && (
                  <div className="ml-4 pl-3 border-l-2 border-blue-200 space-y-1 py-1">
                    {(navData?.cityItems || []).map((city) => (
                      <Link
                        key={city.id}
                        href={city.href || "/city"}
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-3 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition"
                      >
                        {city.title}
                      </Link>
                    ))}
                    {(navData?.cityItems || []).length === 0 && (
                      <Link
                        href="/city"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-1.5 px-3 text-xs text-slate-500 hover:text-blue-600"
                      >
                        View All Cities &rarr;
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Authenticated Links (Always visible, handles guest redirect) */}
              {/* <Link
                href="/edit-profile"
                onClick={(e) => handleAuthLinkClick("/edit-profile", e)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
              >
                <User className="w-5 h-5 text-gray-400" />
                <span>Edit Profile</span>
              </Link>
              <Link
                href="/my-properties"
                onClick={(e) => handleAuthLinkClick("/my-properties", e)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
              >
                <Building className="w-5 h-5 text-gray-400" />
                <span>My Properties</span>
              </Link>
              <Link
                href="/wishlist"
                onClick={(e) => handleAuthLinkClick("/wishlist", e)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
              >
                <Heart className="w-5 h-5 text-gray-400" />
                <span>Wishlist</span>
              </Link> */}
              {/* standard footer contact pages */}
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
              >
                <Compass className="w-5 h-5 text-gray-400" />
                <span>About Us</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
              >
                <Phone className="w-5 h-5 text-gray-400" />
                <span>Contact Us</span>
              </Link>
              {/* Dynamic CMS Pages from Settings */}
              {getFlatPages().map((page) => (
                <Link
                  key={page.id}
                  href={page.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
                  style={{ paddingLeft: `${12 + page.depth * 12}px` }}
                >
                  <Compass className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{page.title}</span>
                </Link>
              ))}

              {/* Dashboard Button (Redirects to Dashboard if logged in, otherwise Login page) */}
              <Link 
                href={isLoggedIn ? (user?.role === "admin" ? "/admin" : "/dashboard") : "/login-signup"}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition text-[#8c4bdc] font-bold border border-purple-100 mt-2"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-[#8c4bdc]" />
                  <span>Dashboard</span>
                </div>
                {isLoggedIn && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-200/80 text-purple-800">
                    {user?.role || "User"}
                  </span>
                )}
              </Link>
            </div>

            {/* Bottom Section (Log In / Log Out) */}
            <div className="pt-6 border-t border-gray-100">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("userData");
                    setIsLoggedIn(false);
                    setIsMenuOpen(false);
                    window.location.href = "/";
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link
                  href="/login-signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition font-semibold"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login / Sign Up</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
