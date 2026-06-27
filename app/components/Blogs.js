"use client";
import Image from "next/image";

export default function HomeBlogs({ data }) {
  const subtitle = data?.subtitle || "Latest post";
  const title = data?.title || "18Homes Real Estate Blogs";
  const blogs = data?.items || [
    {
      date: "31 January 2025",
      title: "Modern 1 BHK Flat — Interior and Space Management Ideas",
      img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928069/3d-rendering-loft-scandinavian-living-room-with-working-table-bookshelf_105762-2162_jwxzba.avif",
    },
    {
      date: "31 January 2025",
      title: "Perfect 2 BHK for Families — Important Things Before Buying",
      img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/cozy-living-room-with-coral-sofa_23-2152001401_mtbfyd.avif",
    },
    {
      date: "31 January 2025",
      title: "Luxury Living on a Budget — Smart Interior Tips for Small Homes",
      img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/3d-rendering-modern-dining-room-living-room-with-luxury-decor-green-sofa_105762-2140_eu0udp.avif",
    },
    {
      date: "31 January 2025",
      title: "Important Checklist Before Renting a Home",
      img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/cozy-dining-room-modern-apartment_181624-61506_ykkcqt.avif",
    },
  ];

  return (
    <section className="w-full bg-[#F7F7F7] py-16">
      {/* Heading */}
      <div className="text-center mb-14">
        <h3
          className="text-[32px] text-gray-700 mb-3"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          {subtitle}
        </h3>
        <h2 className="text-[44px] md:text-[54px] font-bold text-black">
          {title}
        </h2>
      </div>

      {/* 2×2 GRID */}
      <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {blogs.map((blog, index) => (
          <div key={index} className="relative w-full h-[300px] overflow-hidden group">
            {/* IMAGE */}
            <Image
              src={blog.img}
              alt={blog.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-110"
            />

            {/* OVERLAY LAYER (dark fade) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80"></div>

            {/* BLOG DATE */}
            <p className="absolute top-4 left-4 text-white text-[16px]">
              {blog.date}
            </p>

            {/* BLOG TITLE */}
            <h3 className="absolute bottom-6 left-4 right-4 text-white text-[24px] leading-snug font-semibold">
              {blog.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
