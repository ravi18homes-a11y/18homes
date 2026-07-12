import "./globals.css";
import Navbar from "./COMMON/Navbar"; // navbar import
import FloatingActions from "./COMMON/FloatingActions";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import PwaProvider from "@/components/PwaProvider";

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
        {/* Early PWA Install Prompt Capture */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-installable'));
              });
            `
          }}
        />
        {/* Google Tag Script */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RPR1HLBTMG"
          strategy="afterInteractive"
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
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
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "xlfs49h2ga");
          `}
        </Script>
        <Script id="tawk-to" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            Tawk_API.customStyle = {
              visibility: {
                desktop: {
                  position: 'bl',
                  xOffset: 20,
                  yOffset: 20
                },
                mobile: {
                  position: 'bl',
                  xOffset: 15,
                  yOffset: 15
                }
              }
            };
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/6a53e9a28ba18a1d4a7d7d7b/default';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
        <Toaster position="top-right" reverseOrder={false} />
        <PwaProvider>
          {children}
        </PwaProvider>
        <FloatingActions />
      </body>
    </html>
  );
}
