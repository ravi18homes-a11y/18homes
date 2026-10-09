import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Session from "@/models/Session";
import Visitor from "@/models/Visitor";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15", 10)));
    const visitorId = searchParams.get("visitorId");
    const userId = searchParams.get("userId");
    const channel = searchParams.get("channel");
    const device = searchParams.get("device");
    const search = (searchParams.get("search") || "").trim();

    const query = {};
    if (visitorId) query.visitorId = visitorId;
    if (userId) query.userId = userId;
    if (channel && channel !== "all") query["source.channel"] = channel;
    if (device && device !== "all") query.device = device;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { sessionId: searchRegex },
        { visitorId: searchRegex },
        { "source.utm_campaign": searchRegex },
        { "source.channel": searchRegex },
        { landingPage: searchRegex },
        { exitPage: searchRegex },
      ];
    }

    const [rawSessions, total, stats] = await Promise.all([
      Session.find(query)
        .sort({ startedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Session.countDocuments(query),
      Session.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            avgDuration: { $avg: "$durationSec" },
            avgPageViews: { $avg: "$pageViews" },
            bounces: {
              $sum: {
                $cond: [{ $and: [{ $lte: ["$pageViews", 1] }, { $lte: ["$durationSec", 15] }] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    // Batch resolve visitor and user details
    const visitorIds = [...new Set(rawSessions.map((s) => s.visitorId).filter(Boolean))];
    const userIds = [...new Set(rawSessions.map((s) => s.userId).filter(Boolean))];

    const [visitors, rawUsers] = await Promise.all([
      visitorIds.length > 0 ? Visitor.find({ visitorId: { $in: visitorIds } }).select({ visitorId: 1, userId: 1, userName: 1, userEmail: 1, userPhone: 1, userRole: 1, isIdentified: 1 }).lean() : [],
      (userIds.length > 0 && mongoose.connection?.db)
        ? mongoose.connection.db
            .collection("users")
            .find({
              _id: {
                $in: userIds
                  .filter((id) => mongoose.Types.ObjectId.isValid(id))
                  .map((id) => new mongoose.Types.ObjectId(id)),
              },
            })
            .project({ name: 1, firstName: 1, lastName: 1, email: 1, phone: 1, contact: 1, phoneNumber: 1, role: 1 })
            .toArray()
        : [],
    ]);

    const visitorMap = new Map();
    visitors.forEach((v) => visitorMap.set(v.visitorId, v));

    const userMap = new Map();
    rawUsers.forEach((u) => {
      const uName = u.name || (u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : "");
      const uPhone = u.phone || u.contact || u.phoneNumber || "";
      const uRole = u.role || "";
      userMap.set(String(u._id), { name: uName, email: u.email, phone: uPhone, role: uRole });
    });

    const sessions = rawSessions.map((s) => {
      const vis = visitorMap.get(s.visitorId) || {};
      const uId = s.userId || vis.userId;
      const uProfile = uId ? userMap.get(String(uId)) : null;

      const userName = (vis.userName && vis.userName.toLowerCase() !== "user" && vis.userName.toLowerCase() !== "guest visitor")
        ? vis.userName
        : (uProfile?.name || vis.userName || "");
      const userPhone = vis.userPhone || uProfile?.phone || "";
      const userEmail = vis.userEmail || uProfile?.email || "";
      const userRole = vis.userRole || uProfile?.role || "";
      const isIdentified = vis.isIdentified || !!uId || !!userName;

      // Engagement quality calculation
      let engagement = "Moderate";
      if ((s.pageViews >= 3 || s.durationSec >= 90)) {
        engagement = "High";
      } else if (s.pageViews <= 1 && s.durationSec <= 15) {
        engagement = "Bounced";
      }

      return {
        ...s,
        userName: userName || (isIdentified ? "User" : `Guest ${s.visitorId?.substring(0, 8)}`),
        userPhone,
        userEmail,
        userRole,
        isIdentified,
        engagement,
      };
    });

    const statSummary = stats[0] || { totalSessions: total, avgDuration: 0, avgPageViews: 0, bounces: 0 };
    const bounceRate = total > 0 ? Math.round((statSummary.bounces / total) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        metrics: {
          totalSessions: total,
          avgDurationSec: Math.round(statSummary.avgDuration || 0),
          avgPageViews: (statSummary.avgPageViews || 0).toFixed(1),
          bounceRate: `${bounceRate}%`,
        },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    console.error("Sessions list error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch sessions" }, { status: 500 });
  }
}
