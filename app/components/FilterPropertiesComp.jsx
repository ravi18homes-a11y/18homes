"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

const CATEGORY_CONFIG = [
  {
    key: "flat",
    title: "Flat",
    description: "Choose flat options by BHK.",
    cards: [
      {
        key: "1bhk",
        label: "1 BHK",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-luxury-modern-bedroom-suite-hotel-with-tv-cabinet_105762-2280_ozfq80.avif",
        query: { propertyType: "apartment", bedrooms: "1" },
      },
      {
        key: "2bhk",
        label: "2 BHK",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/cozy-living-room-with-coral-sofa_23-2152001401_mtbfyd.avif",
        query: { propertyType: "apartment", bedrooms: "2" },
      },
      {
        key: "3bhk",
        label: "3 BHK",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/3d-rendering-modern-dining-room-living-room-with-luxury-decor-green-sofa_105762-2140_eu0udp.avif",
        query: { propertyType: "apartment", bedrooms: "3" },
      },
      {
        key: "4bhk",
        label: "4+ BHK",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-modern-dining-room-living-room-with-luxury-decor-yellow-lamp_105762-2232_iu2qqe.avif",
        query: { propertyType: "apartment", bedrooms: "4" },
      },
    ],
  },
  {
    key: "house",
    title: "House",
    description: "Select the right house type.",
    cards: [
      {
        key: "house",
        label: "House",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/cozy-living-room-with-coral-sofa_23-2152001401_mtbfyd.avif",
        query: { propertyType: "house" },
      },
      {
        key: "villa",
        label: "Villa",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/3d-rendering-modern-dining-room-living-room-with-luxury-decor-green-sofa_105762-2140_eu0udp.avif",
        query: { propertyType: "villa" },
      },
      {
        key: "bungalow",
        label: "Bungalow",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-modern-dining-room-living-room-with-luxury-decor-yellow-lamp_105762-2232_iu2qqe.avif",
        query: { propertyType: "bungalow" },
      },
      {
        key: "custom",
        label: "Custom",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-luxury-modern-bedroom-suite-hotel-with-tv-cabinet_105762-2280_ozfq80.avif",
        query: { propertyType: "house", custom: "true" },
      },
    ],
  },
  {
    key: "plot",
    title: "Plot",
    description: "Choose the plot unit for your search.",
    cards: [
      {
        key: "sqft",
        label: "Sq. Ft",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231956/shutterstock_1774880030-min_trtyre.jpg",
        query: { propertyType: "plot", areaUnit: "sqft" },
      },
      {
        key: "sqyard",
        label: "Sq. Yard (Gaj)",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231956/shutterstock_1774880030-min_trtyre.jpg",
        query: { propertyType: "plot", areaUnit: "sqyard" },
      },
      {
        key: "acre",
        label: "Acre",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231956/shutterstock_1774880030-min_trtyre.jpg",
        query: { propertyType: "plot", areaUnit: "acre" },
      },
      {
        key: "hectare",
        label: "Hectare",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231956/shutterstock_1774880030-min_trtyre.jpg",
        query: { propertyType: "plot", areaUnit: "hectare" },
      },
    ],
  },
  {
    key: "shop",
    title: "Shop",
    description: "Find the right shop size.",
    cards: [
      {
        key: "small-shop",
        label: "Small Shop",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231952/images_czl57p.jpg",
        query: { propertyType: "shop", shopSize: "small" },
      },
      {
        key: "medium-shop",
        label: "Medium Shop",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231951/images_2_btt9c3.jpg",
        query: { propertyType: "shop", shopSize: "medium" },
      },
      {
        key: "large-shop",
        label: "Large Shop",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231951/images_3_epugsp.jpg",
        query: { propertyType: "shop", shopSize: "large" },
      },
      {
        key: "showroom",
        label: "Showroom",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231951/images_1_wpcen8.jpg",
        query: { propertyType: "shop", shopSize: "showroom" },
      },
    ],
  },
  {
    key: "office",
    title: "Office",
    description: "Pick the best office type.",
    cards: [
      {
        key: "coworking",
        label: "Co-working",
        image:
          "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=800",
        query: { propertyType: "office", officeType: "co-working" },
      },
      {
        key: "private-office",
        label: "Private Office",
        image:
          "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800",
        query: { propertyType: "office", officeType: "private" },
      },
      {
        key: "it-office",
        label: "IT Office",
        image:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800",
        query: { propertyType: "office", officeType: "it" },
      },
      {
        key: "corporate-office",
        label: "Corporate Office",
        image:
          "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=800",
        query: { propertyType: "office", officeType: "corporate" },
      },
    ],
  },
  {
    key: "agriculture",
    title: "Agriculture Land",
    description: "Search agriculture land by unit.",
    cards: [
      {
        key: "bigha",
        label: "Bigha",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231956/shutterstock_1774880030-min_trtyre.jpg",
        query: { propertyType: "agriculture", areaUnit: "bigha" },
      },
      {
        key: "biswa",
        label: "Biswa",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231952/Types-of-plots-and-various-types-of-housing-plots-in-India-feature-compressed_omeimk.jpg",
        query: { propertyType: "agriculture", areaUnit: "biswa" },
      },
      {
        key: "acre-land",
        label: "Acre",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231951/images_4_steofs.jpg",
        query: { propertyType: "agriculture", areaUnit: "acre" },
      },
      {
        key: "hectare-land",
        label: "Hectare",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1777231951/images_5_uetcq9.jpg",
        query: { propertyType: "agriculture", areaUnit: "hectare" },
      },
    ],
  },
];

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_DATABASE_URL;

function buildSearchString(query) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  return params.toString();
}

export default function FilterPropertiesComp() {
  const [purpose, setPurpose] = useState("sell");
  const [selectedCategory, setSelectedCategory] = useState("flat");
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const activeCategory = useMemo(
    () =>
      CATEGORY_CONFIG.find((item) => item.key === selectedCategory) ||
      CATEGORY_CONFIG[0],
    [selectedCategory],
  );

  useEffect(() => {
    async function fetchCounts() {
      if (!API_BASE_URL) {
        setCounts({});
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({ purpose, limit: "100" });
        const response = await fetch(
          `${API_BASE_URL}/api/properties?${params.toString()}`,
        );
        const json = await response.json();

        if (
          !response.ok ||
          !json.success ||
          !Array.isArray(json.data?.properties)
        ) {
          setCounts({});
          return;
        }

        const grouped = {};
        json.data.properties.forEach((property) => {
          const type = property.propertyType || "unknown";
          const bedrooms = String(property.bedrooms || 0);

          grouped[type] = grouped[type] || {};
          grouped[type][bedrooms] = (grouped[type][bedrooms] || 0) + 1;
          grouped[type].total = (grouped[type].total || 0) + 1;
        });

        setCounts(grouped);
      } catch (error) {
        console.error("Failed to fetch filter counts", error);
        setCounts({});
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, [purpose]);

  const getCountForCard = (card) => {
    const type = card.query.propertyType;
    const typeCounts = counts[type] || {};
    if (card.query.bedrooms) {
      return typeCounts[card.query.bedrooms] || 0;
    }
    return typeCounts.total || 0;
  };

  return (
    <section className="w-full bg-[#F7F7F7] py-16">
      <div className="text-center mb-14">
        <h3
          className="text-[32px] text-gray-700 mb-3"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          Latest post
        </h3>
        <h2 className="text-[44px] md:text-[54px] font-bold text-black">
          18Homes Real Estate Properties
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Browse categories and click a card to see matching properties on the
          buy page.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORY_CONFIG.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setSelectedCategory(category.key)}
              className={`px-5 py-3 rounded-full text-sm font-semibold transition ${
                selectedCategory === category.key
                  ? "bg-red-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-200 pt-[20px]  px-6 mb-10 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setPurpose("sell")}
          className={`px-5 py-3 rounded-full font-semibold text-[32px] transition ${
            purpose === "sell"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          Sell
        </button>
        <button
          type="button"
          onClick={() => setPurpose("rent")}
          className={`px-5 py-3 rounded-full font-semibold text-[32px] transition ${
            purpose === "rent"
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          Rent
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="rounded-3xl bg-white shadow-sm p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {activeCategory.title}
              </h3>
              <p className="text-gray-600 mt-2">{activeCategory.description}</p>
            </div>
            {loading ? (
              <div className="text-gray-500">Loading cards...</div>
            ) : (
              <div className="text-sm text-gray-500">
                {getCountForCard(activeCategory.cards[0])} available {purpose}{" "}
                listings
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeCategory.cards.map((card) => {
              const count = getCountForCard(card);
              return (
                <Link
                  key={card.key}
                  href={`/buy?purpose=${purpose}&${buildSearchString(card.query)}`}
                  className="group block rounded-3xl border border-gray-200 bg-gray-50 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div
                    className={`mb-4 h-36 rounded-t-3xl overflow-hidden shadow-md ${
                      card.image ? "bg-gray-200" : "bg-gray-100"
                    }`}
                    style={
                      card.image
                        ? {
                            backgroundImage: `url(${card.image})`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                          }
                        : undefined
                    }
                  >
                    <div className="h-full w-full bg-black/30 flex items-center justify-center text-xl font-bold text-white">
                      {card.label}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-lg font-semibold text-gray-900">
                      {card.label}
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {count > 0
                        ? `${count} properties found`
                        : "Click to explore properties"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
