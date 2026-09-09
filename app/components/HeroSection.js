"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export default function HeroSlider({ data }) {
  const sectionBg = data?.bgColor || undefined;
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
    <section
      className="relative max-w-[1720px] mx-auto w-full h-[70vh] sm:h-[90vh]"
      style={sectionBg ? { backgroundColor: sectionBg } : {}}
      suppressHydrationWarning
    >
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
              heading1Color={slide.heading1Color}
              heading1BgColor={slide.heading1BgColor}
              heading2Color={slide.heading2Color}
              heading3Color={slide.heading3Color}
              heading4Color={slide.heading4Color}
              bgColor={slide.bgColor || data?.bgColor}
              textColor={slide.textColor || data?.textColor}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

function BannerSlide({
  image,
  heading1,
  heading2,
  heading3,
  heading4,
  heading1Color,
  heading1BgColor,
  heading2Color,
  heading3Color,
  heading4Color,
  bgColor,
  textColor,
}) {
  const currentBgColor = bgColor || undefined;
  const fallbackTextColor = textColor || "black";

  const h1TextColor = heading1Color || fallbackTextColor;
  const h1Bg = heading1BgColor || "white";
  const h2TextColor = heading2Color || fallbackTextColor;
  const h3TextColor = heading3Color || fallbackTextColor;
  const h4TextColor = heading4Color || fallbackTextColor;

  return (
    <div
      className="relative w-full h-[90vh] flex items-center justify-center text-center"
      style={currentBgColor ? { backgroundColor: currentBgColor } : {}}
    >
      {/* Background Image */}
      {image && (
        <Image
          src={image}
          alt="Banner slide image"
          fill
          priority
          className="object-cover brightness-90"
        />
      )}

      <div className="relative z-20 max-w-[900px] px-4">
        {heading1 && (
          <h2
            className="text-3xl md:text-4xl mb-4 font-medium p-3 inline-block rounded-md"
            style={{
              color: h1TextColor,
              backgroundColor: h1Bg,
            }}
          >
            {heading1}
          </h2>
        )}
        {heading2 && (
          <h3
            className="text-3xl md:text-4xl font-light mb-3 block"
            style={{
              fontFamily: "'Dancing Script', cursive",
              color: h2TextColor,
            }}
          >
            {heading2}
          </h3>
        )}
        {heading3 && (
          <h1
            className="text-5xl md:text-6xl font-bold tracking-wide block"
            style={{ color: h3TextColor }}
          >
            {heading3}
          </h1>
        )}
        {heading4 && (
          <h2
            className="text-4xl md:text-4xl font-semibold mt-1 block"
            style={{ color: h4TextColor }}
          >
            {heading4}
          </h2>
        )}
      </div>
    </div>
  );
}
