"use client";

import Image from "next/image";

export default function InstrumentsSection({ data }) {
  const subtitle = data?.subtitle || "18Homes – Premium Property Solutions";
  const title = data?.title || "18Homes – Premium Property Solutions";
  const desc1 = data?.desc1 || "We provide industry standard and professional real estate services,";
  const desc2 = data?.desc2 || "Our team helps you choose the right property";
  const desc3 = data?.desc3 || "Keeping budget, location, and lifestyle in mind.";
  const image = data?.image || "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764948145/hotel-building-ho-chi-minh-vietnam1_wtuqyd.jpg";

  return (
    <section className="w-full bg-[#F2F2F2] py-20">
      {/* TOP TEXT */}
      <div className="text-center max-w-[1100px] mx-auto px-6">
        <h3
          className="text-[32px] md:text-[38px] text-black mb-3"
          style={{ fontFamily: "'Dancing Script', cursive" }}
        >
          {subtitle}
        </h3>

        <h2 className="text-[42px] md:text-[44px] font-bold text-black leading-snug mb-6">
          {title}
        </h2>

        <p className="text-[18px] md:text-[20px] text-gray-700 ">
          {desc1}
          <br />
          {desc2}
          <br />
          {desc3}
        </p>
      </div>

      {/* BIG INSTRUMENT IMAGE WITH ADJUSTED GRADIENT OVERLAY */}
      <div className="max-w-[1300px] mx-auto mt-14 px-4">
        <div className="relative w-full h-[420px] md:h-[600px] rounded-xl overflow-hidden shadow-lg bg-black">
          <Image
            src={image}
            alt="Property Solutions Image"
            fill
            priority
            className="object-center"
          />
        </div>
      </div>
    </section>
  );
}
