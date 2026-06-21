"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export default function HeroSlider({ data }) {
  const slides = data?.slides || [
    {
      image: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-modern-dining-room-living-room-with-luxury-decor-yellow-lamp_105762-2232_iu2qqe.avif",
      heading1: "Delhi NCR Special",
      heading2: "Today's Premium Offer",
      heading3: "Luxury Flats In Your Budget",
      heading4: "Book Your Dream Home Today",
    },
    {
      image: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/interior-bedroom-home_1048944-24812703_hecplb.avif",
      heading1: "Delhi NCR Special",
      heading2: "Today's Premium Offer",
      heading3: "Luxury Flats In Your Budget",
      heading4: "Book Your Dream Home Today",
    },
    {
      image: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/interior-bedroom_1048944-19082391_a5ntf1.avif",
      heading1: "Delhi NCR Special",
      heading2: "Today's Premium Offer",
      heading3: "Luxury Flats In Your Budget",
      heading4: "Book Your Dream Home Today",
    },
  ];

  return (
    <section className="relative max-w-[1720px] mx-auto w-full h-[90vh]">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <BannerSlide
              image={slide.image}
              heading1={slide.heading1}
              heading2={slide.heading2}
              heading3={slide.heading3}
              heading4={slide.heading4}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        /* DOTS CUSTOM STYLE EXACT SAME AS IMAGE */
        .swiper-pagination-bullet {
          width: 15px;
          height: 15px;
          border: 2px solid white;
          background: transparent;
          opacity: 1;
        }

        .swiper-pagination-bullet-active {
          background: #00e6ff !important;
          border-color: #00e6ff !important;
        }
      `}</style>
    </section>
  );
}

function BannerSlide({ image, heading1, heading2, heading3, heading4 }) {
  return (
    <div className="relative w-full h-[90vh] flex items-center justify-center text-center">
      {/* Background Image */}
      <Image
        src={image}
        alt="Banner slide image"
        fill
        priority
        className="object-cover brightness-90"
      />

      <div className="relative z-20 max-w-[900px] px-4">
        {heading1 && (
          <h2 className="text-[black] text-3xl md:text-4xl mb-4 font-medium bg-[white] p-3 inline-block">
            {heading1}
          </h2>
        )}
        {heading2 && (
          <h3
            className="text-[black] text-3xl md:text-4xl font-light mb-3 block"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            {heading2}
          </h3>
        )}
        {heading3 && (
          <h1 className="text-[black] text-5xl md:text-6xl font-bold tracking-wide block">
            {heading3}
          </h1>
        )}
        {heading4 && (
          <h2 className="text-[black] text-4xl md:text-4xl font-semibold mt-1 block">
            {heading4}
          </h2>
        )}
      </div>
    </div>
  );
}
