"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function Testimonials() {
    const data = [
  {
    text: "18Homes' service feels truly personal. They understand when and what kind of property I need. Whether I'm looking for a family home or a rental option—18Homes always provides the right suggestions.",
    name: "Jane Cooper",
    role: "Tenant",
    img: "https://res.cloudinary.com/dal5dlztv/image/upload/v1757578556/Ellipse_8_1_fr81tw.png",
  },
  {
    text: "The best experience for me was that 18Homes shows houses in the right locations without any brokerage. Their team is very professional and helpful.",
    name: "Emma Doe",
    role: "Home Buyer",
    img: "https://res.cloudinary.com/dal5dlztv/image/upload/v1757578561/Ellipse_8_fyouzw.png",
  },
  {
    text: "I needed a commercial space and 18Homes got me the perfect option. Time, budget, and location—everything was just right.",
    name: "Alex Carter",
    role: "Business Owner",
    img: "https://res.cloudinary.com/dal5dlztv/image/upload/v1757578556/Ellipse_8_1_fr81tw.png",
  },
  {
    text: "Finding a property has become extremely easy with 18Homes. The website is user-friendly and the team guides you at every step. A wonderful experience!",
    name: "Sofia Lancer",
    role: "Property Seeker",
    img: "https://res.cloudinary.com/dal5dlztv/image/upload/v1757578561/Ellipse_8_fyouzw.png",
  }
];


    return (
        <section
            className="w-full py-18 bg-gradient-to-b from-[#316c3f] via-[#0d0128] to-[#461d34]"
        >
            {/* Heading */}
            <div className="text-center mb-12 px-4">
                <h2 className="text-[40px] text-white font-semibold mb-4">
                  What Our Clients Say
                </h2>

                <div className="w-[140px] h-[3px] bg-gradient-to-r from-[#bc67ff] to-[#4da6ff] mx-auto mb-6"></div>

                <p className="text-[#8f8f9a] max-w-[500px] mx-auto text-[18px] leading-relaxed">
                   Our simple and fast process ensures that you spend less time searching for a home and find the right property quickly.
                </p>
            </div>

            {/* Testimonials Slider */}
            <div className="max-w-[1170px] mx-auto px-6">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    navigation={{
                        nextEl: ".swiper-next",
                        prevEl: ".swiper-prev",
                    }}
                    autoplay={{
                        delay: 2000, // slide every 2.5s
                        disableOnInteraction: false, // user scroll kare tab bhi autoplay chalega
                    }}
                    loop={true} // infinite loop
                    speed={900} // smooth animation speed
                    spaceBetween={30}
                    slidesPerView={1}
                    breakpoints={{
                        1024: { slidesPerView: 2 },
                    }}
                >

                    {data.map((t, i) => (
                        <SwiperSlide key={i}>
                            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 h-[250px] flex flex-col justify-between text-white shadow-xl">

                                <p className="text-[17px] leading-relaxed text-[#8f8f9a]">
                                    {t.text}
                                </p>

                                <div className="flex items-center gap-4 mt-2">
                                    <Image
                                        src={t.img}
                                        width={65}
                                        height={65}
                                        alt={t.name}
                                        className="rounded-full"
                                    />

                                    <div>
                                        <h3 className="text-[20px] font-semibold flex items-center gap-2">
                                            {t.name}
                                            <span className="w-[40px] h-[2px] bg-gradient-to-r from-[#822aff] to-[#3ab4ff] inline-block"></span>
                                        </h3>
                                        <p className="text-[#8f8f9a] text-[15px]">{t.role}</p>
                                    </div>
                                </div>

                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* Navigation Buttons */}
                <div className="flex justify-center gap-6 mt-10">
                    <button className="swiper-prev w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white text-xl">
                        ❮
                    </button>
                    <button className="swiper-next w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition text-white text-xl">
                        ❯
                    </button>
                </div>
            </div>
        </section>
    );
}
