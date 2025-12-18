import React, { useState } from "react";
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
} from "lucide-react";

const BuyPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: "all",
    minPrice: "",
    maxPrice: "",
    bedrooms: "any",
    bathrooms: "any",
    minArea: "",
    maxArea: "",
    sortBy: "newest",
  });
  const [favorites, setFavorites] = useState([]);

  // Sample property data
  const properties = [
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

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filters.propertyType === "all" || property.type === filters.propertyType;
    const matchesPrice =
      (!filters.minPrice || property.price >= parseInt(filters.minPrice)) &&
      (!filters.maxPrice || property.price <= parseInt(filters.maxPrice));
    const matchesBed =
      filters.bedrooms === "any" ||
      property.bedrooms >= parseInt(filters.bedrooms);
    const matchesBath =
      filters.bathrooms === "any" ||
      property.bathrooms >= parseInt(filters.bathrooms);
    const matchesArea =
      (!filters.minArea || property.area >= parseInt(filters.minArea)) &&
      (!filters.maxArea || property.area <= parseInt(filters.maxArea));

    return (
      matchesSearch &&
      matchesType &&
      matchesPrice &&
      matchesBed &&
      matchesBath &&
      matchesArea
    );
  });

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(2)} Lac`;
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
                    minPrice: "",
                    maxPrice: "",
                    bedrooms: "any",
                    bathrooms: "any",
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
            {filteredProperties.length} प्रॉपर्टीज उपलब्ध
          </h2>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
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
                    href={`/buy/property-details?id=${property.id}`}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 block text-center"
                  >
                    विवरण देखें
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

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
