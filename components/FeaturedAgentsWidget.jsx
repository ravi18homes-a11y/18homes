"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Sparkles,
  ShieldCheck,
  Building,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
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

export default function FeaturedAgentsWidget({ city = "", locality = "" }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading || agents.length === 0) {
    return null; // Silent if no active ads
  }

  return (
    <div className="bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 rounded-3xl p-6 shadow-2xl text-white space-y-4 border-2 border-amber-500/30 my-6">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-500/20 pb-3">
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
              Verified local experts in {locality || city || "your target location"}
            </p>
          </div>
        </div>

        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-amber-400/30">
          Featured Ads
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((ad) => {
          const dealer = ad.dealer || {};
          const agencyName =
            dealer.dealerDetails?.agencyName ||
            dealer.builderDetails?.companyName ||
            "Real Estate Agency";

          const phoneInfo = parsePhoneNumber(dealer.phone);
          const whatsappUrl = phoneInfo.isValid
            ? `https://wa.me/${phoneInfo.waNumber}?text=${encodeURIComponent(
                `Hello ${dealer.name}, I found your Featured Agent profile on 18homes for ${ad.city}. I want to inquire about properties.`
              )}`
            : null;

          return (
            <div
              key={ad._id}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-amber-400/20 hover:border-amber-400/50 hover:bg-white/15 transition space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <img
                  src={dealer.avatar || DEFAULT_AVATAR}
                  alt={dealer.name || "Agent"}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400/40 flex-shrink-0"
                />

                <div className="min-w-0 space-y-0.5 flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="font-extrabold text-sm text-white truncate">
                      {dealer.name || "Top Agent"}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  </div>

                  <p className="text-xs text-amber-300 font-semibold truncate">
                    {agencyName}
                  </p>

                  <p className="text-[11px] text-slate-300 line-clamp-1 italic">
                    "{ad.tagline}"
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-[11px] text-amber-200/90 font-bold flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" />
                  <span>{ad.activePropertyCount || 0} Active Properties</span>
                </span>

                <div className="flex items-center gap-2">
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
