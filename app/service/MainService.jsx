"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";

export const MainService = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/services")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.services) {
          setCards(data.services);
        }
      })
      .catch((err) => console.error("Error fetching services:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full py-16 bg-slate-50 min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-[#8c4bdc] text-sm font-semibold tracking-wide">
            <Sparkles size={16} /> Professional Real Estate Solutions
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Our Dynamic Services
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Explore our wide range of property deals, rental assistance, buying & selling solutions tailored for your dream lifestyle.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin text-[#8c4bdc] mb-3" size={40} />
            <p className="text-sm font-medium">Loading our services...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800">No Services Available Currently</h3>
            <p className="text-slate-500 text-sm mt-2">Please check back later or contact our team.</p>
          </div>
        ) : (
          /* GRID OF CARDS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, index) => {
              const linkTarget = card.link && card.link.trim() ? card.link.trim() : "/service/house";
              const isExternal = linkTarget.startsWith("http://") || linkTarget.startsWith("https://");

              return (
                <div
                  key={card.id || card._id || index}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1.5"
                >
                  {/* CARD IMAGE */}
                  <div className="relative w-full h-52 overflow-hidden bg-slate-100">
                    <img
                      src={
                        card.image ||
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800"
                      }
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* CARD BODY */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#8c4bdc] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                        {card.description || card.desc}
                      </p>
                    </div>

                    {/* CARD LINK BUTTON */}
                    {isExternal ? (
                      <a
                        href={linkTarget}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between w-full pt-3 text-[#8c4bdc] font-semibold text-sm border-t border-slate-100 group-hover:text-purple-700 transition-colors"
                      >
                        <span>Explore Service</span>
                        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <Link
                        href={linkTarget}
                        className="inline-flex items-center justify-between w-full pt-3 text-[#8c4bdc] font-semibold text-sm border-t border-slate-100 group-hover:text-purple-700 transition-colors"
                      >
                        <span>Explore Service</span>
                        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
