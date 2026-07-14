"use client";

import Link from "next/link";
import { useState } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { IoChatbubbleEllipses, IoChevronDown } from "react-icons/io5";

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    {
      href: "tel:+917827602246",
      className:
        "px-3 py-3 font-bold bg-[#c04b7e] border-[#c04b7e] text-[#101010] rounded-full text-[18px] border hover:border-[#8c4bdc] hover:bg-transparent hover:text-[#8c4bdc] transition shadow-md flex items-center justify-center",
      icon: <IoCall size={24} />,
    },
    {
      href: "https://wa.me/+917827602246",
      className:
        "px-3 py-3 font-bold border gap-2 flex border-[#43b852] text-[#2fb464] bg-[white] rounded-full text-[18px] hover:border-[#3be8f3] hover:text-[black] transition shadow-md flex items-center justify-center",
      icon: <FaWhatsapp size={24} />,
    },
    {
      href: "https://www.facebook.com/share/1AqkBeyC4R/",
      className:
        "px-3 py-3 font-bold bg-[white] border-[blue] text-[blue] rounded-full text-[18px] border hover:border-[#8c4bdc] hover:bg-transparent hover:text-[#8c4bdc] transition shadow-md flex items-center justify-center",
      icon: <FaFacebook size={24} />,
    },
    {
      href: "https://www.instagram.com/18homes?igsh=amNlcWlvOTljY2E0",
      className:
        "px-3 py-3 font-bold border gap-2 flex border-[red] text-[red] bg-[white] rounded-full text-[18px] hover:border-[#3be8f3] hover:text-[black] transition shadow-md flex items-center justify-center",
      icon: <FaInstagram size={24} />,
    },
  ];

  return (
    <>
      <style>{`
        @keyframes floating-pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(140, 75, 220, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 12px rgba(140, 75, 220, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(140, 75, 220, 0);
          }
        }
        .animate-blink-pulse {
          animation: floating-pulse 2s infinite;
        }
      `}</style>

      <div className="fixed bottom-4 left-4 flex flex-col items-center z-50">
        {/* Expanded Links Area */}
        <div
          className={`absolute bottom-20 flex flex-col gap-4 transition-all duration-300 ease-out origin-bottom ${
            isOpen
              ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
              : "opacity-0 translate-y-4 scale-75 pointer-events-none"
          }`}
        >
          {links.map((link, idx) => (
            <Link key={idx} href={link.href} className={link.className}>
              {link.icon}
            </Link>
          ))}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full text-white bg-gradient-to-tr from-[#c04b7e] to-[#8c4bdc] hover:from-[#8c4bdc] hover:to-[#c04b7e] transition-all duration-300 shadow-lg flex items-center justify-center focus:outline-none cursor-pointer ${
            !isOpen ? "animate-blink-pulse" : ""
          }`}
          aria-label="Toggle quick contact options"
        >
          <div className="relative w-7 h-7 flex items-center justify-center">
            {/* Message Icon */}
            <div
              className={`absolute transition-all duration-300 ${
                isOpen
                  ? "opacity-0 scale-50 rotate-90"
                  : "opacity-100 scale-100 rotate-0"
              }`}
            >
              <IoChatbubbleEllipses size={28} />
            </div>
            {/* Arrow/Collapse Icon */}
            <div
              className={`absolute transition-all duration-300 ${
                isOpen
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-50 -rotate-90"
              }`}
            >
              <IoChevronDown size={28} />
            </div>
          </div>
        </button>
      </div>
    </>
  );
}
