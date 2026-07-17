"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Building, Home, Map, Store, Briefcase, Trees } from "lucide-react";

const categoryIcons = {
  flat: Building,
  house: Home,
  plot: Map,
  shop: Store,
  commercial: Briefcase,
  agriculture: Trees,
};

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
        query: { propertyType: "flat", bedrooms: "1" },
      },
      {
        key: "2bhk",
        label: "2 BHK",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/cozy-living-room-with-coral-sofa_23-2152001401_mtbfyd.avif",
        query: { propertyType: "flat", bedrooms: "2" },
      },
      {
        key: "3bhk",
        label: "3 BHK",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/3d-rendering-modern-dining-room-living-room-with-luxury-decor-green-sofa_105762-2140_eu0udp.avif",
        query: { propertyType: "flat", bedrooms: "3" },
      },
      {
        key: "4bhk",
        label: "4+ BHK",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-modern-dining-room-living-room-with-luxury-decor-yellow-lamp_105762-2232_iu2qqe.avif",
        query: { propertyType: "flat", bedrooms: "4" },
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
    key: "commercial",
    title: "Commercial",
    description: "Pick the best commercial type.",
    cards: [
      {
        key: "hotel",
        label: "Hotel",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800",
        query: { propertyType: "commercial", commercialType: "hotel" },
      },
      {
        key: "hospital",
        label: "Hospital",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1782639265/1633674492707_udf8no.jpg",
        query: { propertyType: "commercial", commercialType: "hospital" },
      },
      {
        key: "school",
        label: "School",
        image:
          "https://res.cloudinary.com/dxlykgx6w/image/upload/v1782639222/360_F_1512041110_c0NFJDcHLmUJiwfDowzcKUgsPALmbjdD_vsudnf.jpg",
        query: { propertyType: "commercial", commercialType: "school" },
      },
      {
        key: "pg",
        label: "P.G",
        image:
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=800",
        query: { propertyType: "commercial", commercialType: "pg" },
      },
      {
        key: "lease-land",
        label: "Lease Land",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
        query: { propertyType: "commercial", commercialType: "lease land" },
      },
      {
        key: "commercial-land",
        label: "Commercial Land",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
        query: { propertyType: "commercial", commercialType: "commercial land" },
      },
    ],
  },
  {
    key: "agriculture",
    title: "Land",
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
      {
        key: "lease-land",
        label: "Lease Land",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
        query: { propertyType: "commercial", commercialType: "lease land" },
      },
      {
        key: "commercial-land",
        label: "Commercial Land",
        image:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
        query: { propertyType: "commercial", commercialType: "commercial land" },
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
  const params = useParams();
  const categoryParam = params?.category;
  const isCategoryPage = Boolean(categoryParam);
  const selectedCategory = categoryParam || "flat";

  const [purpose, setPurpose] = useState("sell");
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [customCommercialTypes, setCustomCommercialTypes] = useState([]);

  const activeCategory = useMemo(() => {
    const baseCategory =
      CATEGORY_CONFIG.find((item) => item.key === selectedCategory) ||
      CATEGORY_CONFIG[0];

    if (selectedCategory === "commercial") {
      const cards = [...baseCategory.cards];

      customCommercialTypes.forEach((typeVal) => {
        const key = `custom-${typeVal.toLowerCase().replace(/\s+/g, "-")}`;
        if (!cards.some((c) => c.key === key)) {
          cards.push({
            key: key,
            label: typeVal,
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800",
            query: { propertyType: "commercial", commercialType: "other", commercialTypeCustom: typeVal },
          });
        }
      });

      return {
        ...baseCategory,
        cards: cards,
      };
    }

    if (selectedCategory === "agriculture") {
      const cards = [...baseCategory.cards];

      customCommercialTypes.forEach((typeVal) => {
        const isLand = /land|acre|bigha|biswa|hectare/i.test(typeVal);
        if (isLand) {
          const key = `custom-land-${typeVal.toLowerCase().replace(/\s+/g, "-")}`;
          if (!cards.some((c) => c.key === key)) {
            cards.push({
              key: key,
              label: typeVal,
              image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800",
              query: { propertyType: "commercial", commercialType: "other", commercialTypeCustom: typeVal },
            });
          }
        }
      });

      return {
        ...baseCategory,
        cards: cards,
      };
    }

    return baseCategory;
  }, [selectedCategory, customCommercialTypes]);

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
        const customTypesSet = new Set();

        json.data.properties.forEach((property) => {
          const type = property.propertyType || "unknown";
          grouped[type] = grouped[type] || {};
          grouped[type].total = (grouped[type].total || 0) + 1;

          // Helper: Check if a commercial property contains land-related keywords
          const isLandWord = (val) => /land|acre|bigha|biswa|hectare/i.test(String(val || ""));
          const isCommercialLand = type === "commercial" && (
            isLandWord(property.commercialType) ||
            isLandWord(property.commercialTypeCustom) ||
            isLandWord(property.title) ||
            isLandWord(property.description)
          );

          if (isCommercialLand) {
            // Also count it under "agriculture" (Land)!
            const landType = "agriculture";
            grouped[landType] = grouped[landType] || {};
            grouped[landType].total = (grouped[landType].total || 0) + 1;

            const unit = (property.area?.unit || property.areaUnit || "").toLowerCase().trim();
            if (unit) {
              grouped[landType][unit] = (grouped[landType][unit] || 0) + 1;
            }
          }

          if (type === "commercial") {
            const commType = property.commercialType || "unknown";
            grouped[type][commType] = (grouped[type][commType] || 0) + 1;

            if (commType === "other" && property.commercialTypeCustom) {
              const customVal = property.commercialTypeCustom.trim();
              if (customVal) {
                customTypesSet.add(customVal);
                const customKey = customVal.toLowerCase();
                grouped[type][`custom_${customKey}`] = (grouped[type][`custom_${customKey}`] || 0) + 1;
              }
            }
          } else if (type === "agriculture") {
            const unit = (property.area?.unit || property.areaUnit || "").toLowerCase().trim();
            if (unit) {
              grouped[type][unit] = (grouped[type][unit] || 0) + 1;
            }
            const bedrooms = String(property.bedrooms || 0);
            grouped[type][bedrooms] = (grouped[type][bedrooms] || 0) + 1;
          } else {
            const bedrooms = String(property.bedrooms || 0);
            grouped[type][bedrooms] = (grouped[type][bedrooms] || 0) + 1;
          }
        });

        setCounts(grouped);
        setCustomCommercialTypes(Array.from(customTypesSet));
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
    let type = card.query.propertyType;
    let typeCounts = counts[type] || {};

    if (type === "flat" || type === "apartment") {
      const flatCounts = counts["flat"] || {};
      const aptCounts = counts["apartment"] || {};
      if (card.query.bedrooms) {
        return (flatCounts[card.query.bedrooms] || 0) + (aptCounts[card.query.bedrooms] || 0);
      }
      return (flatCounts.total || 0) + (aptCounts.total || 0);
    }

    if (type === "commercial") {
      if (card.query.commercialType === "other" && card.query.commercialTypeCustom) {
        const customKey = card.query.commercialTypeCustom.toLowerCase().trim();
        return typeCounts[`custom_${customKey}`] || 0;
      }
      if (card.query.commercialType) {
        return typeCounts[card.query.commercialType] || 0;
      }
      return typeCounts.total || 0;
    }

    if (card.query.areaUnit) {
      return typeCounts[card.query.areaUnit] || 0;
    }

    if (card.query.bedrooms) {
      return typeCounts[card.query.bedrooms] || 0;
    }
    return typeCounts.total || 0;
  };

  return (
    <section className="w-full bg-[#F7F7F7] py-10">
      

      {isCategoryPage && (
        <>
          <div className="max-w-7xl mx-auto  sm:pt-[20px]  px-6 mb-10 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setPurpose("sell");
              }}
              className={`px-5 py-3 rounded-full font-semibold text-[22px] transition ${purpose === "sell"
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
            >
              Sell / Purchase
            </button>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setPurpose("rent");
              }}
              className={`px-5 py-3 rounded-full font-semibold text-[28px] transition ${purpose === "rent"
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
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {(() => {
                      const CategoryIcon = categoryIcons[activeCategory.key];
                      return CategoryIcon && <CategoryIcon className="w-6 h-6 text-red-600" />;
                    })()}
                    {activeCategory.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{activeCategory.description}</p>
                </div>
                {loading ? (
                  <div className="text-gray-500">Loading cards...</div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {getCountForCard({ query: { propertyType: activeCategory.cards[0].query.propertyType } })} available {purpose}{" "}
                    listings
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loading
                  ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-gray-200 bg-white overflow-hidden animate-pulse"
                    >
                      <div className="h-36 bg-gray-300 rounded-t-3xl" />
                      <div className="p-6">
                        <div className="h-5 w-32 bg-gray-300 rounded mb-3" />
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </div>
                    </div>
                  ))
                  : activeCategory.cards.map((card) => {
                    const count = getCountForCard(card);
                    return (
                      <Link
                        key={card.key}
                        href={`/buy?purpose=${purpose}&${buildSearchString(card.query)}`}
                        className="group block rounded-3xl border border-gray-200 bg-gray-50 transition hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div
                          className={`mb-4 h-36 rounded-t-3xl overflow-hidden shadow-md ${card.image ? "bg-gray-200" : "bg-gray-100"
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
        </>
      )}


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

      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 max-w-4xl mx-auto justify-center">
          {CATEGORY_CONFIG.map((category) => {
            const IconComponent = categoryIcons[category.key];
            const isActive = isCategoryPage && selectedCategory === category.key;
            return (
              <Link
                key={category.key}
                href={`/category/${category.key}`}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer group ${
                  isActive
                    ? "bg-red-600 text-white border-transparent shadow-lg shadow-red-600/20 -translate-y-1 scale-105"
                    : "bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-600 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    isActive ? "bg-white/20 text-white" : "bg-red-50 text-red-600 group-hover:bg-red-100"
                  }`}
                >
                  {IconComponent && (
                    <IconComponent className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
                  )}
                </div>
                <span className="text-sm font-bold tracking-wide">{category.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
