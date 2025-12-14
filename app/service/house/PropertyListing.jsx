// components/PropertyListing.jsx

export default function PropertyListing({ category }) {
  const flats = [
    {
      date: "12 DEC 2025",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
      title: "1 RK Flat for Rent in Noida",
      desc: "Affordable fully-furnished 1 RK perfect for bachelors, with market and metro station nearby.",
      time: "3:00 Min",
    },
    {
      date: "05 DEC 2025",
      img: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200",
      title: "Spacious 1 BHK in Ghaziabad",
      desc: "Ideal for small families, this 1 BHK offers great ventilation and high-quality interiors.",
      time: "4:00 Min",
    },
    {
      date: "01 DEC 2025",
      img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      title: "Luxury 2 BHK in Delhi",
      desc: "Premium society with gym, pool, kids area, and 24/7 security. Perfect for modern living.",
      time: "5:00 Min",
    },
  ];

  return (
    <section className="w-full py-16 bg-[#f5f7fb]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {category ? `${category} - Latest Listings` : "Latest Flat Listings"}
        </h2>
        {category && (
          <p className="text-sm text-gray-600 mb-6">
            Showing results for <strong>{category}</strong>
          </p>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {flats.map((flat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <img
                src={flat.img}
                alt={flat.title}
                className="w-full h-52 object-cover"
              />

              <div className="p-6">
                {/* Date */}
                <p className="text-[#3b82f6] font-semibold text-sm mb-2">
                  {flat.date}
                </p>

                {/* Title */}
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  {flat.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {flat.desc}
                </p>

                {/* Bottom Row */}
                <div className="flex items-center justify-between mt-3">
                  <button className="text-[#1e3a8a] font-semibold hover:underline">
                    Read More
                  </button>

                  <div className="flex items-center gap-2 text-gray-500">
                    <span>⏱</span>
                    <span className="text-sm">{flat.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
