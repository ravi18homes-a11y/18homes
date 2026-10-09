"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { tracker } from "@/lib/tracker";

function TrackingProviderInner({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize tracker and handle client-side route navigation
  useEffect(() => {
    tracker.init();

    const fullUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    tracker.trackPageView(fullUrl);
  }, [pathname, searchParams]);

  // Heartbeat interval for Live Visitors view (every 60 seconds)
  useEffect(() => {
    tracker.sendHeartbeat();

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        tracker.sendHeartbeat();
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tracker.sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Global listener for automatic click detection on WhatsApp, Call, and Mailto links
  useEffect(() => {
    const handleGlobalClicks = (e) => {
      const target = e.target.closest("a");
      if (!target) return;

      const href = target.getAttribute("href") || "";

      if (href.startsWith("tel:")) {
        tracker.trackEvent("call_click", {
          metadata: { phoneNumber: href.replace("tel:", "").trim() },
        });
      } else if (href.includes("wa.me") || href.includes("whatsapp.com") || href.includes("api.whatsapp.com")) {
        tracker.trackEvent("whatsapp_click", {
          metadata: { targetUrl: href },
        });
      }
    };

    window.addEventListener("click", handleGlobalClicks, { passive: true });
    return () => {
      window.removeEventListener("click", handleGlobalClicks);
    };
  }, []);

  return <>{children}</>;
}

export default function TrackingProvider({ children }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <TrackingProviderInner>{children}</TrackingProviderInner>
    </Suspense>
  );
}
