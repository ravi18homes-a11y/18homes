"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io"; // cross icon

export default function Navbar({ color }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1186) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [showServices, setShowServices] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav
      className={`
            
        w-full fixed top-0 left-0 z-50 
        transition-all duration-300  
        ${isScrolled ? "bg-white shadow-md" : "bg-white"}
      `}
    >
      <div className="max-w-[1720px] mx-auto flex items-center justify-between lg:px-14 px-4 py-2">
        {/* LEFT SIDE — Logo + Menu */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/">
            <Image
              src={
                "https://res.cloudinary.com/dxlykgx6w/image/upload/v1765721624/18homess-removebg-preview_kqdv2j.png"
              }
              alt="Logo"
              width={70}
              height={70}
              className="object-contain max-w-[70px] max-h-[70px] "
            />
          </Link>

          <ul
            className={`desktop-menu hidden lg:flex items-center gap-8 ${
              isScrolled ? "text-black" : `text-black`
            } text-[18px]`}
          >
            <li>
              <Link href="/">होम</Link>
            </li>
            <li>
              <Link href="/buy">खरीदें</Link>
            </li>
            <li>
              <Link href="/sell">बेचें</Link>
            </li>
           

            <li>
              <Link href="/contact">संपर्क करें</Link>
            </li>
          </ul>
        </div>

        {/* RIGHT BUTTONS */}
        <div className="desktop-actions items-center gap-4">
          <Link
            href={"/contact"}
            className="px-7 py-2 font-bold border border-[#8c4bdc] text-[#8c4bdc] rounded-full text-[18px] hover:border-[#c04b7e] hover:bg-[#c04b7e] hover:text-[black] transition"
          >
            अभी बुक करें
          </Link>
          <Link
            href={"/login-signup"}
            className="px-7 py-2 font-bold border border-[#8c4bdc] text-[#8c4bdc] rounded-full text-[18px] hover:border-[#c04b7e] hover:bg-[#c04b7e] hover:text-[black] transition"
          >
            Login
          </Link>
          
        </div>

        <button
          className="hamburger-icon lg:hidden text-black text-4xl"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <IoMdClose />
          ) : (
            <GiHamburgerMenu
              className={`${!isScrolled ? "text-black" : "text-black"}`}
            />
          )}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0   z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`border-t border-t-neutral-300 mt-2 fixed top-19 left-0 h-full w-full bg-white shadow-xl z-50 p-8 pt-5
    transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col space-y-7 text-black text-[18px] ">
          <Link href="/" onClick={() => setOpen(false)}>
            होम
          </Link>
          

              <Link href="/buy">buy</Link>
            
              <Link href="/service/house">Sell</Link>
         
          <Link href="/contact" onClick={() => setOpen(false)}>
            संपर्क करें
          </Link>

          <Link
            href={"/contact"}
            className="w-[153px] px-7 mt-4 py-2 border border-[black] text-[black] rounded-full"
          >
            अभी बुक करें
          </Link>
          <Link
            href={"/login-signup"}
            className="w-[153px] px-7 mt-4 py-2 border border-[black] text-[black] rounded-full"
          >
            Login
          </Link>
          {/* <Link
            href="https://wa.me/+917827602246"
            className="px-7 py-2 font-bold border w-[180px] flex gap-2 items-center border-[#43b852] text-[#2fb464] bg-[white] rounded-full text-[18px] hover:border-[#3be8f3]  hover:text-[black] transition"
          >
            <FaWhatsapp size={28} /> <span>Whatsapp</span>
          </Link>
          <a
            href="tel:+917827602246"
            className="w-[120px] px-7 py-2 border-[red] border text-black rounded-full"
          >
            कॉल करें
          </a> */}
        </div>
      </div>
    </nav>
  );
}

