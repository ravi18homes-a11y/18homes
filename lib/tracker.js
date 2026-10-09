// lib/tracker.js
"use client";

// Cookie helper functions
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

// Generate unique ID
function generateId(prefix = "") {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// Safe device, browser, OS detection without invasive fingerprinting
function getClientEnvironment() {
  if (typeof window === "undefined") {
    return { device: "Desktop", browser: "Unknown", os: "Unknown" };
  }

  const ua = navigator.userAgent || "";
  let device = "Desktop";
  if (/mobile/i.test(ua)) device = "Mobile";
  else if (/tablet|ipad/i.test(ua)) device = "Tablet";

  let browser = "Unknown";
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

// Extract UTM parameters and determine channel attribution
function getAttribution() {
  if (typeof window === "undefined") return { source: "direct", channel: "Direct" };

  const urlParams = new URLSearchParams(window.location.search);
  const utm_source = urlParams.get("utm_source") || "";
  const utm_medium = urlParams.get("utm_medium") || "";
  const utm_campaign = urlParams.get("utm_campaign") || "";
  const utm_term = urlParams.get("utm_term") || "";
  const utm_content = urlParams.get("utm_content") || "";
  const referrer = typeof document !== "undefined" ? document.referrer || "" : "";
  const landingPage = window.location.pathname;

  let channel = "Direct";
  const mediumLower = utm_medium.toLowerCase();
  const sourceLower = utm_source.toLowerCase();
  const refLower = referrer.toLowerCase();

  if (["cpc", "ppc", "paid_search", "google_ads", "adwords"].includes(mediumLower)) {
    channel = "Paid Search";
  } else if (["paid_social", "social_cpc", "meta_ads", "fb_ads"].includes(mediumLower)) {
    channel = "Paid Social";
  } else if (mediumLower === "email") {
    channel = "Email";
  } else if (sourceLower || mediumLower) {
    channel = "Campaign / Ads";
  } else if (refLower) {
    if (/google|bing|yahoo|duckduckgo|ecosia|baidu/.test(refLower)) {
      channel = "Organic Search";
    } else if (/facebook|instagram|linkedin|twitter|t\.co|wa\.me|whatsapp|reddit|pinterest/.test(refLower)) {
      channel = "Social";
    } else {
      channel = "Referral";
    }
  }

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    utm_content,
    referrer,
    landingPage,
    channel,
  };
}

// Sanitize metadata to prevent logging sensitive details
function sanitizeMetadata(data) {
  if (!data || typeof data !== "object") return {};
  const forbidden = ["password", "token", "auth", "secret", "card", "cvv", "otp", "pin", "credential"];
  const clean = {};

  for (const [key, val] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    if (forbidden.some((bad) => keyLower.includes(bad))) {
      continue;
    }
    if (typeof val === "object" && val !== null) {
      if (Array.isArray(val)) {
        clean[key] = val.slice(0, 20); // Limit array size
      } else {
        clean[key] = sanitizeMetadata(val);
      }
    } else if (typeof val === "string") {
      clean[key] = val.substring(0, 500); // Limit string length
    } else {
      clean[key] = val;
    }
  }
  return clean;
}

// Singleton Tracker Class
class BehaviorTracker {
  constructor() {
    this.visitorId = null;
    this.sessionId = null;
    this.userId = null;
    this.isInitialized = false;
    this.inactivityTimeoutMs = 30 * 60 * 1000; // 30 minutes
    this.lastPageViewUrl = "";
    this.lastEventTimes = new Map();
  }

  init() {
    if (typeof window === "undefined" || this.isInitialized) return;

    // 1. Get or generate persistent Visitor ID (G-xxxxxxxx)
    let vid = getCookie("_18h_vid");
    if (!vid) {
      vid = localStorage.getItem("_18h_vid");
    }
    if (!vid) {
      vid = generateId("G-");
    }
    this.visitorId = vid;
    setCookie("_18h_vid", vid, 365);
    localStorage.setItem("_18h_vid", vid);

    // 2. Check for authenticated User ID and profile from existing storage
    try {
      const userDataStr = localStorage.getItem("userData");
      if (userDataStr) {
        const u = JSON.parse(userDataStr);
        if (u && (u._id || u.id)) {
          this.userId = String(u._id || u.id);
          const name = u.name || (u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : "") || "";
          const email = u.email || "";
          const phone = u.phone || u.contact || u.phoneNumber || "";
          const role = u.role || "user";

          // Auto-sync visitor identity with full user profile
          this.identify(this.userId, { name, email, phone, role });
        }
      }
    } catch (e) {}

    // 3. Manage Session (S-xxxxxxxx) with inactivity timeout
    const now = Date.now();
    let sid = getCookie("_18h_sid") || localStorage.getItem("_18h_sid");
    const lastActiveStr = localStorage.getItem("_18h_last_active");
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

    let isNewSession = false;
    if (!sid || !lastActive || now - lastActive > this.inactivityTimeoutMs) {
      sid = generateId("S-");
      isNewSession = true;
    }

    this.sessionId = sid;
    setCookie("_18h_sid", sid, 1);
    localStorage.setItem("_18h_sid", sid);
    localStorage.setItem("_18h_last_active", now.toString());

    this.isInitialized = true;

    // If new session, emit session_start with attribution
    if (isNewSession) {
      const attribution = getAttribution();
      this.trackEvent("session_start", {
        source: attribution,
        metadata: { isNewSession: true },
      });
    }
  }

  // Update activity timestamp to extend session
  touchActivity() {
    if (typeof window === "undefined") return;
    const now = Date.now();
    const lastActiveStr = localStorage.getItem("_18h_last_active");
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

    if (lastActive && now - lastActive > this.inactivityTimeoutMs) {
      // Inactivity crossed -> start new session
      this.sessionId = generateId("S-");
      setCookie("_18h_sid", this.sessionId, 1);
      localStorage.setItem("_18h_sid", this.sessionId);
      localStorage.setItem("_18h_last_active", now.toString());

      this.trackEvent("session_start", {
        source: getAttribution(),
        metadata: { resumedAfterTimeout: true },
      });
    } else {
      localStorage.setItem("_18h_last_active", now.toString());
    }
  }

  // Associate Visitor with Registered User
  identify(userId, userInfo = {}) {
    if (!userId) return;
    this.userId = String(userId);

    // Call server to link visitor history with registered user
    if (typeof window !== "undefined") {
      const payload = {
        visitorId: this.visitorId,
        userId: this.userId,
        name: userInfo.name || "",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        role: userInfo.role || "",
      };

      try {
        fetch("/api/tracking/identify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      } catch (err) {}
    }
  }

  // Send Event to backend
  trackEvent(eventType, options = {}) {
    if (typeof window === "undefined") return;
    if (!this.isInitialized) this.init();

    this.touchActivity();

    const eventId = generateId("evt_");
    const env = getClientEnvironment();
    const attribution = getAttribution();

    // Check for user login dynamically if not cached
    if (!this.userId) {
      try {
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          const u = JSON.parse(userDataStr);
          if (u && (u._id || u.id)) this.userId = String(u._id || u.id);
        }
      } catch (e) {}
    }

    const payload = {
      eventId,
      eventType,
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      userId: this.userId || null,
      propertyId: options.propertyId || null,
      propertyDetails: options.propertyDetails || {},
      searchDetails: options.searchDetails || {},
      metadata: sanitizeMetadata(options.metadata || {}),
      source: {
        path: window.location.pathname + window.location.search,
        referrer: attribution.referrer,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_term: attribution.utm_term,
        utm_content: attribution.utm_content,
        channel: attribution.channel,
      },
      device: env.device,
      browser: env.browser,
      os: env.os,
      createdAt: new Date().toISOString(),
    };

    // Use sendBeacon for best performance or keepalive fetch
    const endpoint = "/api/tracking/event";
    const dataStr = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([dataStr], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: dataStr,
        keepalive: true,
      }).catch(() => {});
    }
  }

  // Safe page view tracking (Strict Mode & hydration deduplication)
  trackPageView(currentUrl) {
    if (typeof window === "undefined") return;
    if (!this.isInitialized) this.init();

    const targetUrl = currentUrl || window.location.pathname + window.location.search;
    const now = Date.now();

    // Prevent duplicate firing within 600ms for exact same URL
    if (this.lastPageViewUrl === targetUrl && now - (this.lastPageViewTime || 0) < 600) {
      return;
    }

    this.lastPageViewUrl = targetUrl;
    this.lastPageViewTime = now;

    this.trackEvent("page_view", {
      metadata: {
        title: typeof document !== "undefined" ? document.title : "",
        url: targetUrl,
      },
    });
  }

  // Send lightweight live visitor presence heartbeat
  sendHeartbeat() {
    if (typeof window === "undefined") return;
    if (!this.isInitialized) this.init();

    const payload = {
      visitorId: this.visitorId,
      sessionId: this.sessionId,
      userId: this.userId || null,
      currentPath: window.location.pathname,
      device: getClientEnvironment().device,
      channel: getAttribution().channel,
    };

    fetch("/api/tracking/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}

// Export singleton instance
export const tracker = new BehaviorTracker();

export default tracker;
