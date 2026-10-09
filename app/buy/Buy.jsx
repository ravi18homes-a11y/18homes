"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  Filter,
  Heart,
  X,
  Loader2,
  Share2,
  ChevronRight,
  ChevronLeft,
  Award,
} from "lucide-react";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import FeaturedAgentsWidget from "../../components/FeaturedAgentsWidget";
import { tracker } from "@/lib/tracker";

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

const INITIAL_FILTERS = {
  propertyType: "all",
  commercialType: "all",
  commercialTypeCustom: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "any",
  bathrooms: "any",
  furnishing: "all",
  minArea: "",
  maxArea: "",
  purpose: "all",
  sortBy: "newest",
  areaUnit: "",
  custom: "",
  shopSize: "",
  officeType: "",
  isBoosted: "",
};

const BuyPage = () => {
  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL;
  const searchParams = useSearchParams();
  const searchQueryString = searchParams.toString();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [favorites, setFavorites] = useState([]);
  const [activePopover, setActivePopover] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

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
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 9,
  });
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const fetchIdRef = useRef(0);

  const normalizeString = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : value;

  useEffect(() => {
    const queryFilters = { ...INITIAL_FILTERS };
    const params = new URLSearchParams(searchQueryString);
    const paramKeys = [
      "propertyType",
      "commercialType",
      "commercialTypeCustom",
      "city",
      "minPrice",
      "maxPrice",
      "bedrooms",
      "bathrooms",
      "furnishing",
      "purpose",
      "sortBy",
      "areaUnit",
      "custom",
      "shopSize",
      "officeType",
      "isBoosted",
    ];

    paramKeys.forEach((key) => {
      const value = params.get(key);
      if (value !== null) {
        queryFilters[key] = [
          "propertyType",
          "commercialType",
          "commercialTypeCustom",
          "furnishing",
          "purpose",
          "sortBy",
          "areaUnit",
          "custom",
          "shopSize",
          "officeType",
          "isBoosted",
        ].includes(key)
          ? normalizeString(value)
          : value;
      }
    });

    setFilters((prev) => ({ ...prev, ...queryFilters }));
    setFiltersInitialized(true);
  }, [searchQueryString]);

  const fetchProperties = useCallback(
    async (page = 1) => {
      const fetchId = ++fetchIdRef.current;

      if (!databaseUrl) {
        if (fetchId === fetchIdRef.current) {
          setError("Database URL is not configured.");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (searchQuery) params.append("search", searchQuery);
        if (filters.city) params.append("city", filters.city);
        if (filters.purpose && filters.purpose !== "all") params.append("purpose", filters.purpose);
        if (filters.propertyType !== "all")
          params.append("propertyType", filters.propertyType);
        if (filters.propertyType === "commercial" && filters.commercialType && filters.commercialType !== "all") {
          params.append("commercialType", filters.commercialType);
          if (filters.commercialType === "other" && filters.commercialTypeCustom) {
            params.append("commercialTypeCustom", filters.commercialTypeCustom);
          }
        }
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (filters.bedrooms !== "any")
          params.append("bedrooms", filters.bedrooms);
        if (filters.furnishing !== "all")
          params.append("furnishing", filters.furnishing);
        if (filters.areaUnit) params.append("areaUnit", filters.areaUnit);
        if (filters.shopSize) params.append("shopSize", filters.shopSize);
        if (filters.officeType) params.append("officeType", filters.officeType);
        if (filters.custom) params.append("custom", filters.custom);
        if (filters.isBoosted === "true") params.append("isBoosted", "true");

        let sortParam = "-createdAt";
        if (filters.sortBy === "price-low") sortParam = "price";
        if (filters.sortBy === "price-high") sortParam = "-price";
        if (filters.sortBy === "area") sortParam = "-area";
        params.append("sort", sortParam);

        params.append("page", page.toString());
        const currentLimit = selectedAgent ? 100 : pagination.limit;
        params.append("limit", currentLimit.toString());

        const apiUrl = `${databaseUrl}/api/properties?${params.toString()}`;
        console.log("Fetching from:", apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Track search & filter action if query or filters are active
        if (searchQuery || filters.city || filters.propertyType !== "all" || filters.minPrice || filters.maxPrice || filters.bedrooms !== "any") {
          tracker.trackEvent("property_search", {
            searchDetails: {
              query: searchQuery || "",
              filters: {
                city: filters.city || "",
                propertyType: filters.propertyType !== "all" ? filters.propertyType : "",
                bedrooms: filters.bedrooms !== "any" ? filters.bedrooms : "",
                minPrice: filters.minPrice || "",
                maxPrice: filters.maxPrice || "",
              },
              sortBy: filters.sortBy || "relevance",
            },
            metadata: {
              resultCount: data.data?.properties?.length || 0,
            },
          });
        }

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
              ? `${prop.owner.name}, ${prop.owner.phone}`
              : "Owner info not available";

            return {
              id: prop._id || prop.id,
              title: prop.title || "No Title",
              location: ` ${prop.address.city ? prop.address.city : `NCR Reason (Not Disclosed)`}`,
              price: prop.priceText || prop.priceValue || prop.price || "",
              bedrooms: prop.bedrooms || 0,
              bathrooms: prop.bathrooms || 0,
              floorNo: prop.floorNo || "",
              totalFloors: prop.totalFloors || "",
              isHighRise: prop.isHighRise || false,
              updatedAt: prop.updatedAt || 0,
              createdAt: prop.createdAt || 0,
              area: areaValue,
              areaUnit:
                typeof prop.area === "object" && prop.area !== null
                  ? normalizeString(prop.area.unit || "")
                  : "",
              shopSize: normalizeString(prop.shopSize || ""),
              officeType: normalizeString(prop.officeType || ""),
              commercialType: normalizeString(prop.commercialType || ""),
              commercialTypeCustom: normalizeString(prop.commercialTypeCustom || ""),
              custom:
                typeof prop.custom === "string"
                  ? normalizeString(prop.custom) === "true"
                  : Boolean(prop.custom),
              purpose: normalizeString(prop.purpose || "sell"),
              type: prop.propertyType === "commercial"
                ? (prop.commercialType === "other" && prop.commercialTypeCustom
                  ? `Commercial (${prop.commercialTypeCustom})`
                  : (prop.commercialType ? `Commercial (${prop.commercialType === "pg" ? "P.G" : prop.commercialType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')})` : "Commercial"))
                : normalizeString(prop.propertyType || "apartment"),
              image: validImages.length > 0 ? getMediaThumbnail(validImages[0]) : DEFAULT_IMAGE,
              status:
                normalizeString(prop.purpose || "sell") === "rent"
                  ? "For Rent"
                  : "For Sale",
              featured: prop.featured || false,
              isBoosted: prop.isBoosted || false,
              listedBy: prop.listedBy || "owner",
              isSold: prop.isSold || false,
              owner: prop.owner,
              averageRating: prop.averageRating !== undefined ? prop.averageRating : 5.0,
              totalRatings: prop.totalRatings || 0,
            };
          });

          if (fetchId !== fetchIdRef.current) return;
          setProperties(transformedProperties);

          if (data.data.pagination) {
            setPagination(data.data.pagination);
          }
        } else {
          if (fetchId !== fetchIdRef.current) return;
          setProperties([]);
        }
      } catch (err) {
        if (fetchId !== fetchIdRef.current) return;
        console.error("Error fetching properties:", err);
        setError("Failed to load properties. Please try again.");
        setProperties([]);
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    },
    [databaseUrl, searchQuery, filters, selectedAgent, pagination.limit],
  );

  // Reset to page 1 whenever search/filters change, then fetch
  useEffect(() => {
    if (!filtersInitialized) return;
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchProperties(1);
  }, [searchQuery, filters, selectedAgent, filtersInitialized, fetchProperties]);

  // Fetch when page changes (but not when filters/search trigger a reset)
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchProperties(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPhoneDigits = (phone) => {
    if (!phone || typeof phone !== "string") return "";
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10 ? digits.slice(-10) : digits;
  };

  const handleSelectAgent = (dealer, ad) => {
    const dealerId = dealer._id || dealer.id;
    if (selectedAgent && (selectedAgent.id === dealerId || (selectedAgent.name && selectedAgent.name === dealer.name))) {
      setSelectedAgent(null);
      toast.success("Showing all properties");
    } else {
      setSelectedAgent({
        id: dealerId ? String(dealerId) : "",
        name: dealer.name || "Featured Agent",
        email: dealer.email || "",
        phone: dealer.phone || "",
      });
      toast.success(`Filtering properties for ${dealer.name || "Agent"}`);
    }
  };

  const shouldApplyClientFilters =
    selectedAgent !== null ||
    filters.bathrooms !== "any" ||
    filters.minArea !== "" ||
    filters.maxArea !== "" ||
    filters.areaUnit !== "" ||
    filters.shopSize !== "" ||
    filters.officeType !== "" ||
    filters.custom !== "" ||
    filters.isBoosted === "true" ||
    (filters.propertyType === "commercial" && (filters.commercialType !== "all" || filters.commercialTypeCustom));

  const calculateClientRelevance = (property, query, currentFilters) => {
    let score = 0;
    if (currentFilters.city && property.location && property.location.toLowerCase().includes(currentFilters.city.toLowerCase())) {
      score += 100;
    }
    if (query) {
      const s = query.toLowerCase();
      if (property.title && property.title.toLowerCase().includes(s)) score += 40;
      if (property.location && property.location.toLowerCase().includes(s)) score += 50;
    }
    if (currentFilters.bedrooms && currentFilters.bedrooms !== "any") {
      const reqB = Number(currentFilters.bedrooms);
      const propB = Number(property.bedrooms || 0);
      if (reqB === propB) score += 50;
      else if (Math.abs(reqB - propB) === 1) score += 25;
    }
    return score;
  };

  const sortPropertiesByPrioritiesClient = (list, query, currentFilters) => {
    return [...list].sort((a, b) => {
      const relA = calculateClientRelevance(a, query, currentFilters);
      const relB = calculateClientRelevance(b, query, currentFilters);
      if (relB !== relA) return relB - relA;

      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;

      const engA = Number(a.views || 0) + Number(a.contactClickCount || 0) * 5;
      const engB = Number(b.views || 0) + Number(b.contactClickCount || 0) * 5;
      return engB - engA;
    });
  };

  const interleaveFeedClient = (boostedList, normalList) => {
    const mixed = [];
    let bIdx = 0;
    let nIdx = 0;
    const intervals = [3, 4, 3, 5, 4];
    let intervalIdx = 0;

    if (bIdx < boostedList.length) {
      mixed.push(boostedList[bIdx++]);
    }

    while (nIdx < normalList.length || bIdx < boostedList.length) {
      const countToInsert = intervals[intervalIdx % intervals.length];
      intervalIdx++;

      for (let i = 0; i < countToInsert && nIdx < normalList.length; i++) {
        mixed.push(normalList[nIdx++]);
      }

      if (bIdx < boostedList.length) {
        mixed.push(boostedList[bIdx++]);
      }
    }

    return mixed;
  };

  const rawFiltered = (shouldApplyClientFilters
    ? properties.filter((property) => {
      const matchesBath =
        filters.bathrooms === "any" ||
        property.bathrooms >= parseInt(filters.bathrooms);
      const matchesMinArea =
        !filters.minArea || property.area >= parseInt(filters.minArea);
      const matchesMaxArea =
        !filters.maxArea || property.area <= parseInt(filters.maxArea);

      const normalizedPropertyType = normalizeString(property.type);
      const normalizedPropertyPurpose = normalizeString(property.purpose);
      const normalizedAreaUnit = normalizeString(property.areaUnit);
      const normalizedShopSize = normalizeString(property.shopSize);
      const normalizedOfficeType = normalizeString(property.officeType);
      const normalizedCustom = String(property.custom).toLowerCase();

      const normalizedFilterType = normalizeString(filters.propertyType);
      const normalizedFilterPurpose = normalizeString(filters.purpose);
      const normalizedFilterAreaUnit = normalizeString(filters.areaUnit);
      const normalizedFilterShopSize = normalizeString(filters.shopSize);
      const normalizedFilterOfficeType = normalizeString(filters.officeType);
      const normalizedFilterCustom = normalizeString(filters.custom);

      const matchesType =
        normalizedFilterType === "all" ||
        !normalizedFilterType ||
        ((normalizedFilterType === "agriculture" || normalizedFilterType === "land") && (
          normalizedPropertyType === "agriculture" ||
          normalizedPropertyType === "land" ||
          (normalizedPropertyType.startsWith("commercial") && (
            /land|acre|bigha|biswa|hectare/i.test(property.commercialType || "") ||
            /land|acre|bigha|biswa|hectare/i.test(property.commercialTypeCustom || "") ||
            /land|acre|bigha|biswa|hectare/i.test(property.title || "") ||
            /land|acre|bigha|biswa|hectare/i.test(property.description || "")
          ))
        )) ||
        (normalizedFilterType === "bank_auction" && (
          normalizedPropertyType === "bank_auction" ||
          /bank auction|auction/i.test(property.title || "") ||
          /bank auction|auction/i.test(property.description || "")
        )) ||
        (normalizedFilterType === "pre_launch" && (
          normalizedPropertyType === "pre_launch" ||
          /pre launch|pre-launch|investment/i.test(property.title || "") ||
          /pre launch|pre-launch|investment/i.test(property.description || "")
        )) ||
        (normalizedFilterType === "studio_apartment" && (
          normalizedPropertyType === "studio_apartment" ||
          /studio/i.test(property.title || "") ||
          /studio/i.test(property.description || "")
        )) ||
        (normalizedFilterType === "shop" && (
          normalizedPropertyType === "shop" ||
          /shop|showroom|store/i.test(property.type || "") ||
          /shop|showroom|store/i.test(property.title || "")
        )) ||
        (normalizedFilterType !== "agriculture" && normalizedFilterType !== "land" && normalizedPropertyType === normalizedFilterType) ||
        (normalizedFilterType === "commercial" && normalizedPropertyType.startsWith("commercial"));

      const matchesCommercialType =
        normalizedFilterType !== "commercial" ||
        filters.commercialType === "all" ||
        !filters.commercialType ||
        normalizeString(property.commercialType) === normalizeString(filters.commercialType);

      const matchesCommercialTypeCustom =
        normalizedFilterType !== "commercial" ||
        filters.commercialType !== "other" ||
        !filters.commercialTypeCustom ||
        normalizeString(property.commercialTypeCustom).includes(normalizeString(filters.commercialTypeCustom));

      const matchesPurpose =
        !normalizedFilterPurpose ||
        normalizedFilterPurpose === "all" ||
        normalizedPropertyPurpose === normalizedFilterPurpose;
      const matchesAreaUnit =
        !normalizedFilterAreaUnit ||
        normalizedAreaUnit === normalizedFilterAreaUnit ||
        (normalizedFilterType === "agriculture" && (
          normalizeString(property.commercialTypeCustom).includes(normalizedFilterAreaUnit) ||
          normalizeString(property.commercialType).includes(normalizedFilterAreaUnit)
        ));

      const getPropertyShopSize = (prop) => {
        if (prop.shopSize && String(prop.shopSize).trim() !== "") {
          return normalizeString(prop.shopSize);
        }
        const numArea = Number(String(prop.area).replace(/\D/g, "")) || 0;
        if (numArea <= 0) return "small";
        if (numArea < 300) return "small";
        if (numArea < 800) return "medium";
        if (numArea < 2000) return "large";
        return "showroom";
      };

      const matchesShopSize =
        !normalizedFilterShopSize ||
        normalizedShopSize === normalizedFilterShopSize ||
        getPropertyShopSize(property) === normalizedFilterShopSize;
      const matchesOfficeType =
        !normalizedFilterOfficeType ||
        normalizedOfficeType === normalizedFilterOfficeType;
      const matchesCustom =
        !normalizedFilterCustom ||
        normalizedCustom === normalizedFilterCustom;
      const matchesBoosted =
        filters.isBoosted !== "true" ||
        property.isBoosted === true;

      return (
        matchesBath &&
        matchesMinArea &&
        matchesMaxArea &&
        matchesType &&
        matchesCommercialType &&
        matchesCommercialTypeCustom &&
        matchesPurpose &&
        matchesAreaUnit &&
        matchesShopSize &&
        matchesOfficeType &&
        matchesCustom &&
        matchesBoosted
      );
    })
    : properties
  ).filter((property) => {
    if (!selectedAgent) return true;

    const agentId = String(selectedAgent.id || "").trim();
    const agentName = String(selectedAgent.name || "").trim().toLowerCase();
    const agentEmail = String(selectedAgent.email || "").trim().toLowerCase();
    const agentPhoneDigits = getPhoneDigits(selectedAgent.phone);

    const owner = property.owner;
    const ownerId = String(
      owner?._id || owner?.id || (typeof owner === "string" ? owner : "") || property.userId || property.builderId || property.dealerId || ""
    ).trim();

    const ownerName = String(owner?.name || "").trim().toLowerCase();
    const ownerEmail = String(owner?.email || "").trim().toLowerCase();
    const ownerPhoneDigits = getPhoneDigits(owner?.phone);

    // 1. ID Match
    if (agentId && ownerId && agentId === ownerId) return true;

    // 2. Email Match
    if (agentEmail && ownerEmail && agentEmail === ownerEmail) return true;

    // 3. Phone Match
    if (agentPhoneDigits && ownerPhoneDigits && agentPhoneDigits === ownerPhoneDigits) return true;

    // 4. Name Match (exact or contains)
    if (agentName && ownerName) {
      if (agentName === ownerName || agentName.includes(ownerName) || ownerName.includes(agentName)) {
        return true;
      }
    }

    return false;
  });

  const filteredProperties = (filters.sortBy === "newest" || !filters.sortBy) && filters.isBoosted !== "true"
    ? interleaveFeedClient(
      sortPropertiesByPrioritiesClient(rawFiltered.filter((p) => p.isBoosted), searchQuery, filters),
      sortPropertiesByPrioritiesClient(rawFiltered.filter((p) => !p.isBoosted), searchQuery, filters)
    )
    : rawFiltered;

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="mt-24 shadow-sm border-b h-[400px] flex items-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
            url('https://res.cloudinary.com/dxlykgx6w/image/upload/v1765908762/chinese-city1_dujv0y.jpg')
          `,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            <div className="flex-1 max-w-[1720px] w-[200px] sm:w-[250px] md:w-[600px] lg:w-[700px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search location, property name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 text-white rounded-lg focus:outline-none bg-transparent placeholder-gray-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filter</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  value={filters.propertyType}
                  onChange={(e) =>
                    setFilters({ ...filters, propertyType: e.target.value, commercialType: "all" })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All</option>
                  <option value="flat">Flat</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">House</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="plot">Plot</option>
                  <option value="shop">Shop</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                  <option value="bank_auction">Bank Auction</option>
                  <option value="pre_launch">Pre Launch Investment</option>
                  <option value="studio_apartment">Studio Apartment</option>
                </select>
              </div>

              {filters.propertyType === "commercial" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commercial Type
                  </label>
                  <select
                    value={filters.commercialType}
                    onChange={(e) =>
                      setFilters({ ...filters, commercialType: e.target.value, commercialTypeCustom: "" })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="all">All Commercial Types</option>
                    <option value="hotel">Hotel</option>
                    <option value="hospital">Hospital</option>
                    <option value="school">School</option>
                    <option value="pg">P.G</option>
                    <option value="lease land">Lease Land</option>
                    <option value="commercial land">Commercial Land</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              {filters.propertyType === "commercial" && filters.commercialType === "other" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specify Custom Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Warehouse"
                    value={filters.commercialTypeCustom || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, commercialTypeCustom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="₹"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, minPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="₹"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters({ ...filters, maxPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={filters.city}
                  onChange={(e) =>
                    setFilters({ ...filters, city: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furnishing
                </label>
                <select
                  value={filters.furnishing}
                  onChange={(e) =>
                    setFilters({ ...filters, furnishing: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All</option>
                  <option value="furnished">Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi Furnished</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bedrooms: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bathrooms: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Area
                </label>
                <input
                  type="text"
                  placeholder="sq.ft"
                  value={filters.minArea}
                  onChange={(e) =>
                    setFilters({ ...filters, minArea: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Area
                </label>
                <input
                  type="text"
                  placeholder="sq.ft"
                  value={filters.maxArea}
                  onChange={(e) =>
                    setFilters({ ...filters, maxArea: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="area">Area</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setFilters(INITIAL_FILTERS)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilters({ ...filters, purpose: "all" })}
              className={`px-4 py-2 rounded-full border font-semibold transition cursor-pointer ${filters.purpose === "all" || !filters.purpose
                ? "bg-[#8c4bdc] text-white border-[#8c4bdc] shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilters({ ...filters, purpose: "sell" })}
              className={`px-4 py-2 rounded-full border font-semibold transition cursor-pointer ${filters.purpose === "sell"
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Sell
            </button>
            <button
              type="button"
              onClick={() => setFilters({ ...filters, purpose: "rent" })}
              className={`px-4 py-2 rounded-full border font-semibold transition cursor-pointer ${filters.purpose === "rent"
                ? "bg-red-600 text-white border-red-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              Rent
            </button>
          </div>

          {/* <h2 className="text-2xl font-bold text-gray-800">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Loading...
              </span>
            ) : error ? (
              "Error loading properties"
            ) : pagination.total > filteredProperties.length ? (
              `Showing ${filteredProperties.length} of ${pagination.total} Properties Available`
            ) : (
              `${filteredProperties.length} Properties Available`
            )}
          </h2> */}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-red-600" />
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-16">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchProperties(pagination.page)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Featured Locality Specialist Agents Widget */}
            <FeaturedAgentsWidget
              city={filters.city}
              locality={searchQuery}
              selectedAgentId={selectedAgent?.id}
              onSelectAgent={handleSelectAgent}
            />

            {/* Selected Agent Filter Alert Banner */}
            {selectedAgent && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 my-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    Showing properties listed by: <strong className="text-amber-900 underline font-black">{selectedAgent.name}</strong> ({filteredProperties.length} Properties found)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-xs font-bold bg-amber-200 hover:bg-amber-300 text-amber-950 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Filter (Show All)</span>
                </button>
              </div>
            )}

            {/* Property Grid */}
            {console.log("Filtered Properties Count:", filteredProperties)}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
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
                      <span
                        className={`absolute bottom-3 left-3 px-3 py-1 ${property.status === "For Sale" ? "bg-green-600" : "bg-red-600"} text-white text-sm rounded-full`}
                      >
                        {property.status}
                      </span>
                      <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white text-xs rounded-md">
                        {property.listedBy === "dealer" ? "Dealer" : "Owner"}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-1 flex items-center gap-1.5">
                          {/* {property.isBoosted && (
                            <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm shrink-0" title="Boosted Property">
                              🚀 Boosted
                            </span>
                          )} */}
                          <span>{property.title}</span>
                        </h3>
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0" title={`${property.averageRating || 5.0} Stars (${property.totalRatings || 0} reviews)`}>
                          <span className="text-amber-500 font-bold text-xs">★</span>
                          <span className="text-xs font-black text-amber-900">{Number(property.averageRating || 5.0).toFixed(1)}</span>
                          {property.totalRatings > 0 && (
                            <span className="text-[10px] text-amber-700">({property.totalRatings})</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1 shrink-0" />
                        <span className="text-sm capitalize truncate">
                          {property.location}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-3">

                        <span className="text-sm truncate">

                          Created at : {new Date(property.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-3">

                        <span className="text-sm truncate">

                          Updated at : {new Date(property.updatedAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3 pb-3 border-b">
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          {property.type && !property.type.toLowerCase().includes("commercial") &&
                            !property.type.toLowerCase().includes("plot") &&
                            !property.type.toLowerCase().includes("shop") &&
                            !property.type.toLowerCase().includes("office") && (
                              <div className="flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                <span>{property.bedrooms} BHK</span>
                              </div>
                            )}
                          {property.type && !property.type.toLowerCase().includes("plot") &&
                            !property.type.toLowerCase().includes("shop") &&
                            !property.type.toLowerCase().includes("commercial land") && (
                              <div className="flex items-center gap-1">
                                <Bath className="w-4 h-4" />
                                <span>{property.bathrooms} Baths</span>
                              </div>
                            )}
                          <div className="flex items-center gap-1">
                            <Square className="w-4 h-4" />
                            <span>
                              {/^[0-9\s.,]+$/.test(String(property.area).trim())
                                ? `${property.area} sqft`
                                : property.area}
                            </span>
                          </div>
                          {property.floorNo && (
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold ">
                              <span>Floor no: {property.floorNo}{property.totalFloors ? ` Total floors: ${property.totalFloors}` : ""}</span>
                            </div>
                          )}
                          {property.isHighRise && (
                            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-bold">
                              <span>High-Rise</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-[#3a40c6]">
                          {formatPrice(property.price)}
                        </div>
                        <Link
                          href={{
                            pathname: "/buy/property-details",
                            query: { id: property.id },
                          }}
                          className="px-4 py-2 bg-[#3a40c6] text-white rounded-lg hover:bg-[#3a40c6] transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-slate-100 p-8 shadow-sm">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedAgent
                    ? `No listings found for ${selectedAgent.name}`
                    : "No Properties Found"}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {selectedAgent
                    ? "This agent currently has no active listings matching your filters."
                    : "Please change your filters or try a different search"}
                </p>
                {selectedAgent && (
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Show All Properties
                  </button>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredProperties.length > 0 && pagination.totalPages > 1 && (
              <div className="flex flex-col gap-3 mt-8 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages} &mdash;{" "}
                  {pagination.total} total properties
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft />
                  </button>

                  {/* Page number buttons */}
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  )
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - pagination.page) <= 1,
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
                        <span key={`ellipsis-${idx}`} className="px-2">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item)}
                          className={`px-4 py-2 border rounded-lg transition-colors ${pagination.page === item
                            ? "bg-[#3a40c6] text-white border-[#3a40c6]"
                            : "hover:bg-gray-100"
                            }`}
                        >
                          {item}
                        </button>
                      ),
                    )}

                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-[#3a40c6] text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Still searching your dream property?
          </h2>
          <p className="text-lg mb-6">
            Tell us what you&apos;re looking for, we&apos;ll find the best options for you
          </p>
          <Link href={"/contact"} className="px-8 py-3 bg-white text-[#3a40c6] rounded-lg font-semibold hover:bg-gray-100 text-lg">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
