"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { IoChatbubbleEllipses, IoChevronDown } from "react-icons/io5";

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const isDraggingRef = useRef(false);
  const startPointerRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const currentPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const buttonSize = 56;
    const padding = 16;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const isMobile = screenWidth < 640;
    const bottomPadding = isMobile ? 80 : padding;

    const savedX = localStorage.getItem("floating_pos_x");
    const savedY = localStorage.getItem("floating_pos_y");

    let initX = screenWidth - buttonSize - padding;
    let initY = screenHeight - buttonSize - bottomPadding;

    if (savedX !== null && savedY !== null) {
      const x = parseFloat(savedX);
      const y = parseFloat(savedY);
      initX = Math.max(padding, Math.min(x, screenWidth - buttonSize - padding));
      initY = Math.max(padding, Math.min(y, screenHeight - buttonSize - bottomPadding));
    }

    const initialPos = { x: initX, y: initY };
    setPosition(initialPos);
    currentPosRef.current = initialPos;
  }, []);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;

      const dx = e.clientX - startPointerRef.current.x;
      const dy = e.clientY - startPointerRef.current.y;

      if (Math.hypot(dx, dy) > 5) {
        hasMovedRef.current = true;
      }

      if (hasMovedRef.current) {
        const buttonSize = 56;
        const padding = 16;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const isMobile = screenWidth < 640;
        const bottomPadding = isMobile ? 80 : padding;

        let newX = startPosRef.current.x + dx;
        let newY = startPosRef.current.y + dy;

        newX = Math.max(padding, Math.min(newX, screenWidth - buttonSize - padding));
        newY = Math.max(padding, Math.min(newY, screenHeight - buttonSize - bottomPadding));

        setPosition({ x: newX, y: newY });
        currentPosRef.current = { x: newX, y: newY };
      }
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      const buttonSize = 56;
      const padding = 16;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const isMobile = screenWidth < 640;
      const bottomPadding = isMobile ? 80 : padding;

      const currentX = currentPosRef.current.x;
      const currentY = currentPosRef.current.y;

      const distLeft = currentX;
      const distRight = screenWidth - currentX - buttonSize;
      const distTop = currentY;
      const distBottom = screenHeight - currentY - buttonSize - bottomPadding;

      const minDist = Math.min(distLeft, distRight, distTop, distBottom);

      let targetX = currentX;
      let targetY = currentY;

      if (minDist === distLeft) {
        targetX = padding;
      } else if (minDist === distRight) {
        targetX = screenWidth - buttonSize - padding;
      } else if (minDist === distTop) {
        targetY = padding;
      } else {
        targetY = screenHeight - buttonSize - bottomPadding;
      }

      targetX = Math.max(padding, Math.min(targetX, screenWidth - buttonSize - padding));
      targetY = Math.max(padding, Math.min(targetY, screenHeight - buttonSize - bottomPadding));

      const finalPos = { x: targetX, y: targetY };
      setPosition(finalPos);
      currentPosRef.current = finalPos;

      localStorage.setItem("floating_pos_x", targetX.toString());
      localStorage.setItem("floating_pos_y", targetY.toString());

      if (!hasMovedRef.current) {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = currentPosRef.current;
    
    // Prevent browser default drag behavior or selection
    e.preventDefault();
  };

  const links = [
    {
      href: "tel:+918796763688",
      className:
        "px-3 py-3 font-bold bg-[#c04b7e] border-[#c04b7e] text-[#101010] rounded-full text-[18px] border hover:border-[#8c4bdc] hover:bg-transparent hover:text-[#8c4bdc] transition shadow-md flex items-center justify-center",
      icon: <IoCall size={24} />,
    },
    {
      href: "https://wa.me/+918796763688",
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

  const opensDown = position && position.y < (typeof window !== "undefined" ? window.innerHeight : 800) / 2;
  const alignsLeft = position && position.x < (typeof window !== "undefined" ? window.innerWidth : 600) / 2;

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

      <div
        className="fixed z-50 select-none touch-none flex flex-col items-center bottom-20 sm:bottom-4 right-4"
        style={position ? { left: `${position.x}px`, top: `${position.y}px`, bottom: "auto", right: "auto" } : {}}
      >
        {/* Expanded Links Area */}
        <div
          className={`absolute flex flex-col gap-4 transition-all duration-300 ease-out ${
            opensDown ? "top-16 origin-top" : "bottom-16 origin-bottom"
          } ${
            alignsLeft ? "left-0" : "right-0"
          } ${
            isOpen
              ? "opacity-100 scale-100 pointer-events-auto translate-y-0"
              : `opacity-0 scale-75 pointer-events-none ${opensDown ? "-translate-y-4" : "translate-y-4"}`
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
          onPointerDown={handlePointerDown}
          className={`w-14 h-14 rounded-full text-white bg-gradient-to-tr from-[#c04b7e] to-[#8c4bdc] hover:from-[#8c4bdc] hover:to-[#c04b7e] transition-all duration-300 shadow-lg flex items-center justify-center focus:outline-none cursor-pointer ${!isOpen ? "animate-blink-pulse" : ""
            }`}
          aria-label="Toggle quick contact options"
        >
          <div className="relative w-7 h-7 flex items-center justify-center pointer-events-none">
            {/* Message Icon */}
            <div
              className={`absolute transition-all duration-300 ${isOpen
                ? "opacity-0 scale-50 rotate-90"
                : "opacity-100 scale-100 rotate-0"
                }`}
            >
              <IoChatbubbleEllipses size={28} />
            </div>
            {/* Arrow/Collapse Icon */}
            <div
              className={`absolute transition-all duration-300 ${isOpen
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
