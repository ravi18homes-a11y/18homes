"use client";

import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";

const INITIAL_FILTERS = {
  propertyType: "all",
  city: "",
  minPrice: "",
  maxPrice: "",
  bedrooms: "any",
  bathrooms: "any",
  furnishing: "all",
  minArea: "",
  maxArea: "",
  sortBy: "newest",
};

const BuyPage = () => {
  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL;

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [favorites, setFavorites] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 9,
  });

  const fetchProperties = useCallback(
    async (page = 1) => {
      if (!databaseUrl) {
        setError("Database URL is not configured.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (searchQuery) params.append("search", searchQuery);
        if (filters.city) params.append("city", filters.city);
        params.append("purpose", "sell");
        if (filters.propertyType !== "all")
          params.append("propertyType", filters.propertyType);
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
        if (filters.bedrooms !== "any")
          params.append("bedrooms", filters.bedrooms);
        if (filters.furnishing !== "all")
          params.append("furnishing", filters.furnishing);

        let sortParam = "-createdAt";
        if (filters.sortBy === "price-low") sortParam = "price";
        if (filters.sortBy === "price-high") sortParam = "-price";
        if (filters.sortBy === "area") sortParam = "-area";
        params.append("sort", sortParam);

        params.append("page", page.toString());
        params.append("limit", pagination.limit.toString());

        const apiUrl = `${databaseUrl}/api/properties?${params.toString()}`;
        console.log("Fetching from:", apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.success && data.data && Array.isArray(data.data.properties)) {
          const transformedProperties = data.data.properties.map((prop) => {
            let areaValue = 0;
            if (typeof prop.area === "object" && prop.area !== null) {
              areaValue = prop.area.value || 0;
            } else if (typeof prop.area === "number") {
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
              location: ownerInfo,
              price: prop.price || 0,
              bedrooms: prop.bedrooms || 0,
              bathrooms: prop.bathrooms || 0,
              area: areaValue,
              type: prop.propertyType || "apartment",
              image: validImages.length > 0 ? validImages[0] : DEFAULT_IMAGE,
              status: prop.purpose === "rent" ? "For Rent" : "For Sale",
              featured: prop.featured || false,
            };
          });

          setProperties(transformedProperties);

          if (data.data.pagination) {
            setPagination(data.data.pagination);
          }
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
    },
    [databaseUrl, searchQuery, filters, pagination.limit],
  );

  // Reset to page 1 whenever search/filters change, then fetch
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchProperties(1);
  }, [searchQuery, filters]);

  // Fetch when page changes (but not when filters/search trigger a reset)
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchProperties(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Client-side filter for bathrooms and area (API may not support these)
  const filteredProperties = properties.filter((property) => {
    const matchesBath =
      filters.bathrooms === "any" ||
      property.bathrooms >= parseInt(filters.bathrooms);
    const matchesMinArea =
      !filters.minArea || property.area >= parseInt(filters.minArea);
    const matchesMaxArea =
      !filters.maxArea || property.area <= parseInt(filters.maxArea);
    return matchesBath && matchesMinArea && matchesMaxArea;
  });

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  const formatPrice = (price) => {
    if (typeof price === "object" && price !== null && price.unit) {
      return `${price.value} ${price.unit}`;
    }
    if (!price || price === 0) return "Price on Request";
    const numPrice = Number(price);
    if (isNaN(numPrice)) return "Price Unavailable";
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
                    setFilters({ ...filters, propertyType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="house">House</option>
                  <option value="penthouse">Penthouse</option>
                </select>
              </div>

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
                  Min Area (sq.ft)
                </label>
                <input
                  type="number"
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
                  Max Area (sq.ft)
                </label>
                <input
                  type="number"
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Loading...
              </span>
            ) : error ? (
              "Error loading properties"
            ) : (
              `${pagination.total ?? filteredProperties.length} Properties Available`
            )}
          </h2>
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
            {/* Property Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <Link
                    href={{
                      pathname: "/buy/property-details",
                      query: { id: property.id },
                    }}
                    key={property.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={property.image}
                        alt={property.title}
                        onError={(e) => {
                          e.target.src = DEFAULT_IMAGE;
                        }}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => toggleFavorite(property.id)}
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <Heart
                          className={`w-5 h-5 ${
                            favorites.includes(property.id)
                              ? "fill-red-600 text-red-600"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                      {property.featured && (
                        <span className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-sm rounded-full">
                          Featured
                        </span>
                      )}
                      <span className="absolute bottom-3 left-3 px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                        {property.status}
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {property.location}
                        </span>
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
                            <span>{property.area} sqft</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-red-600">
                          {formatPrice(property.price)}
                        </div>
                        <Link
                          href={{
                            pathname: "/buy/property-details",
                            query: { id: property.id },
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                    Previous
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
                          className={`px-4 py-2 border rounded-lg transition-colors ${
                            pagination.page === item
                              ? "bg-red-600 text-white border-red-600"
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
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Didn't find your dream property?
          </h2>
          <p className="text-lg mb-6">
            Tell us what you're looking for, we'll find the best options for you
          </p>
          <button className="px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 text-lg">
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
