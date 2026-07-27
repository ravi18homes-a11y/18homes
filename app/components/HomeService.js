"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeServices({ data }) {
  const subtitle = data?.subtitle || "Service";
  const title = data?.title || "Our Services";
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (!cancelled) {
          if (resData?.services && resData.services.length > 0) {
            setServices(
              resData.services.map((s) => ({
                id: s.id || s._id,
                title: s.title,
                desc: s.description,
                img: s.image || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800",
                link: s.link || "/service/house",
              }))
            );
          } else {
            setServices([]);
          }
        }
      })
      .catch((err) => console.error("Error fetching homepage services:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const customBgStyle = data?.bgColor ? { backgroundColor: data.bgColor } : {};
  const customTextStyle = data?.textColor ? { color: data.textColor } : {};

  if (!loading && (!services || services.length === 0)) return null;

  return (
    <section className="w-full py-16 bg-slate-50" style={customBgStyle}>
      <div className="text-center mb-16">
        <h3 className="text-[32px] italic text-[#8c4bdc]" style={customTextStyle}>
          {subtitle}
        </h3>
        <h2 className="text-[42px] font-extrabold text-slate-900" style={customTextStyle}>
          {title}
        </h2>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const linkTarget = service.link || "/service/house";
          return (
            <Link
              key={service.id || index}
              href={linkTarget}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
            >
              <div className="w-full h-52 relative overflow-hidden bg-slate-100">
                <Image
                  src={service.img}
                  alt={service.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#8c4bdc] transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                  {service.desc}
                </p>
                <div className="pt-2 text-[#8c4bdc] font-semibold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore Service &rarr;
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
