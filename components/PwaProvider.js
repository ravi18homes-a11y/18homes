"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";

const PwaContext = createContext({
  isInstallable: false,
  installApp: async () => {},
  showInstallPopup: false,
  setShowInstallPopup: () => {},
});

export const usePwa = () => useContext(PwaContext);

export default function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  useEffect(() => {
    // 1. Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.error("Service Worker registration failed:", err);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
    }

    // 2. Listen to beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log("'beforeinstallprompt' event was fired.");
    };

    // Check if the event was already captured by the early inline script in layout
    if (typeof window !== "undefined" && window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      setIsInstallable(true);
      console.log("Found stashed deferredPrompt from window.");
    }

    const handleCustomPwaInstallable = () => {
      if (typeof window !== "undefined" && window.deferredPrompt) {
        setDeferredPrompt(window.deferredPrompt);
        setIsInstallable(true);
        console.log("Custom pwa-installable event received.");
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-installable", handleCustomPwaInstallable);

    // 3. Listen for app installed event
    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstallPopup(false);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-installable", handleCustomPwaInstallable);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 4. Timer logic for homepage popup
  useEffect(() => {
    if (!isInstallable) return;

    // Check if the user is on the homepage (pathname === "/")
    if (window.location.pathname !== "/") return;

    // Check if user has already dismissed the popup recently (24 hours cooldown)
    try {
      const dismissedAt = localStorage.getItem("pwa-popup-dismissed-at");
      if (dismissedAt) {
        const timePassed = Date.now() - parseInt(dismissedAt, 10);
        const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
        if (timePassed < COOLDOWN_MS) {
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const timer = setTimeout(() => {
      setShowInstallPopup(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [isInstallable]);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log("No install prompt available");
      return;
    }
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsInstallable(false);
    setShowInstallPopup(false);
  };

  const DEFAULT_LOGO = "https://res.cloudinary.com/dxlykgx6w/image/upload/v1783796029/icon-192_bkv7wb.png";

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        installApp,
        showInstallPopup,
        setShowInstallPopup: (val) => {
          setShowInstallPopup(val);
          if (!val) {
            // Store timestamp of dismissal to enforce 24h cooldown
            try {
              localStorage.setItem("pwa-popup-dismissed-at", String(Date.now()));
            } catch (e) {
              console.error(e);
            }
          } 
        },
      }}
    >
      {children}
      {/* Homepage Install Popup */}
      {showInstallPopup && (
        <div className="fixed bottom-6 right-3 sm:right-6 z-[9999] max-w-sm rounded-3xl border border-slate-100 bg-white p-5 shadow-2xl ring-1 ring-slate-100/50 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-2xl">
              <Image src={DEFAULT_LOGO} alt="18Homes" width={40} height={40} className="rounded-xl object-contain" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900">Install 18 Homes</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add 18 Homes to your home screen for quick access and offline features.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={installApp}
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 cursor-pointer"
                >
                  Install Now
                </button>
                <button
                  onClick={() => setShowInstallPopup(false)}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 cursor-pointer"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}
