import "./globals.css";
import Navbar from "./COMMON/Navbar"; // navbar import
import Link from "next/link";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export const metadata = {
  title: "18 Homes - Best Property for Sale and Rent in NCR",
  description: "Leading Real Estate Company in NCR, Offering Prime Residential and Commercial Properties NCR Region.",
  verification: {
    google: "Pi6mrgXhctcaPWM_tvE-bzsUaTocDT7FWlYtjOXf0W0",
  },
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        {/* Google Tag Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RPR1HLBTMG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RPR1HLBTMG');
          `}
        </Script>
        <Toaster position="top-right" reverseOrder={false} />
        {children}
        <div className="fixed bottom-4 right-4 flex flex-col gap-4 z-50">
          <Link
            href="tel:+917827602246"
            className="px-3 py-3 font-bold bg-[#c04b7e] border-[#c04b7e] text-[#101010] rounded-full text-[18px] border hover:border-[#8c4bdc] hover:bg-transparent hover:text-[#8c4bdc] transition"
          >
            <IoCall size={24} />
          </Link>
          <Link
            href="https://wa.me/+917827602246"
            className="px-3 py-3 font-bold border  gap-2 flex border-[#43b852] text-[#2fb464] bg-[white] rounded-full text-[18px] hover:border-[#3be8f3]  hover:text-[black] transition"
          >
            <FaWhatsapp size={24} />
          </Link>
          <Link
            href="https://www.facebook.com/share/1AqkBeyC4R/"
            className="px-3 py-3 font-bold bg-[white] border-[blue] text-[blue] rounded-full text-[18px] border hover:border-[#8c4bdc] hover:bg-transparent hover:text-[#8c4bdc] transition"
          >
            <FaFacebook size={24} />
          </Link>
          <Link
            href="https://www.instagram.com/18homes?igsh=amNlcWlvOTljY2E0"
            className="px-3 py-3 font-bold border  gap-2 flex border-[red] text-[red] bg-[white] rounded-full text-[18px] hover:border-[#3be8f3]  hover:text-[black] transition"
          >
            <FaInstagram size={24} />
          </Link>
        </div>
      </body>
    </html>
  );
}
