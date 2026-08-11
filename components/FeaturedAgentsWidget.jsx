"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Award,
  Sparkles,
  ShieldCheck,
  Building,
  Phone,
  MessageCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop";

const parsePhoneNumber = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { isValid: false, formattedDisplay: "", waNumber: "", callNumber: "" };
  }

  let digits = rawPhone.replace(/\D/g, "");
  if (!digits || digits.length < 7) {
    return { isValid: false, formattedDisplay: rawPhone, waNumber: "", callNumber: "" };
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  if (digits.length === 10) {
    digits = "91" + digits;
  }

  const waNumber = digits;
  const callNumber = `+${digits}`;
  const formattedDisplay =
    digits.startsWith("91") && digits.length === 12
      ? `+91 ${digits.substring(2, 7)} ${digits.substring(7)}`
      : `+${digits}`;

  return { isValid: true, formattedDisplay, waNumber, callNumber };
};

export default function FeaturedAgentsWidget({
  city = "",
  locality = "",
  selectedAgentId = null,
  onSelectAgent = null,
}) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  const databaseUrl =
    process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchFeaturedAgents = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (city) queryParams.append("city", city);
        if (locality) queryParams.append("locality", locality);

        const res = await fetch(
          `${databaseUrl}/api/featured-ads/locality?${queryParams.toString()}`
        );

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setAgents(data.data);
          }
        }
      } catch (err) {
        console.error("Error loading featured agents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedAgents();
  }, [city, locality, databaseUrl]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading || agents.length === 0) {
    return null; // Silent if no active ads
  }

  return (
    <div className="bg-gradient-to-r from-amber-950 via-orange-950 to-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 border-2 border-amber-500/30 my-6 relative overflow-hidden">
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-500/20 rounded-xl text-amber-400">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-black flex items-center gap-1.5">
              <span>Top Area Specialist Agents & Developers</span>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </h3>
            <p className="text-xs text-amber-200/80">
              Verified local experts in {locality || city || "your target location"} &bull; Click agent card to filter properties
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-400/30">
            Featured Ads
          </span>

          {/* Slider Scroll Arrows */}
          {agents.length > 1 && (
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => scroll("left")}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-amber-400/20 active:scale-95 cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition border border-amber-400/20 active:scale-95 cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cards Slider Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x pb-2 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent"
        style={{ scrollbarWidth: "thin" }}
      >
        {agents.map((ad) => {
          const dealer = ad.dealer || {};
          const dealerId = dealer._id || dealer.id;
          const agencyName =
            dealer.dealerDetails?.agencyName ||
            dealer.builderDetails?.companyName ||
            "Real Estate Agency";

          const locationText = ad.locality
            ? `${ad.locality}, ${ad.city}`
            : ad.city || "Area Specialist";

          const isSelected = selectedAgentId && selectedAgentId === dealerId;

          const phoneInfo = parsePhoneNumber(dealer.phone);
          const whatsappUrl = phoneInfo.isValid
            ? `https://wa.me/${phoneInfo.waNumber}?text=${encodeURIComponent(
                `Hello ${dealer.name}, I found your Featured Agent profile on 18homes for ${locationText}. I want to inquire about properties.`
              )}`
            : null;

          return (
            <div
              key={ad._id}
              onClick={() => onSelectAgent && onSelectAgent(dealer, ad)}
              className={`backdrop-blur-md rounded-2xl p-4 border transition space-y-3 flex flex-col justify-between w-[280px] sm:w-[330px] md:w-[350px] shrink-0 snap-start flex-shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-amber-500/30 border-amber-400 shadow-xl ring-2 ring-amber-400/60"
                  : "bg-white/10 border-amber-400/20 hover:border-amber-400/60 hover:bg-white/15"
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={dealer.avatar || DEFAULT_AVATAR}
                  alt={dealer.name || "Agent"}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/40 flex-shrink-0"
                />

                <div className="min-w-0 space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-white truncate">
                        {dealer.name || "Top Agent"}
                      </h4>
                      <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    </div>
                    {isSelected && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0">
                        Active Filter
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-amber-300 font-semibold truncate">
                    {agencyName}
                  </p>

                  {/* Location Tag */}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-200 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-400/20 w-fit max-w-full">
                    <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{locationText}</span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-1 italic pt-0.5">
                    "{ad.tagline}"
                  </p>
                </div>
              </div>

              {/* Click instruction / Status */}
              <div className="text-[10px] font-extrabold text-amber-300/90 text-right">
                {isSelected ? (
                  <span className="text-emerald-300">✓ Showing Properties</span>
                ) : (
                  <span className="hover:underline">Click card to view listings →</span>
                )}
              </div>

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-amber-200/90 font-bold flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>{ad.activePropertyCount || 0} Active Properties</span>
                </span>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      title="WhatsApp Agent"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {phoneInfo.isValid && (
                    <a
                      href={`tel:${phoneInfo.callNumber}`}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

