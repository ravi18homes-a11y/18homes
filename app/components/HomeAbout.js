"use client";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

export default function HomeAbout() {
  const points = [
    "Verified flats in prime locations",
    "Rent and sale options according to your budget",
    "Secure apartments with modern amenities",
    "Transparent process and 100% assistance",
  ];

  return (
    <section className="w-full bg-[#eef6f8] max-w-[1720px] mx-auto lg:py-20 py-10">
      <div className=" mx-auto lg:pl-28 lg:pr-0 grid grid-cols-1 lg:grid-cols-2 gap-3 items-center px-6 pr-6">
        {/* LEFT SIDE */}
        <div>
          <h3
            className="text-[42px] font-light text-black mb-2"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            About
          </h3>

          <h2 className="text-[46px]  font-bold text-black leading-tight mb-4">
            18homes – Your Dream Home
          </h2>

          <p className="text-[16px] text-[#101010] leading-[1.8] max-w-[650px] mb-6">
            18Homes is a trusted real estate platform located in Delhi-NCR, providing premium flats for both rent and purchase. Our goal is to provide a safe, modern, and comfortable home for every budget and family. For the past several years, we have been helping thousands of customers find a home with the right location, right price, and right amenities. Our team ensures that you get verified properties, transparent deals, and excellent support service—so that the process of finding a home is easy, fast, and reliable.
          </p>

          {/* CHECKMARKS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {points.map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <IoMdCheckmarkCircleOutline className="text-[#00c777] text-[22px] " />
                <span className="text-[17px] font-medium text-[#101010]">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="w-full ">
          <div className="relative w-full h-[430px] rounded-sm overflow-hidden shadow-lg">
            <Image
              src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1765562605/1765562251061_vqijhn.png"
              // src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1765125152/WhatsApp_Image_2025-12-07_at_9.01.16_PM_fuflru.jpg"
              alt="Studio Image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
