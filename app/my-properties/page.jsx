"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Home, MapPin, Loader2, X, Search, ArrowUpDown, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../COMMON/Navbar";
import Footer from "../COMMON/Footer";
import DashboardLayout from "../dashboard/DashboardLayout";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";

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

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("all"); // "all", "sell", "rent"
  const [sortOrder, setSortOrder] = useState("latest"); // "latest", "older"

  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [openBoostModal, setOpenBoostModal] = useState(false);
  const [boostPlan, setBoostPlan] = useState("7days");
  const [boostPlans, setBoostPlans] = useState([]);
  const [boosting, setBoosting] = useState(false);
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(true);

  useEffect(() => {
    const checkPaymentMode = async () => {
      try {
        const res = await fetch(`${databaseUrl}/api/settings/payment-mode`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setIsPaymentEnabled(data.data.isPaymentEnabled);
          }
        }
      } catch (err) {
        console.error("Error fetching payment mode:", err);
      }
    };
    checkPaymentMode();
  }, [databaseUrl]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userData");
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        if (u.role === "user") {
          toast.error("Normal users do not have access to My Properties");
          router.replace("/dashboard");
          return;
        }
      }
    } catch (e) {}
  }, [router]);

  const isEditAllowed = (property) => {
    if (!user) return false;
    if (user.role === "admin" || user.role === "super_admin") return true;

    // Default edit window is 1 day (Free plan)
    const editDays = user?.planRules?.editDays ?? 1;
    if (editDays === -1) return true; // Unlimited edit window

    const createdAt = new Date(property.createdAt || property.createdAtDate || Date.now());
    const limitMs = editDays * 24 * 60 * 60 * 1000;
    const expiryTime = createdAt.getTime() + limitMs;

    return Date.now() < expiryTime;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${databaseUrl}/api/properties/boost/plans`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setBoostPlans(data.data);
          }
        }
      } catch (err) {
        console.error("Error fetching boost plans:", err);
      }
    };
    fetchPlans();
  }, [databaseUrl]);

  const activePlans = boostPlans.length > 0 ? boostPlans : [
    { key: "7days", name: "7 Days Boost", price: 19, durationDays: 7 },
    { key: "15days", name: "15 Days Boost", price: 49, durationDays: 15 },
    { key: "30days", name: "30 Days Boost", price: 99, durationDays: 30 },
  ];

  const handleOpenBoostModal = (property) => {
    setSelectedProperty(property);
    setOpenBoostModal(true);
  };

  const handleBoostPayment = async () => {
    if (!selectedProperty) return;
    setBoosting(true);
    const propertyId = selectedProperty._id || selectedProperty.id;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please log in first");
        return;
      }

      toast.loading("Initiating payment gateway...", { id: "boost-pay" });
      const orderRes = await fetch(`${databaseUrl}/api/properties/${propertyId}/boost/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planKey: boostPlan }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      if (orderData.data && orderData.data.isFree) {
        toast.dismiss("boost-pay");
        toast.success("Property boosted to Premium successfully!");
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        setOpenBoostModal(false);
        fetchProperties();
        return;
      }

      toast.dismiss("boost-pay");

      const options = {
        key: orderData.data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TAwig7RAJNiuHo",
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "18Homes",
        description: `Property Boost - ${boostPlan}`,
        order_id: orderData.data.orderId,
        handler: async function (response) {
          toast.loading("Verifying payment...", { id: "boost-pay" });
          try {
            const verifyRes = await fetch(`${databaseUrl}/api/properties/${propertyId}/boost/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planKey: boostPlan,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              toast.success("Property boosted to Premium successfully!", { id: "boost-pay" });
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
              });
              setOpenBoostModal(false);
              fetchProperties();
            } else {
              toast.error("Payment verification failed.", { id: "boost-pay" });
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error("Error verifying payment.", { id: "boost-pay" });
          }
        },
        prefill: {
          name: localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).name : "",
          email: localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).email : "",
          contact: localStorage.getItem("userData") ? JSON.parse(localStorage.getItem("userData")).phone : "",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to boost property", { id: "boost-pay" });
    } finally {
      setBoosting(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login-signup");
        return;
      }

      const res = await fetch(`${databaseUrl}/api/properties/my/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        // Depending on API structure, data might be the array or data.data might be the array
        if (Array.isArray(data)) {
          setProperties(data);
        } else if (data.data && Array.isArray(data.data)) {
          setProperties(data.data);
        } else if (data.properties && Array.isArray(data.properties)) {
          setProperties(data.properties);
        }
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${databaseUrl}/api/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p._id !== id && p.id !== id));
        toast.success("Property deleted successfully");
      } else {
        const errorData = await res.json();
        toast.error(`Failed to delete property: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("An error occurred while deleting the property.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price) => {
    if (typeof price === "object" && price !== null && price.unit) {
      return `${price.value} ${price.unit}`;
    }
    if (!price || price === 0) return "N/A";

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

  const filteredProperties = properties
    .filter((property) => {
      // 1. Purpose filter (Sell / Rent / All)
      if (purposeFilter !== "all") {
        const rawPurpose = String(
          property.purpose ||
          property.listingType ||
          property.propertyFor ||
          property.status ||
          ""
        ).toLowerCase();

        if (purposeFilter === "sell") {
          if (rawPurpose.includes("rent")) return false;
        } else if (purposeFilter === "rent") {
          if (!rawPurpose.includes("rent")) return false;
        }
      }

      // 2. Search term filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const title = (property.title || "").toLowerCase();
        const address = typeof property.address === "object"
          ? `${property.address?.locality || ""} ${property.address?.city || ""} ${property.address?.state || ""}`.toLowerCase()
          : (property.address || property.location || "").toLowerCase();
        const priceStr = String(property.price || property.priceValue || property.priceText || "").toLowerCase();
        const propType = (property.propertyType || property.category || "").toLowerCase();
        const pId = String(property._id || property.id || "").toLowerCase();

        const matchesSearch =
          title.includes(query) ||
          address.includes(query) ||
          priceStr.includes(query) ||
          propType.includes(query) ||
          pId.includes(query);

        if (!matchesSearch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const getTimestamp = (item) => {
        if (item.createdAt) return new Date(item.createdAt).getTime();
        if (item.createdAtDate) return new Date(item.createdAtDate).getTime();
        if (item.updatedAt) return new Date(item.updatedAt).getTime();
        if (item._id && typeof item._id === "string" && item._id.length === 24) {
          return parseInt(item._id.substring(0, 8), 16) * 1000;
        }
        return 0;
      };

      const dateA = getTimestamp(a);
      const dateB = getTimestamp(b);

      if (sortOrder === "latest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0d56f6]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Properties</h1>
              <p className="text-gray-600 mt-1">Manage the properties you have listed</p>
            </div>
            <Link
              href="/sell"
              className="self-start sm:self-auto px-6 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center shadow-sm"
            >
              Post New Property
            </Link>
          </div>

          {/* Search Box, Purpose Filter & Sort Order Controls */}
          {properties.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, location, price, property type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Purpose Filter (All / Sell / Rent) */}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 text-sm font-medium">
                  <button
                    onClick={() => setPurposeFilter("all")}
                    className={`px-4 py-1.5 rounded-md transition-all ${
                      purposeFilter === "all"
                        ? "bg-white text-red-600 shadow-sm font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setPurposeFilter("sell")}
                    className={`px-4 py-1.5 rounded-md transition-all ${
                      purposeFilter === "sell"
                        ? "bg-white text-red-600 shadow-sm font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Sell
                  </button>
                  <button
                    onClick={() => setPurposeFilter("rent")}
                    className={`px-4 py-1.5 rounded-md transition-all ${
                      purposeFilter === "rent"
                        ? "bg-white text-red-600 shadow-sm font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Rent
                  </button>
                </div>

                {/* Sort Order (Latest / Older) */}
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-400 font-medium hidden sm:inline">Sort:</span>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent font-medium text-gray-800 focus:outline-none cursor-pointer"
                  >
                    <option value="latest">Latest</option>
                    <option value="older">Older</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {properties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Properties Found</h3>
              <p className="text-gray-500 mb-6">You haven't listed any properties yet.</p>
              <Link
                href="/sell"
                className="inline-flex px-6 py-2 border border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
              >
                Post Your First Property
              </Link>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Matching Properties</h3>
              <p className="text-gray-500 mb-6">No properties match your current search or filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setPurposeFilter("all");
                  setSortOrder("latest");
                }}
                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div key={property._id || property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="relative h-48 bg-gray-200">
                    {property.isSold && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                        <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-lg uppercase border border-white">
                          Sold Out
                        </span>
                      </div>
                    )}
                    <img
                      src={getMediaThumbnail(property.images?.[0])}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = DEFAULT_IMAGE;
                      }}
                    />
                    {property.isBoosted && property.boostExpiresAt && (
                      <div className="absolute top-4 right-4 bg-[blue] text-white px-2.5 py-1 rounded-full text-[12px] font-bold shadow-md z-10">
                        ★ Boost Active (Exp: {new Date(property.boostExpiresAt).toLocaleDateString()})
                      </div>
                    )}
                    {property.status && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-800">
                        {property.status}
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
                        {typeof property.address === 'object'
                          ? property.address.locality || property.address.city || "Location not available"
                          : property.address || property.location || "Location not available"}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
                      <div className="flex gap-3">
                        {isEditAllowed(property) ? (
                          <Link
                            href={`/edit-property/${property._id || property.id}`}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              toast.error(`The edit window of ${user?.planRules?.editDays || 1} day(s) has expired for this property. Upgrade your plan to edit.`);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-400 rounded-lg font-medium text-sm cursor-not-allowed"
                            title="Edit window expired"
                          >
                            <Edit className="w-4 h-4 text-slate-300" />
                            Edit Expired
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenBoostModal(property)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-all ${property.isBoosted
                            ? "bg-amber-100 text-amber-800 cursor-default"
                            : "bg-purple-50 text-purple-600 hover:bg-purple-100"
                            }`}
                          disabled={property.isBoosted}
                        >
                          🚀 {property.isBoosted ? "Boost Active" : "Boost Property"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {openBoostModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-gray-100">
            <button
              onClick={() => setOpenBoostModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <span className="inline-block p-3 bg-purple-100 text-purple-600 rounded-full mb-3 text-2xl">
                🚀
              </span>
              <h2 className="text-2xl font-bold text-gray-900">Boost Property</h2>
              <p className="text-md font-medium text-[blue]  mt-1">
                Increase Visibility of Property "{selectedProperty.title}"
              </p>
            </div>

            <div className="space-y-3">
              {activePlans.map((plan) => (
                <div
                  key={plan.key}
                  onClick={() => setBoostPlan(plan.key)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between ${boostPlan === plan.key
                    ? "bg-purple-600 text-white border-transparent shadow-lg shadow-purple-600/20"
                    : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                    }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold">{plan.name}</span>
                    <span className="text-xs opacity-80">Valid for {plan.durationDays} days</span>
                  </div>
                  <span className="text-xl font-extrabold font-sans">₹{plan.price}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpenBoostModal(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBoostPayment}
                disabled={boosting}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
              >
                {boosting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : !isPaymentEnabled ? (
                  "Boost Now (Free)"
                ) : (
                  "Pay Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
