"use client";

import React, { useState, useEffect } from "react";
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
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";

const BuyPage = () => {
  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800";
  const databaseUrl = process.env.NEXT_PUBLIC_APP_DATABASE_URL;
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
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
  });
  const [favorites, setFavorites] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    limit: 10,
  });

  // Static property data (fallback)
  const staticProperties = [
    {
      id: 1,
      title: "आधुनिक 3BHK फ्लैट",
      location: "सेक्टर 62, नोएडा",
      price: 8500000,
      bedrooms: 3,
      bathrooms: 2,
      area: 1450,
      type: "apartment",
      image:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      status: "Ready to Move",
      featured: true,
    },
    {
      id: 2,
      title: "लक्जरी विला",
      location: "गोल्फ कोर्स रोड, गुड़गांव",
      price: 25000000,
      bedrooms: 4,
      bathrooms: 4,
      area: 3200,
      type: "villa",
      image:
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      status: "Under Construction",
      featured: true,
    },
    {
      id: 3,
      title: "स्पेशियस 2BHK अपार्टमेंट",
      location: "द्वारका, दिल्ली",
      price: 6200000,
      bedrooms: 2,
      bathrooms: 2,
      area: 1150,
      type: "apartment",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      status: "Ready to Move",
      featured: false,
    },
    {
      id: 4,
      title: "पेंटहाउस सुइट",
      location: "सेक्टर 50, गुड़गांव",
      price: 18500000,
      bedrooms: 4,
      bathrooms: 3,
      area: 2800,
      type: "penthouse",
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      status: "Ready to Move",
      featured: true,
    },
    {
      id: 5,
      title: "मॉडर्न स्टूडियो अपार्टमेंट",
      location: "इंदिरापुरम, गाजियाबाद",
      price: 3500000,
      bedrooms: 1,
      bathrooms: 1,
      area: 550,
      type: "apartment",
      image:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      status: "Ready to Move",
      featured: false,
    },
    {
      id: 6,
      title: "इंडिपेंडेंट हाउस",
      location: "सेक्टर 57, नोएडा",
      price: 15000000,
      bedrooms: 5,
      bathrooms: 4,
      area: 2500,
      type: "house",
      image:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
      status: "Ready to Move",
      featured: false,
    },
  ];

  // Fetch properties from API
  const fetchProperties = async () => {
    setLoading(true);
    try {
      // Check if database URL is configured
      if (!databaseUrl) {
        console.warn("Database URL not configured, using static properties");
        setProperties(staticProperties);
        setLoading(false);
        return;
      }

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

      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const apiUrl = `${databaseUrl}/api/properties`;
      console.log("Fetching from:", apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error("API response not ok:", response.status);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (
        data.success &&
        data.data &&
        data.data.properties &&
        data.data.properties.length > 0
      ) {
        // Transform API data to match component structure
        const transformedProperties = data.data.properties.map((prop) => {
          // Handle area - it comes as object with unit, extract numeric value or use 0
          let areaValue = 0;
          if (typeof prop.area === "object" && prop.area !== null) {
            areaValue = prop.area.value || 0;
          } else if (typeof prop.area === "number") {
            areaValue = prop.area;
          }

          // Filter out blob URLs and invalid images
          let validImages = [];
          if (prop.images && Array.isArray(prop.images)) {
            validImages = prop.images.filter(
              (img) => img && !img.startsWith("blob:") && img.trim() !== "",
            );
          }

          // Get owner name or location
          const ownerInfo = prop.owner
            ? `${prop.owner.name}, ${prop.owner.phone}`
            : "Owner info not available";

          return {
            id: prop._id || prop.id,
            title: prop.title || "No Title",
            // Use owner name and phone as location, fallback to property type
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

        console.log("Transformed properties:", transformedProperties);
        setProperties(transformedProperties);
        if (data.data.pagination) {
          setPagination(data.data.pagination);
        }
      } else {
        console.log("No properties found from API, using static data");
        setProperties(staticProperties);
      }
    } catch (error) {
      console.error("Error fetching properties from API:", error);
      console.log("Falling back to static properties");
      // On error, use static data
      setProperties(staticProperties);
    } finally {
      setLoading(false);
    }
  };

  // Reset to first page when search or filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [searchQuery, filters]);

  // Fetch properties on component mount and when page changes
  useEffect(() => {
    fetchProperties();
  }, [searchQuery, filters, pagination.page]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  const filteredProperties = properties.filter((property) => {
    const matchesBath =
      filters.bathrooms === "any" ||
      property.bathrooms >= parseInt(filters.bathrooms);
    const matchesArea =
      (!filters.minArea || property.area >= parseInt(filters.minArea)) &&
      (!filters.maxArea || property.area <= parseInt(filters.maxArea));
    return matchesBath && matchesArea;
  });

  const formatPrice = (price) => {
    // Handle case where price is an object with unit property
    if (typeof price === "object" && price !== null && price.unit) {
      return `${price.value} ${price.unit}`;
    }

    // Handle null or undefined
    if (!price || price === 0) return "न्यूनतम मूल्य";

    const numPrice = Number(price);
    if (isNaN(numPrice)) return "मूल्य अनुपलब्ध";

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
      linear-gradient(
        rgba(0, 0, 0, 0.6),
        rgba(0, 0, 0, 0.6)
      ),
      url('https://res.cloudinary.com/dxlykgx6w/image/upload/v1765908762/chinese-city1_dujv0y.jpg')
    `,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="flex gap-2 ">
            <div className="flex-1 max-w-[1720px] w-[200px] sm:w-[250px] md:w-[600px] lg:w-[700px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="स्थान, प्रॉपर्टी नाम खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 text-white rounded-lg focus:outline-none "
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              फ़िल्टर
            </button>
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">फ़िल्टर</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  प्रॉपर्टी टाइप
                </label>
                <select
                  value={filters.propertyType}
                  onChange={(e) =>
                    setFilters({ ...filters, propertyType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">सभी</option>
                  <option value="apartment">अपार्टमेंट</option>
                  <option value="villa">विला</option>
                  <option value="house">हाउस</option>
                  <option value="penthouse">पेंटहाउस</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  न्यूनतम कीमत
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
                  अधिकतम कीमत
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
                  शहर
                </label>
                <input
                  type="text"
                  placeholder="शहर लिखें"
                  value={filters.city}
                  onChange={(e) =>
                    setFilters({ ...filters, city: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  फर्निशिंग
                </label>
                <select
                  value={filters.furnishing}
                  onChange={(e) =>
                    setFilters({ ...filters, furnishing: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">सभी</option>
                  <option value="furnished">फर्निश्ड</option>
                  <option value="unfurnished">अनफर्निश्ड</option>
                  <option value="semi-furnished">सेमी फर्निश्ड</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  बेडरूम
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bedrooms: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="any">कोई भी</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  बाथरूम
                </label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) =>
                    setFilters({ ...filters, bathrooms: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="any">कोई भी</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  न्यूनतम क्षेत्र (sq.ft)
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
                  अधिकतम क्षेत्र (sq.ft)
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
                  क्रमबद्ध करें
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="newest">नवीनतम</option>
                  <option value="price-low">कीमत: कम से अधिक</option>
                  <option value="price-high">कीमत: अधिक से कम</option>
                  <option value="area">क्षेत्रफल</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  setFilters({
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
                  })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                रीसेट करें
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
                लोड हो रहा है...
              </span>
            ) : (
              `${filteredProperties.length} प्रॉपर्टीज उपलब्ध`
            )}
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-red-600" />
          </div>
        ) : (
          <>
            {/* Property Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={property.image || DEFAULT_IMAGE}
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
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
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
                        className="px-4 py-2 bg-red-600 text-white rounded-lg"
                      >
                        विवरण देखें
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {filteredProperties.length > 0 && (
              <div className="flex flex-col gap-3 mt-8 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredProperties.length === 0 && (
              <div className="text-center py-16">
                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  कोई प्रॉपर्टी नहीं मिली
                </h3>
                <p className="text-gray-600">
                  कृपया अपने फ़िल्टर बदलें या अलग खोज का प्रयास करें
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            अपनी ड्रीम प्रॉपर्टी नहीं मिली?
          </h2>
          <p className="text-lg mb-6">
            हमें बताएं कि आप क्या खोज रहे हैं, हम आपके लिए सबसे अच्छे विकल्प
            ढूंढेंगे
          </p>
          <button className="px-8 py-3 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 text-lg">
            हमसे संपर्क करें
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyPage;
