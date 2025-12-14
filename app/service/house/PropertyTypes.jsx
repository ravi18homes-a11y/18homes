"use client";
// components/PropertyTypes.jsx
import { useState } from "react";
import PropertyListing from "./PropertyListing";

export default function PropertyTypes() {
  const cards = [
    {
      img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
      title: "1 RK",
    },
    {
      img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
      title: "1 BHK",
    },
    {
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      title: "2 BHK",
    },
    {
      img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      title: "3 BHK",
    },
    {
      img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800",
      title: "4+ BHK",
    },
    {
      img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
      title: "Budget House",
    },
    {
      img: "https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800",
      title: "Location Wise",
    },
  ];

  const [showListing, setShowListing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  function openListing(category) {
    setSelectedCategory(category);
    setShowListing(true);
  }

  function closeListing() {
    setSelectedCategory(null);
    setShowListing(false);
  }

  return (
    <section className="w-full py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {!showListing && (
          <>
            <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
              Explore Categories
            </h2>

            {/* GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
              {cards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => openListing(card.title)}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-32 md:h-36 object-cover"
                  />
                  <div className="p-3 text-center">
                    <h3 className="text-sm md:text-base font-semibold">
                      {card.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showListing && (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <button
                onClick={closeListing}
                className="px-4 py-2 bg-white rounded shadow hover:bg-gray-50"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold">
                {selectedCategory} Listings
              </h2>
            </div>

            <PropertyListing category={selectedCategory} />
          </div>
        )}
      </div>
    </section>
  );
}
