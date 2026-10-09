import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Visitor from "@/models/Visitor";
import Session from "@/models/Session";
import TrackingEvent from "@/models/TrackingEvent";

export async function GET(req) {
  try {
    await dbConnect();

    // Query parameters for date filtering
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d"; // 24h, 7d, 30d, all

    let dateFilter = {};
    const now = new Date();
    if (range === "24h") {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
    } else if (range === "7d") {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (range === "30d") {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    }

    // 1. High-level counts
    const [
      totalVisitors,
      uniqueGuests,
      registeredVisitors,
      totalSessions,
      eventCounts,
    ] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.countDocuments({ $or: [{ userId: null }, { userId: "" }, { isIdentified: false }] }),
      Visitor.countDocuments({ isIdentified: true }),
      Session.countDocuments(dateFilter.createdAt ? { startedAt: dateFilter.createdAt } : {}),
      TrackingEvent.aggregate([
        ...(dateFilter.createdAt ? [{ $match: dateFilter }] : []),
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = {};
    eventCounts.forEach((e) => {
      countMap[e._id] = e.count;
    });

    // 2. Top Properties Viewed
    const topProperties = await TrackingEvent.aggregate([
      {
        $match: {
          eventType: "property_view",
          propertyId: { $ne: null },
          ...(dateFilter.createdAt ? dateFilter : {}),
        },
      },
      {
        $group: {
          _id: "$propertyId",
          title: { $first: "$propertyDetails.title" },
          location: { $first: "$propertyDetails.location" },
          priceText: { $first: "$propertyDetails.priceText" },
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: 8 },
    ]);

    // 3. Top Locations
    const topLocations = await TrackingEvent.aggregate([
      {
        $match: {
          "propertyDetails.location": { $nin: ["", null, "N/A"] },
          ...(dateFilter.createdAt ? dateFilter : {}),
        },
      },
      {
        $group: {
          _id: "$propertyDetails.location",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // 4. Traffic Sources / Channels Breakdown
    const trafficSources = await Session.aggregate([
      ...(dateFilter.createdAt ? [{ $match: { startedAt: dateFilter.createdAt } }] : []),
      {
        $group: {
          _id: { $ifNull: ["$source.channel", "Direct"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Campaigns Breakdown
    const campaigns = await Session.aggregate([
      {
        $match: {
          "source.utm_campaign": { $nin: ["", null] },
          ...(dateFilter.createdAt ? { startedAt: dateFilter.createdAt } : {}),
        },
      },
      {
        $group: {
          _id: "$source.utm_campaign",
          source: { $first: "$source.utm_source" },
          medium: { $first: "$source.utm_medium" },
          sessionsCount: { $sum: 1 },
        },
      },
      { $sort: { sessionsCount: -1 } },
      { $limit: 10 },
    ]);

    // 6. Daily Activity Trend (last 14 days)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const dailyActivity = await TrackingEvent.aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          events: { $sum: 1 },
          pageViews: {
            $sum: { $cond: [{ $eq: ["$eventType", "page_view"] }, 1, 0] },
          },
          propertyViews: {
            $sum: { $cond: [{ $eq: ["$eventType", "property_view"] }, 1, 0] },
          },
          leads: {
            $sum: { $cond: [{ $eq: ["$eventType", "lead_submit"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalVisitors,
          uniqueGuests,
          registeredVisitors,
          totalSessions,
          pageViews: countMap["page_view"] || 0,
          propertyViews: countMap["property_view"] || 0,
          propertySaves: countMap["property_save"] || 0,
          whatsappClicks: countMap["whatsapp_click"] || 0,
          callClicks: countMap["call_click"] || 0,
          leadsCount: countMap["lead_submit"] || 0,
          searchesCount: countMap["property_search"] || 0,
        },
        topProperties,
        topLocations,
        trafficSources,
        campaigns,
        dailyActivity,
      },
    });
  } catch (error) {
    console.error("Admin tracking overview error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch overview metrics" }, { status: 500 });
  }
}
