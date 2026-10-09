import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Visitor from "@/models/Visitor";
import TrackingEvent from "@/models/TrackingEvent";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const visitorId = searchParams.get("visitorId");

    // If specific user or visitor requested
    if (userId || visitorId) {
      const query = userId ? { userId } : { visitorId };
      const visitor = await Visitor.findOne(query).lean();

      if (!visitor) {
        return NextResponse.json({
          success: true,
          data: {
            interestSignals: {
              score: 0,
              engagementLevel: "Low",
              preferredLocations: [],
              preferredPropertyTypes: [],
              preferredBhk: [],
              approxBudget: { label: "Not Determined" },
            },
          },
        });
      }

      // Resolve user data if identified or userId/email exists
      let resolvedName = visitor.userName || "";
      let resolvedEmail = visitor.userEmail || "";
      let resolvedPhone = visitor.userPhone || "";
      let resolvedRole = visitor.userRole || "";

      if (mongoose.connection && mongoose.connection.db && (visitor.userId || resolvedEmail)) {
        try {
          const { ObjectId } = mongoose.Types;
          let userDoc = null;
          if (visitor.userId && ObjectId.isValid(visitor.userId)) {
            userDoc = await mongoose.connection.db.collection("users").findOne({ _id: new ObjectId(visitor.userId) });
          }
          if (!userDoc && resolvedEmail) {
            userDoc = await mongoose.connection.db.collection("users").findOne({ email: resolvedEmail });
          }
          if (userDoc) {
            if (!resolvedName || resolvedName.toLowerCase() === "user" || resolvedName.toLowerCase() === "guest visitor") {
              resolvedName = userDoc.name || (userDoc.firstName ? `${userDoc.firstName} ${userDoc.lastName || ""}`.trim() : "") || resolvedName;
            }
            if (!resolvedEmail) resolvedEmail = userDoc.email || "";
            if (!resolvedPhone) resolvedPhone = userDoc.phone || userDoc.contact || userDoc.phoneNumber || "";
            if (!resolvedRole) resolvedRole = userDoc.role || "";
          }
        } catch (uErr) {
          console.warn("User lookup error in interests:", uErr);
        }
      }

      // Fetch top viewed properties for this user/visitor
      const topViewed = await TrackingEvent.aggregate([
        {
          $match: {
            ...(userId ? { userId } : { visitorId: visitor.visitorId }),
            eventType: "property_view",
            propertyId: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$propertyId",
            title: { $first: "$propertyDetails.title" },
            location: { $first: "$propertyDetails.location" },
            priceText: { $first: "$propertyDetails.priceText" },
            propertyType: { $first: "$propertyDetails.propertyType" },
            viewCount: { $sum: 1 },
          },
        },
        { $sort: { viewCount: -1 } },
        { $limit: 8 },
      ]);

      return NextResponse.json({
        success: true,
        data: {
          visitorId: visitor.visitorId,
          userId: visitor.userId,
          isIdentified: visitor.isIdentified,
          userName: resolvedName || (visitor.isIdentified ? "Identified User" : `Guest ${visitor.visitorId}`),
          userEmail: resolvedEmail,
          userPhone: resolvedPhone,
          userRole: resolvedRole,
          device: visitor.device,
          browser: visitor.browser,
          os: visitor.os,
          interestSignals: visitor.interestSignals || {},
          topViewedProperties: topViewed,
          firstSeenAt: visitor.firstSeenAt,
          lastSeenAt: visitor.lastSeenAt,
          totalSessions: visitor.totalSessions,
          totalPageViews: visitor.totalPageViews,
          firstTouchSource: visitor.firstTouchSource,
          latestSource: visitor.latestSource,
        },
      });
    }

    // Global Interest Signals aggregation across the platform
    const [
      engagementBreakdown,
      topSearches,
      locationPreferences,
      typePreferences,
    ] = await Promise.all([
      Visitor.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$interestSignals.engagementLevel", "Low"] },
            count: { $sum: 1 },
            avgScore: { $avg: "$interestSignals.score" },
          },
        },
      ]),
      TrackingEvent.aggregate([
        {
          $match: {
            eventType: "property_search",
            "searchDetails.query": { $nin: ["", null] },
          },
        },
        {
          $group: {
            _id: "$searchDetails.query",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      TrackingEvent.aggregate([
        {
          $match: {
            eventType: "property_view",
            "propertyDetails.location": { $nin: ["", null] },
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
      ]),
      TrackingEvent.aggregate([
        {
          $match: {
            eventType: "property_view",
            "propertyDetails.propertyType": { $nin: ["", null] },
          },
        },
        {
          $group: {
            _id: "$propertyDetails.propertyType",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        engagementBreakdown,
        topSearches,
        locationPreferences,
        typePreferences,
      },
    });
  } catch (error) {
    console.error("Interest signals error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch interest signals" }, { status: 500 });
  }
}
