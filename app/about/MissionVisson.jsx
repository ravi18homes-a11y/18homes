"use client";
import React from "react";
 
function MissionVisson() {
  return (
    <div>
      <section className="w-full bg-[#1B1333] py-20 relative">
        <div className="max-w-[1500px] mx-auto px-5  md:px-28 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT — ONE FULL LARGE IMAGE */}
          <div className="w-full">
            <img
              src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1765113787/18home_nfbc2b.jpg"
              alt="DJ"
              className="w-full h-full rounded-[40px] object-cover"
            />
          </div>

          {/* RIGHT — TEXT BLOCK */}
          <div className="flex flex-col gap-5">
            {/* Mission */}
            <div className="border-3 border-[#FFFFFF] rounded-2xl p-10 text-white">
              <h2 className="text-[24px] font-semibold mb-4">Our Mission</h2>
              <p className="text-[17px]  text-white/80">
                At 18Homes, our mission is to provide you with an easy and reliable platform where you can easily search and rent rooms and flats according to your budget and needs. Whether you are a student, a working professional, or looking for a place for your family, we help you see the right options and book quickly. Our goal is to provide a safe, transparent, and customer-centric service, making your home search experience simple and enjoyable.
              </p>
            </div>

            {/* Vision */}
            <div className="border-3 border-[#FFFFFF] rounded-2xl p-10 text-white">
              <h2 className="text-[24px] font-semibold mb-4">Our Vision</h2>
              <p className="text-[17px]  text-white/80">
                Our vision is for 18Homes to become one of the most trusted real estate platforms in India. We want every person, whether renting a flat for the first time or looking for a new home, to easily find the right option for themselves on our website. We want to make your home search experience simple, secure, and unique through personalized assistance, reliability, and comprehensive options.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MissionVisson;
