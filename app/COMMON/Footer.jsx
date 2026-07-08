"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { IoMdCall, IoMdMail } from "react-icons/io";

export default function Footer() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.footer) {
          setData(json.footer);
        }
      })
      .catch((err) => console.error("Error fetching footer data:", err));
  }, []);

  const logo = data?.logo || "https://res.cloudinary.com/dxlykgx6w/image/upload/v1765721624/18homess-removebg-preview_kqdv2j.png";
  const address = data?.address || "Kanak Farm House ,\nGovindPuram , Ghaziabad, (U.P.)\n201013";
  const email = data?.email || "18homes.website@gmail.com";
  const phone = data?.phone || "+91 7827602246";
  const copyright = data?.copyright || "Copyright © 2025 18Homes All Rights Reserved. Design by RS & PS";
  const facebook = data?.facebook || "https://www.facebook.com/share/1AqkBeyC4R/";
  const instagram = data?.instagram || "https://www.instagram.com/18homes?igsh=amNlcWlvOTljY2E0";
  const phone2 = data?.phone2 || "";
  const phone3 = data?.phone3 || "";
  const justdial = data?.justdial || "";
  const youtube = data?.youtube || "";
  const services = data?.services || [
    "1 RK / 1 BHK Flat",
    "2 BHK Flat",
    "3 BHK Flat",
    "4+ BHK Flat"
  ];

  const customBgStyle = data?.bgColor ? { backgroundColor: data.bgColor } : {};
  const customTextStyle = data?.textColor ? { color: data.textColor } : {};

  return (
    <footer className="w-full pt-16" style={{ backgroundColor: "#F6F6F6", color: "#1E1E1E", ...customBgStyle, ...customTextStyle }}>
      <div className="max-w-[1450px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row justify-between gap-12">
        {/* LOGO */}
        <div className="flex flex-col md:items-start">
          <Link href="/">
            <img
              src={logo}
              alt="logo"
              className="w-[80px] h-[80px] object-contain"
            />
          </Link>
        </div>

        {/* QUICK LINK + SERVICES */}
        <div className="grid md:grid-cols-3">
          {/* QUICK LINK */}
          <div className="lg:ml-[50px]">
            <h3 className="text-lg font-semibold mb-6 tracking-wide">
              QUICK LINK
            </h3>
            <ul className="space-y-3 text-[16px] font-normal">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* OUR SERVICE */}
          <div>
            <h3 className="text-lg font-semibold mb-6 tracking-wide">
              OUR SERVICE
            </h3>
            <ul className="space-y-3 text-[16px] font-normal">
              {services.map((item, idx) => {
                const label = typeof item === "string" ? item : (item?.label || "");
                const link = typeof item === "string" ? "" : (item?.link || "");
                if (link) {
                  return (
                    <li key={idx}>
                      <Link href={link} className="hover:underline">
                        {label}
                      </Link>
                    </li>
                  );
                }
                return <li key={idx}>{label}</li>;
              })}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6 tracking-wide">OFFICE</h3>

            <p className="text-[16px] leading-7 mb-6 font-normal whitespace-pre-line">
              {address}
            </p>

            <div className="flex items-center gap-3 mb-4">
              <IoMdMail size={22} />
              <p className="text-[16px] font-normal">
                {email}
              </p>
            </div>

            <div className="space-y-3">
              {phone && (
                <div className="flex items-center gap-3">
                  <IoMdCall size={22} />
                  <p className="text-[16px] font-normal">
                    {phone}
                  </p>
                </div>
              )}
              {phone2 && (
                <div className="flex items-center gap-3">
                  <IoMdCall size={22} />
                  <p className="text-[16px] font-normal">
                    {phone2}
                  </p>
                </div>
              )}
              {phone3 && (
                <div className="flex items-center gap-3">
                  <IoMdCall size={22} />
                  <p className="text-[16px] font-normal">
                    {phone3}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LINE */}
      <div className="max-w-[1350px] px-6 lg:px-12 mx-auto border-t border-[#9FABC1] mt-14"></div>

      {/* COPYRIGHT + SOCIAL */}
      <div className="max-w-[1450px] mx-auto px-6 lg:pl-12 pr-[90px] py-8 flex flex-col md:flex-row  justify-between gap-6">
        <p className="text-[15px] font-normal">
          {copyright}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-[15px] font-medium">FOLLOW US :</span>

          <div className="flex items-center gap-5 text-[20px]">
            {facebook && (
              <Link href={facebook} target="_blank">
                <FaFacebookF />
              </Link>
            )}
            {instagram && (
              <Link href={instagram} target="_blank">
                <FaInstagram />
              </Link>
            )}
            {youtube && (
              <Link href={youtube} target="_blank">
                <FaYoutube />
              </Link>
            )}
            {justdial && (
              <Link href={justdial} target="_blank" className="text-[14px] font-extrabold border border-current rounded-full w-6 h-6 flex items-center justify-center hover:bg-black hover:text-white transition-all" title="Justdial">
                JD
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
