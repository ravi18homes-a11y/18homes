import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const builderId = searchParams.get("builderId");
    const builderEmail = searchParams.get("builderEmail");

    let filter = {};
    if (builderId) {
      filter = {
        $or: [
          { builderId: builderId },
          { builderId: "builder" },
          { builderId: "" },
          { builderId: { $exists: false } },
          { builderEmail: builderEmail ? builderEmail.toLowerCase() : "" }
        ]
      };
    }

    const events = await Analytics.find(filter).sort({ timestamp: -1 }).limit(1000);

    const totalViews = events.filter((e) => e.eventType === "page_view" || e.eventType === "visitor").length;
    const phoneClicks = events.filter((e) => e.eventType === "phone_click").length;
    const whatsappClicks = events.filter((e) => e.eventType === "whatsapp_click").length;

    const getVisitorKey = (ev) => {
      const email = (ev.userEmail || "").toLowerCase().trim();
      const phone = (ev.userPhone || "").trim();
      const visitorId = (ev.visitorId || "").trim();
      const userName = (ev.userName || "").trim();

      if (email && email !== "visitor@18homes.in" && email !== "guest@18homes.in") {
        return email;
      }
      if (phone && phone !== "+91 98765 43210" && phone !== "9876543210") {
        return phone;
      }
      if (visitorId) {
        return visitorId;
      }
      if (userName && userName.toLowerCase() !== "guest visitor") {
        return userName.toLowerCase();
      }
      return email || phone || "anonymous_guest";
    };

    // Calculate unique visitors
    const uniqueVisitorKeys = new Set();
    events.filter((e) => e.eventType === "page_view" || e.eventType === "visitor").forEach((ev) => {
      const key = getVisitorKey(ev);
      if (key) uniqueVisitorKeys.add(key);
    });
    const visitors = uniqueVisitorKeys.size;

    const timeEvents = events.filter((e) => e.eventType === "time_spent" && e.durationSec > 0);
    let avgSec = 0;
    if (timeEvents.length > 0) {
      const sum = timeEvents.reduce((acc, curr) => acc + (curr.durationSec || 0), 0);
      avgSec = Math.round(sum / timeEvents.length);
    }
    const avgMinFormatted = avgSec > 0 ? (avgSec >= 60 ? `${Math.round(avgSec / 60)} min` : `${avgSec} sec`) : "0 min";

    const flatCounts = {};
    const cityCounts = {};
    events.forEach((e) => {
      if (e.flatUnit) flatCounts[e.flatUnit] = (flatCounts[e.flatUnit] || 0) + 1;
      if (e.city) cityCounts[e.city] = (cityCounts[e.city] || 0) + 1;
    });

    let mostViewedFlat = "N/A";
    let maxFlatCount = 0;
    Object.entries(flatCounts).forEach(([flat, count]) => {
      if (count > maxFlatCount) {
        maxFlatCount = count;
        mostViewedFlat = flat;
      }
    });

    let mostInterestedCity = "N/A";
    let maxCityCount = 0;
    Object.entries(cityCounts).forEach(([city, count]) => {
      if (count > maxCityCount) {
        maxCityCount = count;
        mostInterestedCity = city;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        visitorsCount: visitors,
        phoneClickCount: phoneClicks,
        whatsAppClickCount: whatsappClicks,
        propertiesViewsCount: totalViews,
        averageTimeMin: avgMinFormatted,
        mostViewedFlat,
        mostInterestedCity,
        events,
      },
    });
  } catch (error) {
    console.error("Error fetching builder analytics from database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
