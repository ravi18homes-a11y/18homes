"use client";

import React from "react";
import { ArrowRight, PhoneCall, Sparkles, ShieldCheck, Home } from "lucide-react";

export default function HomeCtaBanner() {
  const scrollToContact = () => {
    const el = document.getElementById("contact-form-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = "#contact-form-section";
    }
  };

  return (
    <section className="w-full py-12 md:py-16 bg-slate-900 text-white relative overflow-hidden my-4">
      {/* DECORATIVE AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 border border-purple-800/40 rounded-3xl p-8 sm:p-12 md:p-14 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
          {/* DECORATIVE LIGHT STREAK */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* LEFT CONTENT */}
          <div className="space-y-4 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/60 border border-purple-600/50 text-purple-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
              <Sparkles size={16} className="text-amber-400" />
              <span>Personalized Real Estate Consultation</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Looking for Your Dream Property in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300">Delhi-NCR?</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
              Whether you want to buy a 2BHK/3BHK flat, sell your home, or find premium rental options, our property experts are ready to assist you.
            </p>

            {/* QUICK FEATURES */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>100% Verified Listings</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <Home size={16} className="text-blue-400" />
                <span>Zero Hidden Charges</span>
              </div>
            </div>
          </div>

          {/* RIGHT ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={scrollToContact}
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-base sm:text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer w-full sm:w-auto"
            >
              <span>Send Requirement</span>
              <ArrowRight size={20} className="animate-pulse" />
            </button>

            <a
              href="tel:+918796763688"
              className="inline-flex items-center justify-center gap-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm sm:text-base px-6 py-3.5 rounded-2xl transition duration-200 cursor-pointer w-full sm:w-auto"
            >
              <PhoneCall size={18} className="text-emerald-400" />
              <span>Call Agent Instantly</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
