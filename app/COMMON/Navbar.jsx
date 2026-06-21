"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FaWhatsapp, FaUser, FaEdit, FaCog, FaHome } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import { MdLogin, MdPhone } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";

function flattenNavTree(nodes, depth = 0, acc = []) {
  for (const n of nodes || []) {
    acc.push({ node: n, depth });
    if (n.children?.length) flattenNavTree(n.children, depth + 1, acc);
  }
  return acc;
}

function DropdownPanel({ nodes }) {
  if (!nodes?.length) return null;
  const flat = flattenNavTree(nodes);
  return (
    <ul className="absolute left-0 top-full z-[60] mt-1 min-w-[230px] rounded-xl border border-slate-100 bg-white py-2 shadow-xl opacity-0 invisible transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100">
      {flat.map(({ node, depth }) => (
        <li key={node.id}>
          <Link
            href={node.href}
            className="block py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            style={{ paddingLeft: 12 + depth * 12, paddingRight: 16 }}
          >
            {node.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function NavItem({ href, label, items }) {
  const hasKids = items?.length > 0;
  if (!hasKids) {
    return (
      <li>
        <Link
          href={href}
          className="hover:text-[#8c4bdc] transition-colors"
        >
          {label}
        </Link>
      </li>
    );
  }
  return (
    <li className="group relative">
      <span className="inline-flex cursor-default items-center gap-1">
        <Link href={href} className="hover:text-[#8c4bdc] transition-colors">
          {label}
        </Link>
        <span className="text-xs text-slate-500" aria-hidden>
          ▾
        </span>
      </span>
      <DropdownPanel nodes={items} />
    </li>
  );
}

function MobileNavBranch({ node, onPick }) {
  return (
    <div>
      <Link href={node.href} onClick={onPick} className="block py-0.5">
        {node.title}
      </Link>
      {node.children?.length > 0 && (
        <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-slate-200 pl-2 text-[16px] text-slate-700">
          {node.children.map((ch) => (
            <MobileNavBranch key={ch.id} node={ch} onPick={onPick} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState("");
  const [navData, setNavData] = useState(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/navbar")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setNavData(data);
      })
      .catch(() => {
        if (!cancelled) setNavData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
            className={`desktop-menu hidden lg:flex items-center gap-8 ${isScrolled ? "text-black" : "text-black"
              } text-[18px]`}
          >
            {(navData?.menus || [
              { key: "home", label: "Home", href: "/", children: [] },
              { key: "buy", label: "Buy", href: "/buy", children: [] },
              { key: "sell", label: "Sell", href: "/sell", children: [] },
              { key: "contact", label: "Contact", href: "/contact", children: [] },
            ]).map((m) => (
              <NavItem
                key={m.key}
                href={m.href}
                label={m.label}
                items={m.children}
              />
            ))}
            {(navData?.sitePages || []).map((p) => (
              <NavItem
                key={p.id}
                href={p.href}
                label={p.title}
                items={p.children}
              />
            ))}
          </ul>
        </div>

        <div className="flex gap-5">
          <div className=" lg:flex items-center gap-4">
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-12 h-12 rounded-full cursor-pointer border-2 border-[#8c4bdc] overflow-hidden hover:border-[#c04b7e] transition"
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
                      {/* <Link
                        href="/edit-profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <FaEdit className="text-[#8c4bdc] text-xl" />
                        <span className="text-black">Edit Profile</span>
                      </Link> */}
                      
                      <Link
                        href="/my-properties"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <FaHome className="text-[#8c4bdc] text-xl" />
                        <span className="text-black">My Properties</span>
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
                        localStorage.removeItem("userData");
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

                  {/* <Link
                    href="/setting"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <FaCog className="text-[#8c4bdc] text-xl" />
                    <span className="text-black">Setting</span>
                  </Link> */}
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
        <div className="flex flex-col space-y-5 text-black text-[18px]">
          {(navData?.menus || [
            { key: "home", label: "Home", href: "/", children: [] },
            { key: "buy", label: "Buy", href: "/buy", children: [] },
            { key: "sell", label: "Sell", href: "/sell", children: [] },
            { key: "contact", label: "Contact", href: "/contact", children: [] },
          ]).map((m) => (
            <div key={m.key} className="space-y-2">
              <Link href={m.href} onClick={() => setOpen(false)}>
                {m.label}
              </Link>
              {m.children?.length > 0 && (
                <div className="ml-4 flex flex-col gap-2 border-l border-slate-200 pl-3 text-base text-slate-700">
                  {m.children.map((c) => (
                    <MobileNavBranch key={c.id} node={c} onPick={() => setOpen(false)} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {(navData?.sitePages || []).map((p) => (
            <div key={p.id} className="space-y-2">
              <Link href={p.href} onClick={() => setOpen(false)}>
                {p.title}
              </Link>
              {p.children?.length > 0 && (
                <div className="ml-4 flex flex-col gap-2 border-l border-indigo-100 pl-3 text-base text-slate-700">
                  {p.children.map((c) => (
                    <MobileNavBranch key={c.id} node={c} onPick={() => setOpen(false)} />
                  ))}
                </div>
              )}
            </div>
          ))}

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

          {/* {isLoggedIn && (
            <Link
              href="/edit-profile"
              className="w-[153px] px-7 mt-4 py-2 border border-[black] text-[black] rounded-full"
              onClick={() => setOpen(false)}
            >
              Edit Profile
            </Link>
          )} */}
        </div>
      </div>
    </nav>
  );
}
