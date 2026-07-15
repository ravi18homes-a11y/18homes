"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  LogOut
} from "lucide-react";

export default function BottomTaskbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  }, []);

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
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[999] flex items-center justify-around sm:hidden px-2 shadow-lg"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)",
          height: "calc(60px + env(safe-area-inset-bottom))",
        }}
      >
        {/* Tab 1: Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${pathname === "/" ? "text-red-600 font-bold" : "text-gray-500"
            }`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* Tab 2: Sell / Rent (With Free Badge) */}
        <Link
          href="/sell"
          className={`flex flex-col items-center justify-center w-16 h-full relative transition-colors ${pathname === "/sell" ? "text-red-600 font-bold" : "text-gray-500"
            }`}
        >
          <span className="absolute -top-3.5 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none shadow">
            Free
          </span>
          <PlusCircle className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Sell/Rent</span>
        </Link>

        {/* Tab 3: Search (Center) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${isSearchOpen ? "text-red-600 font-bold" : "text-gray-500"
            }`}
        >
          <Search className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Search</span>
        </button>

        {/* Tab 4: Buy */}
        <Link
          href="/buy"
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${pathname === "/buy" ? "text-red-600 font-bold" : "text-gray-500"
            }`}
        >
          <Building className="w-5 h-5 mb-1" />
          <span className="text-[10px] tracking-tight">Buy</span>
        </Link>

        {/* Tab 5: Menu */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${isMenuOpen ? "text-red-600 font-bold" : "text-gray-500"
            }`}
        >
          <Menu className="w-5 h-5 mb-1" />
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
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 mb-2 px-1">
                  MATCHING PROPERTIES ({suggestions.length})
                </p>
                {suggestions.map((p) => (
                  <Link
                    key={p._id || p.id}
                    href={`/buy/property-details?id=${p._id || p.id}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition shadow-sm text-black"
                  >
                    <img
                      src={p.images?.[0] || "https://placehold.co/100x100?text=Property"}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      alt={p.title}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/100x100?text=Property";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-800 truncate">{p.title}</h4>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        {p.address?.locality || p.address?.city || "No Location"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {p.bedrooms ? (
                          <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold">
                            {p.bedrooms} BHK
                          </span>
                        ) : null}
                        {p.propertyType && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium capitalize">
                            {p.propertyType}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-black text-red-600 block">{p.priceText || p.priceValue || p.price}</span>
                    </div>
                  </Link>
                ))}
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
            <div className="flex-1 space-y-1.5 overflow-y-auto">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/edit-profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
                  >
                    <User className="w-5 h-5 text-gray-400" />
                    <span>Edit Profile</span>
                  </Link>
                  <Link
                    href="/my-properties"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
                  >
                    <Building className="w-5 h-5 text-gray-400" />
                    <span>My Properties</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
                  >
                    <Heart className="w-5 h-5 text-gray-400" />
                    <span>Wishlist</span>
                  </Link>
                </>
              ) : null}
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
              >
                <Phone className="w-5 h-5 text-gray-400" />
                <span>Contact Us</span>
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition text-gray-700 hover:text-red-600 font-semibold"
              >
                <Compass className="w-5 h-5 text-gray-400" />
                <span>About Us</span>
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
