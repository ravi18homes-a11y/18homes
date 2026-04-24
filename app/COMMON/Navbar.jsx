"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FaWhatsapp, FaUser, FaEdit, FaCog } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { MdLogin, MdPhone } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const profileMenuRef = useRef(null);

  // Track auth state from localStorage (login saves 'authToken')
  useEffect(() => {
    const checkAuth = () => {
      try {
        setIsLoggedIn(!!localStorage.getItem("authToken"));
        setUser(JSON.parse(localStorage.getItem("userData")));
      } catch (e) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1186) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link href="/">
            <Image
              src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1765721624/18homess-removebg-preview_kqdv2j.png"
              alt="Logo"
              width={70}
              height={70}
              className="object-contain max-w-[70px] max-h-[70px]"
            />
          </Link>

          <ul
            className={`desktop-menu hidden lg:flex items-center gap-8 ${
              isScrolled ? "text-black" : "text-black"
            } text-[18px]`}
          >
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/buy">Buy</Link>
            </li>
            <li>
              <Link href="/sell">Sell</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>

        <div className="flex gap-5">
          <div className=" lg:flex items-center gap-4">
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-12 h-12 rounded-full border-2 border-[#8c4bdc] overflow-hidden hover:border-[#c04b7e] transition"
              >
                <Image
                  src="https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif"
                  alt="Profile"
                  width={48}
                  height={48}
                  className="object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://res.cloudinary.com/dxlykgx6w/image/upload/v1766862633/business-man-avatar-profile_1133257-2431_dygzgs.avif";
                  }}
                />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  {!isLoggedIn && (
                    <Link
                      href="/login-signup"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <MdLogin className="text-[#8c4bdc] text-xl" />
                      <span className="text-black">Login</span>
                    </Link>
                  )}

                  <Link
                    href="/contact"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <MdPhone className="text-[#8c4bdc] text-xl" />
                    <span className="text-black">Book Now</span>
                  </Link>

                  {isLoggedIn && (
                    <>
                      <Link
                        href="/edit-profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <FaEdit className="text-[#8c4bdc] text-xl" />
                        <span className="text-black">Edit Profile</span>
                      </Link>

                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <RiAdminLine className="text-[#8c4bdc] text-xl" />
                          <span className="text-black">Admin Dashbaord</span>
                        </Link>
                      )}
                    </>
                  )}

                  {isLoggedIn && (
                    <button
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition w-full text-left"
                      onClick={() => {
                        localStorage.removeItem("authToken");
                        setIsLoggedIn(false);
                        setShowProfileMenu(false);
                        window.location.href = "/";
                      }}
                    >
                      <FaUser className="text-[#8c4bdc] text-xl" />
                      <span className="text-black">Logout</span>
                    </button>
                  )}

                  <div className="border-t border-gray-200 my-2"></div>

                  <Link
                    href="/setting"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FaCog className="text-[#8c4bdc] text-xl" />
                    <span className="text-black">Setting</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <button
            className="hamburger-icon lg:hidden text-black text-4xl"
            onClick={() => setOpen(!open)}
          >
            {open ? <IoMdClose /> : <GiHamburgerMenu />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`border-t border-t-neutral-300 mt-2 fixed top-19 left-0 h-full w-full bg-white shadow-xl z-50 p-8 pt-5
    transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
    ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col space-y-7 text-black text-[18px]">
          <Link href="/" onClick={() => setOpen(false)}>
            Home
          </Link>

          <Link onClick={() => setOpen(false)} href="/buy">
            Buy
          </Link>

          <Link onClick={() => setOpen(false)} href="/sell">
            Sell
          </Link>

          <Link href="/contact" onClick={() => setOpen(false)}>
            Contact
          </Link>

          <Link
            href="/contact"
            className="w-[153px] px-7 mt-4 py-2 border border-[black] text-[black] rounded-full"
            onClick={() => setOpen(false)}
          >
            Book Now
          </Link>

          {!isLoggedIn && (
            <Link
              href="/login-signup"
              className="w-[153px] px-7 mt-4 py-2 border border-[black] text-[black] rounded-full"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}

          {isLoggedIn && (
            <Link
              href="/edit-profile"
              className="w-[153px] px-7 mt-4 py-2 border border-[black] text-[black] rounded-full"
              onClick={() => setOpen(false)}
            >
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
