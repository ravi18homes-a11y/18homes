import "./globals.css";
import Navbar from "./COMMON/Navbar"; // navbar import
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
export const metadata = {
  title: "18 Homes - Elegant Interior Design Solutions",
  description: "Transforming Spaces with Style and Comfort",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
      
        {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-4 z-50">
        <a
            href="tel:+917827602246"
            className="px-3 py-3 font-bold bg-[#c04b7e] border-[#c04b7e] text-[#101010] rounded-full text-[18px] border hover:border-[#8c4bdc] hover:bg-transparent hover:text-[#8c4bdc] transition"
          >
           <IoCall size={24} />
          </a>
          <Link
            href="https://wa.me/+917827602246"
            className="px-3 py-3 font-bold border  gap-2 flex border-[#43b852] text-[#2fb464] bg-[white] rounded-full text-[18px] hover:border-[#3be8f3]  hover:text-[black] transition"
          >
            <FaWhatsapp size={24}/>
          </Link>
      </div>
      </body>
    </html>
  );
}
