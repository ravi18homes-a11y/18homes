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
  Copy,
  Trees,
  Car,
  ParkingCircle,
  ArrowUpDown,
  ShieldCheck,
  Trash2,
  Droplet,
  Smile,
  Bus,
  Flame,
  CreditCard,
  Train,
  GraduationCap,
  HeartPulse,
  MessageSquare,
} from "lucide-react";
import ChatModal from "../../components/ChatModal";
import { tracker } from "@/lib/tracker";

const AMENITY_ICONS = {
  "garden": { label: "Garden", icon: <Trees className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "reserve parking": { label: "Reserve Parking", icon: <Car className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "visitor parking": { label: "Visitor Parking", icon: <ParkingCircle className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "lift": { label: "Lift", icon: <ArrowUpDown className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "security": { label: "Security", icon: <ShieldCheck className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "waste disposal": { label: "Waste Disposal", icon: <Trash2 className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "parks": { label: "Parks", icon: <Trees className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "24x7 water": { label: "24X7 Water", icon: <Droplet className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "kids area": { label: "Kids Area", icon: <Smile className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "bus service": { label: "Bus Service", icon: <Bus className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "piped gas": { label: "Piped Gas", icon: <Flame className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
  "atm": { label: "ATM", icon: <CreditCard className="w-10 h-10 text-[#ff6c00] flex-shrink-0" /> },
};

const DISTANCE_INFO = {
  "busStand": { label: "Bus Stand", icon: <Bus className="w-10 h-10 text-[#0f3460] flex-shrink-0" /> },
  "metroStation": { label: "Metro Station", icon: <Train className="w-10 h-10 text-[#0f3460] flex-shrink-0" /> },
  "atm": { label: "ATM", icon: <CreditCard className="w-10 h-10 text-[#0f3460] flex-shrink-0" /> },
  "school": { label: "School", icon: <GraduationCap className="w-10 h-10 text-[#0f3460] flex-shrink-0" /> },
  "hospital": { label: "Hospital", icon: <HeartPulse className="w-10 h-10 text-[#0f3460] flex-shrink-0" /> },
};
import Link from "next/link";
import EmiCalculator from "@/app/components/EmiCalculator";
import PropertyReviews from "@/app/components/PropertyReviews";
import { FaWhatsapp, FaFacebook, FaTwitter } from "react-icons/fa";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [activePopover, setActivePopover] = useState(null);

  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL || "";

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const token = localStorage.getItem("authToken");
      if (!token || !id || !databaseUrl) return;
      try {
        const res = await fetch(`${databaseUrl}/api/properties/my/saved`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const savedList = json.data || json;
          if (Array.isArray(savedList)) {
            const isSaved = savedList.some((p) => (p._id || p.id) === id);
            setIsFavorite(isSaved);
          }
        }
      } catch (err) {
        console.error("Error checking favorite status:", err);
      }
    };
    checkFavoriteStatus();
  }, [id, databaseUrl]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Please login to add to wishlist");
      return;
    }

    const nextState = !isFavorite;
    // Optimistic UI update
    setIsFavorite(nextState);

    try {
      const res = await fetch(`${databaseUrl}/api/properties/${id}/save`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // Rollback
        setIsFavorite(!nextState);
        const data = await res.json();
        toast.error(data.message || "Failed to update wishlist");
      } else {
        const data = await res.json();
        toast.success(data.message || (nextState ? "Added to wishlist" : "Removed from wishlist"));

        tracker.trackEvent(nextState ? "property_save" : "property_unsave", {
          propertyId: String(property?._id || property?.id || id || ""),
          propertyDetails: {
            title: property?.title || "Property Listing",
            propertyType: property?.propertyType || "flat",
            location: property?.address?.city || property?.location || "Noida",
            price: property?.price || 0,
            priceText: property?.priceText || "",
            bhk: property?.bedrooms ? `${property.bedrooms} BHK` : "",
          },
        });

        if (nextState) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.8 }
          });
        }
      }
    } catch (err) {
      // Rollback
      setIsFavorite(!nextState);
      toast.error("Error updating wishlist");
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const DEFAULT_IMAGE =
    "https://res.cloudinary.com/domwj0m7s/image/upload/v1785084052/ChatGPT_Image_Jul_26_2026_10_10_07_PM_uuqc8u.png";

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

            // Save to recent history
            const token = localStorage.getItem("authToken");
            if (token && databaseUrl) {
              // Logged in: Save to backend database
              fetch(`${databaseUrl}/api/properties/${transformedProperty._id || transformedProperty.id}/history`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
              }).catch((err) => console.error("Error saving view to backend history:", err));
            } else {
              // Guest: Save to localStorage recent history
              try {
                const historyJson = localStorage.getItem("recentProperties");
                let history = [];
                if (historyJson) {
                  history = JSON.parse(historyJson);
                }
                if (!Array.isArray(history)) {
                  history = [];
                }
                const propId = transformedProperty._id || transformedProperty.id;
                // Remove duplicate if it already exists
                history = history.filter((item) => (item._id || item.id) !== propId);
                
                // Add to start of array
                history.unshift({
                  _id: propId,
                  id: propId,
                  title: transformedProperty.title,
                  location: transformedProperty.location,
                  price: transformedProperty.price,
                  priceText: transformedProperty.priceText,
                  priceValue: transformedProperty.priceValue,
                  bedrooms: transformedProperty.bedrooms,
                  bathrooms: transformedProperty.bathrooms,
                  area: transformedProperty.area,
                  image: transformedProperty.images?.[0] || transformedProperty.image || "https://res.cloudinary.com/domwj0m7s/image/upload/v1785084052/ChatGPT_Image_Jul_26_2026_10_10_07_PM_uuqc8u.png",
                  type: transformedProperty.type,
                  status: transformedProperty.status,
                  visitedAt: new Date().toISOString()
                });
                
                // Keep only the 20 most recent
                localStorage.setItem("recentProperties", JSON.stringify(history.slice(0, 20)));
              } catch (err) {
                console.error("Error saving recent history to localStorage:", err);
              }
            }

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

  const trackPropertyAnalytics = async (eventType, extraData = {}) => {
    if (!property) return;
    try {
      const userDataStr = typeof window !== "undefined" ? localStorage.getItem("userData") : null;
      let currentUser = {};
      if (userDataStr) {
        try { currentUser = JSON.parse(userDataStr); } catch (e) {}
      }

      const ownerId = property.owner?._id || property.owner?.id || property.owner || property.userId || property.builderId || "";
      const ownerEmail = property.owner?.email || "";
      const currentUserId = currentUser._id || currentUser.id || "";

      let visitorId = "";
      if (typeof window !== "undefined") {
        visitorId = localStorage.getItem("18homes_visitor_id");
        if (!visitorId) {
          visitorId = "vis_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
          localStorage.setItem("18homes_visitor_id", visitorId);
        }
      }

      const payload = {
        id: Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        eventType, // "page_view", "view_contact", "phone_click", "whatsapp_click", "time_spent"
        propertyId: String(property._id || property.id || ""),
        propertyTitle: property.title || "Property Listing",
        builderId: String(ownerId),
        builderEmail: String(ownerEmail),
        userId: String(currentUserId),
        visitorId: visitorId,
        city: property.address?.city || property.address?.locality || property.location || "Noida",
        flatUnit: property.flatNo || property.unitNo || property.title || "A-302",
        userName: currentUser.name || "Guest Visitor",
        userEmail: currentUser.email || "visitor@18homes.in",
        userPhone: currentUser.phone || "+91 98765 43210",
        timestamp: new Date().toISOString(),
        durationSec: extraData.durationSec || 0,
      };

      // Send to centralized first-party behavior tracker
      const normalizedEventType =
        eventType === "page_view"
          ? "property_view"
          : eventType === "phone_click"
          ? "call_click"
          : eventType;

      tracker.trackEvent(normalizedEventType, {
        propertyId: String(property._id || property.id || ""),
        propertyDetails: {
          title: property.title || "Property Listing",
          propertyType: property.propertyType || "flat",
          location: property.address?.city || property.address?.locality || property.location || "Noida",
          price: property.price || 0,
          priceText: property.priceText || "",
          bhk: property.bedrooms ? `${property.bedrooms} BHK` : "",
          ownerId: String(ownerId),
        },
        metadata: extraData,
      });

      if (databaseUrl) {
        fetch(`${databaseUrl}/api/properties/analytics/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      }

      const existingLogsStr = localStorage.getItem("18homes_analytics_events");
      let logs = [];
      if (existingLogsStr) {
        try { logs = JSON.parse(existingLogsStr); } catch(e) {}
      }
      if (!Array.isArray(logs)) logs = [];
      logs.unshift(payload);
      localStorage.setItem("18homes_analytics_events", JSON.stringify(logs.slice(0, 1000)));
    } catch (err) {
      console.error("Error tracking analytics:", err);
    }
  };

  useEffect(() => {
    if (!property) return;
    const startTime = Date.now();
    trackPropertyAnalytics("page_view");

    return () => {
      const timeSpentSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      trackPropertyAnalytics("time_spent", { durationSec: timeSpentSec });
    };
  }, [property?._id || property?.id]);

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
    trackPropertyAnalytics("view_contact");
    
    try {
      const parsedUser = JSON.parse(userDataStr);
      
      // 1. Send dynamic email notification
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

      // 2. Increment contact click count & Create Lead Entry in MongoDB
      try {
        fetch(`${databaseUrl}/api/contacts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            propertyId: id,
            message: "Buyer requested contact details on 18homes",
          }),
        }).catch(() => {});

        const clickRes = await fetch(`${databaseUrl}/api/properties/${id}/contact-click`, {
          method: 'POST'
        });
        if (clickRes.ok) {
          const clickData = await clickRes.json();
          if (clickData.success && clickData.data) {
            setProperty(prev => ({
              ...prev,
              contactClickCount: clickData.data.contactClickCount
            }));
          }
        }
      } catch (clickErr) {
        console.error("Error incrementing contact click count:", clickErr);
      }
      
      setShowDetails(true);
    } catch (error) {
      console.error("Error viewing details", error);
      setShowDetails(true);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const [selectedConvId, setSelectedConvId] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [existingConv, setExistingConv] = useState(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("userData");
      if (u) setCurrentUser(JSON.parse(u));
    } catch (e) {}
  }, []);

  useEffect(() => {
    const checkExistingChat = async () => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken || !id || !databaseUrl) return;

      try {
        const res = await fetch(`${databaseUrl}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const found = json.data.find(
              (c) =>
                (c.property?._id || c.property?.id || c.property) === id
            );
            if (found) {
              setExistingConv(found);
            }
          }
        }
      } catch (err) {
        console.error("Error checking existing chat:", err);
      }
    };
    checkExistingChat();
  }, [id, databaseUrl]);

  const handleRequestLiveChat = async () => {
    const userDataStr = localStorage.getItem("userData");
    const authToken = localStorage.getItem("authToken");

    if (!userDataStr || !authToken) {
      toast.error("Please login to chat with property dealer");
      router.push("/login-signup");
      return;
    }

    if (existingConv) {
      setSelectedConvId(existingConv._id);
      setIsChatModalOpen(true);
      return;
    }

    try {
      toast.loading("Sending live chat request...", { id: "chat-req" });
      const res = await fetch(`${databaseUrl}/api/chat/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          propertyId: id,
          message: `Hi, I am interested in ${property?.title || 'this property'}. Can we chat?`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          toast.success("Chat request sent to dealer!", { id: "chat-req" });
          setExistingConv(data.data);
          setSelectedConvId(data.data._id);
          setIsChatModalOpen(true);
        }
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to send chat request", { id: "chat-req" });
      }
    } catch (err) {
      console.error("Chat request error:", err);
      toast.error("Error connecting to server", { id: "chat-req" });
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
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <button
            onClick={toggleFavorite}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-6 h-6 ${isFavorite ? "fill-red-600 text-red-600" : "text-gray-600"}`}
            />
          </button>
          <button
            onClick={handleShare}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Share property link"
          >
            <Share2 className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {(() => {
          const propId = property.id || property._id;
          return (
            <>
              {/* Verified Badge Icon */}
              {property.owner?.role === "admin" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActivePopover(
                      activePopover?.id === propId && activePopover?.type === "verified"
                        ? null
                        : { id: propId, type: "verified" }
                    );
                  }}
                  className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center bg-green-600 text-white font-extrabold shadow-md z-20 hover:scale-105 hover:bg-green-700 transition-all text-base cursor-pointer"
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
                      activePopover?.id === propId && activePopover?.type === "star"
                        ? null
                        : { id: propId, type: "star" }
                    );
                  }}
                  className={`absolute top-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold shadow-md z-20 hover:scale-105 transition-all text-base cursor-pointer ${
                    property.owner?.role === "admin" ? "left-14" : "left-4"
                  } ${property.isBoosted ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
                  title={property.isBoosted ? "High Rated (Boosted)" : "Featured Property"}
                >
                  ★
                </button>
              )}

              {/* Verified Popover */}
              {activePopover?.id === propId && activePopover?.type === "verified" && (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="absolute top-14 left-4 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 z-30 p-3 w-60 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150"
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
                      className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
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
              {activePopover?.id === propId && activePopover?.type === "star" && (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className={`absolute top-14 ${
                    property.owner?.role === "admin" ? "left-14" : "left-4"
                  } bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 z-30 p-3 w-60 pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150`}
                >
                  <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-gray-100">
                    <span className={`font-bold text-xs flex items-center gap-1 ${
                      property.isBoosted ? "text-blue-600" : "text-red-600"
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
                      className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
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
            </>
          );
        })()}

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
                  {property.owner?.role === "admin" && (
                    <span className="px-4 py-2 rounded-full bg-green-600 text-white font-bold whitespace-nowrap self-start shadow-sm border border-green-300">
                      ✓ Verified
                    </span>
                  )}
                  {property.isBoosted && (
                    <span className="px-4 py-2 rounded-full bg-[blue] text-white font-bold whitespace-nowrap self-start shadow-sm border border-blue-300">
                      ★ High Rated (Boosted)
                    </span>
                  )}
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

              {/* Premium Property Specifications Grid */}
              <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6">
                  {/* PROPERTY FOR */}
                  {property.purpose && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">PROPERTY FOR:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase">
                        {property.purpose === "sell" ? "SALE" : "RENT"}
                      </span>
                    </div>
                  )}

                  {/* PROPERTY TYPE */}
                  {property.propertyType && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">PROPERTY TYPE:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase">
                        {property.propertyType === "commercial" ? "COMMERCIAL" : "RESIDENTIAL"}
                      </span>
                    </div>
                  )}

                  {/* CATEGORY */}
                  {property.propertyType && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">CATEGORY:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase">
                        {property.propertyType === "commercial"
                          ? (property.commercialType === "other" && property.commercialTypeCustom
                            ? property.commercialTypeCustom
                            : property.commercialType || "COMMERCIAL")
                          : (property.propertyType === "apartment" ? "SOCIETY FLATS" : property.propertyType || "RESIDENTIAL")}
                      </span>
                    </div>
                  )}

                  {/* UNIT SIZE */}
                  {property.area && !["—", "N/A", "not specified", "Not specified"].includes(String(property.area).trim()) && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">UNIT SIZE:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {/^[0-9\s.,]+$/.test(String(property.area).trim())
                          ? `${property.area} SQ-FT`
                          : property.area}
                      </span>
                    </div>
                  )}

                  {/* TOTAL FLOORS */}
                  {property.totalFloors && !["—", "N/A"].includes(String(property.totalFloors).trim()) && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">TOTAL FLOORS:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {property.totalFloors} FLOORS
                      </span>
                    </div>
                  )}

                  {/* FLOOR NO */}
                  {property.floorNo && !["—", "N/A"].includes(String(property.floorNo).trim()) && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">FLOOR NO.:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {property.floorNo} TH
                      </span>
                    </div>
                  )}

                  {/* AGE OF PROPERTY */}
                  {property.ageOfProperty && !["—", "N/A"].includes(String(property.ageOfProperty).trim()) && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">AGE OF PROPERTY:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {property.ageOfProperty}
                      </span>
                    </div>
                  )}

                  {/* BEDROOMS */}
                  {property.bedrooms && Number(property.bedrooms) > 0 ? (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">BEDROOM(S):</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {property.bedrooms}
                      </span>
                    </div>
                  ) : null}

                  {/* BATHROOMS */}
                  {property.bathrooms && Number(property.bathrooms) > 0 ? (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">BATHROOM(S):</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {property.bathrooms}
                      </span>
                    </div>
                  ) : null}

                  {/* BALCONIES */}
                  {property.balconies && Number(property.balconies) > 0 ? (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">BALCONY(S):</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {property.balconies}
                      </span>
                    </div>
                  ) : null}

                  {/* PRICE / SQ.FT. */}
                  {(() => {
                    if (!property.priceValue || !property.area) return null;
                    const numericArea = parseFloat(String(property.area).replace(/[^\d.]/g, ""));
                    if (isNaN(numericArea) || numericArea === 0) return null;
                    return (
                      <div>
                        <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">PRICE / SQ.FT.:</span>
                        <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                          {Math.round(property.priceValue / numericArea)} PER SQFT.
                        </span>
                      </div>
                    );
                  })()}

                  {/* FURNISHING */}
                  {property.furnishing && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">FURNISHING:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {String(property.furnishing).replace("-", " ")}
                      </span>
                    </div>
                  )}

                  {/* PRICE */}
                  {(property.priceText || property.priceValue || property.price) && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">PRICE:</span>
                      <span className="block text-lg font-extrabold text-red-600 mt-1 uppercase">
                        {(() => {
                          const pr = property.priceText || property.priceValue || property.price;
                          let formatted = String(pr).toUpperCase();
                          if (!formatted.endsWith(".")) formatted = formatted + ".";
                          if (!formatted.startsWith("₹")) formatted = "₹ " + formatted;
                          return formatted;
                        })()}
                      </span>
                    </div>
                  )}

                  {/* STATUS */}
                  {property.status && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">STATUS:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {property.status}
                      </span>
                    </div>
                  )}

                  {/* POSTED ON */}
                  {property.createdAt && (
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">POSTED ON:</span>
                      <span className="block text-base font-bold text-slate-800 mt-1 uppercase font-bold">
                        {(() => {
                          const date = new Date(property.createdAt);
                          if (isNaN(date.getTime())) return String(property.createdAt).toUpperCase();
                          const options = { year: "numeric", month: "long", day: "2-digit" };
                          return date.toLocaleDateString("en-US", options).toUpperCase();
                        })()}
                      </span>
                    </div>
                  )}
                </div>
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

            {/* Amenities Section */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-[#0f3460] mb-6">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {property.amenities.map((amenity, index) => {
                    const normKey = String(amenity).trim().toLowerCase();
                    const info = AMENITY_ICONS[normKey] || {
                      label: amenity,
                      icon: <CheckCircle className="w-10 h-10 text-[#ff6c00] flex-shrink-0" />
                    };
                    return (
                      <div key={index} className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow bg-slate-50/50">
                        <div className="mb-2">{info.icon}</div>
                        <span className="text-sm font-semibold text-gray-700 text-center">{info.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Distances Section */}
            {property.distances && Object.values(property.distances).some(Boolean) && (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-[#0f3460] mb-6">
                  Distances
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {Object.entries(property.distances).map(([key, val]) => {
                    if (!val) return null;
                    const info = DISTANCE_INFO[key] || {
                      label: key.charAt(0).toUpperCase() + key.slice(1),
                      icon: <MapPin className="w-10 h-10 text-[#0f3460] flex-shrink-0" />
                    };
                    return (
                      <div key={key} className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-2xl hover:shadow-md transition-shadow bg-slate-50/50">
                        <div className="mb-2">{info.icon}</div>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">{info.label}</span>
                        <span className="text-sm font-bold text-slate-800 text-center mt-1">
                          {val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User Ratings & Reviews Section */}
            <PropertyReviews
              propertyId={property._id || property.id}
              ownerId={property.owner?._id || property.owner?.id || property.owner}
            />
          </div>

          {/* Right Column - Contact Agent */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Contact Us
              </h3>

              {showDetails ? (
                <>
                  {property.contactClickCount > 0 && (
                    <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                      <span>{property.contactClickCount} {property.contactClickCount === 1 ? 'person has' : 'people have'} already contacted the seller</span>
                    </div>
                  )}
                  {property.owner ? (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-2xl font-bold">
                            {property.owner.name?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800">
                              {property.owner.name || "Seller"}
                            </p>
                            {property.owner?.role === "admin" && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold text-green-700 bg-green-100 rounded border border-green-200">
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-xs text-gray-600 capitalize">{property.owner?.role || "Owner"}</p>
                            {property.owner?.averageRating && (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                ★ {Number(property.owner.averageRating).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        {property.owner?.phone && (
                          <a
                            href={`tel:${property.owner.phone}`}
                            onClick={() => trackPropertyAnalytics("phone_click")}
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
                            onClick={() => trackPropertyAnalytics("whatsapp_click")}
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
                      onClick={() => trackPropertyAnalytics("phone_click")}
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
                  {property.contactClickCount > 0 && (
                    <div className="mb-4 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 flex items-center gap-1.5 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                      <span>{property.contactClickCount} {property.contactClickCount === 1 ? 'person has' : 'people have'} already contacted</span>
                    </div>
                  )}
                  <div className="w-[90%] flex flex-col gap-2">
                    <button 
                      onClick={handleViewDetails}
                      disabled={isLoadingDetails}
                      className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
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

                    <button
                      onClick={handleRequestLiveChat}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>{existingConv ? "View Live Chat" : "Request Live Chat"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* <button className="w-full mt-3 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors">
                Send Message
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* EMI Calculator Section */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <EmiCalculator propertyPrice={property?.priceValue || property?.price || property?.priceText} />
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

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share Property</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                aria-label="Close share dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Social Buttons Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this property: ${property?.title} in ${property?.location}\n${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                  <FaWhatsapp className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">WhatsApp</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <FaFacebook className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">Facebook</span>
              </a>

              {/* Twitter/X */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&text=${encodeURIComponent(`Check out this property: ${property?.title} in ${property?.location}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                  <FaTwitter className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">Twitter</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:?subject=${encodeURIComponent(`Interested in: ${property?.title}`)}&body=${encodeURIComponent(`Check out this property: ${property?.title} in ${property?.location}\n\nLink: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900">Email</span>
              </a>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Copy Link Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Copy Link</label>
              <div className="flex sm:flex-row flex-col gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : ""}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 select-all outline-none focus:border-red-600"
                />
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                  className="px-4 py-2 bg-red-600 max-w-[100px] text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>
            </div>

            {/* Native Share fallback if supported */}
            {typeof navigator !== "undefined" && navigator.share && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    navigator.share({
                      title: property?.title,
                      text: `Check out this property: ${property?.title} in ${property?.location}`,
                      url: window.location.href,
                    }).catch((err) => console.log('Error sharing:', err));
                  }}
                  className="w-full py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  More Share Options
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Chat Modal */}
      <ChatModal
        conversationId={selectedConvId}
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
};

export default PropertyDetailsPage;
