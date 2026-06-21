"use client";
import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";
import { IoMdCall, IoMdMail } from "react-icons/io";

export default function Footer() {
  return (
    <footer className="w-full bg-[#F6F6F6] pt-16 text-[#1E1E1E]">
      <div className="max-w-[1450px] mx-auto px-6 lg:px-12 flex flex-col lg:flex-row  justify-between gap-12">
        {/* LOGO */}
        <div className="flex flex-col  md:items-start">
          <Link href="/">
            <img
              src={
                "https://res.cloudinary.com/dxlykgx6w/image/upload/v1765721624/18homess-removebg-preview_kqdv2j.png"
              }
              alt="logo"
              className="w-[80px] h-[80px] object-contain"
            />
          </Link>
        </div>

        {/* QUICK LINK + SERVICES */}
        <div className="grid md:grid-cols-3 text-black">
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
              <li>1 RK / 1 BHK Flat</li>
              <li>2 BHK Flat</li>
              <li>3 BHK Flat</li>
              <li>4+ BHK Flat</li>
              
            </ul>
          </div>
          <div className="text-black">
            <h3 className="text-lg font-semibold mb-6 tracking-wide">OFFICE</h3>

            <p className="text-[16px] leading-7 mb-6 font-normal">
              Kanak Farm House ,
              <br />
              GovindPuram , Ghaziabad, (U.P.)
              <br />
              201013
            </p>

            <div className="flex items-center gap-3 mb-4">
              <IoMdMail size={22} />
              <p className="text-[16px] font-normal">
                18homes.website@gmail.com
              </p>
            </div>

            <div className="flex items-center gap-3">
              <IoMdCall size={22} />
              <p className="text-[16px] font-normal">
                +91 7827602246
              </p>
            </div>
          </div>
        </div>

        {/* OFFICE */}
      </div>

      {/* LINE */}
      <div className="max-w-[1350px]  px-6 lg:px-12 mx-auto border-t border-[#9FABC1] mt-14"></div>

      {/* COPYRIGHT + SOCIAL */}
      <div className="max-w-[1450px] mx-auto px-6 lg:pl-12 pr-[90px] py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-black">
        <p className="text-[15px] font-normal">
          Copyright © 2025 <span className="font-semibold">18Homes </span>
          All Rights Reserved. Design by RS & PS
        </p>

        <div className="flex items-center gap-4">
          <span className="text-[15px] font-medium">FOLLOW US :</span>

          <div className="flex items-center gap-5 text-[20px]">
            <Link href={"https://www.facebook.com/share/1AqkBeyC4R/"} target="_blank">
              <FaFacebookF />
            </Link>
            <Link href={"https://www.instagram.com/18homes?igsh=amNlcWlvOTljY2E0"} target="_blank">
              <FaInstagram />
            </Link>
            {/* <Link href={"https://www.youtube.com/"} target="_blank">
              <FaYoutube />
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
