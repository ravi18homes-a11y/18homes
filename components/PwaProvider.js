"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";

const PwaContext = createContext({
  isInstallable: false,
  installApp: async () => { },
  showInstallPopup: false,
  setShowInstallPopup: () => { },
});

export const usePwa = () => useContext(PwaContext);

export default function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  useEffect(() => {
    // 1. Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Reload page when the service worker is updated and takes control
      let refreshing = false;
      const handleControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      };
      navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

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
      setTimeout(() => {
        setDeferredPrompt(window.deferredPrompt);
        setIsInstallable(true);
      }, 0);
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
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      }
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

  const DEFAULT_LOGO = "https://res.cloudinary.com/domwj0m7s/image/upload/v1785082683/18homes_logo-removebg-preview_doiisr.png";

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
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-[9998] backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setShowInstallPopup(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90vw] max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl ring-1 ring-slate-100/50 transition-all duration-300 flex flex-col items-center text-center">
            <button
              onClick={() => setShowInstallPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-50 cursor-pointer"
              aria-label="Close installation popup"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-2xl mb-2 shadow-sm">
              <Image src={DEFAULT_LOGO} alt="18Homes" width={48} height={48} className="rounded-xl object-contain" />
            </div>
            <div className="space-y-2 w-full">
              <h4 className="font-bold text-slate-900 text-lg">Install 18 Homes</h4>
              <p className="text-xs text-slate-600 leading-relaxed px-2">
                Add 18 Homes to your home screen for quick access and offline features.
              </p>
              <div className="pt-3 flex items-center justify-center gap-3 w-full">
                <button
                  onClick={installApp}
                  className="flex-1 rounded-full bg-slate-900 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 cursor-pointer shadow-md"
                >
                  Install Now
                </button>
                <button
                  onClick={() => setShowInstallPopup(false)}
                  className="flex-1 rounded-full bg-slate-100 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 cursor-pointer"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </PwaContext.Provider>
  );
}
