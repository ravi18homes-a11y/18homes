import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Visitor from "@/models/Visitor";
import Session from "@/models/Session";

export async function GET(req) {
  try {
    await dbConnect();

    // Active within the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const liveVisitors = await Visitor.find({
      $or: [
        { lastHeartbeat: { $gte: fiveMinutesAgo } },
        { lastSeenAt: { $gte: fiveMinutesAgo } },
      ],
    })
      .sort({ lastSeenAt: -1 })
      .limit(100)
      .lean();

    // Fetch active session info for each live visitor
    const visitorIds = liveVisitors.map((v) => v.visitorId);
    const recentSessions = await Session.find({
      visitorId: { $in: visitorIds },
    })
      .sort({ lastActivityAt: -1 })
      .lean();

    const sessionByVisitor = {};
    recentSessions.forEach((s) => {
      if (!sessionByVisitor[s.visitorId]) {
        sessionByVisitor[s.visitorId] = s;
      }
    });

    // Batch resolve user documents
    const userIds = liveVisitors
      .map((v) => v.userId)
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const emails = liveVisitors
      .map((v) => v.userEmail)
      .filter((e) => e && e.includes("@"));

    const userMap = new Map();
    if (mongoose.connection && mongoose.connection.db && (userIds.length > 0 || emails.length > 0)) {
      try {
        const matchedUsers = await mongoose.connection.db
          .collection("users")
          .find({
            $or: [
              ...(userIds.length > 0 ? [{ _id: { $in: userIds } }] : []),
              ...(emails.length > 0 ? [{ email: { $in: emails } }] : []),
            ],
          })
          .project({ name: 1, firstName: 1, lastName: 1, email: 1, phone: 1, contact: 1, phoneNumber: 1, role: 1 })
          .toArray();

        matchedUsers.forEach((u) => {
          const uName = u.name || (u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : "");
          const uPhone = u.phone || u.contact || u.phoneNumber || "";
          const uRole = u.role || "";
          if (u._id) userMap.set(String(u._id), { name: uName, email: u.email, phone: uPhone, role: uRole });
          if (u.email) userMap.set(u.email.toLowerCase(), { name: uName, email: u.email, phone: uPhone, role: uRole });
        });
      } catch (lookupErr) {
        console.warn("User batch lookup error in live:", lookupErr);
      }
    }

    const enrichedLiveVisitors = liveVisitors.map((v) => {
      const activeSession = sessionByVisitor[v.visitorId] || {};
      const uFromMap = (v.userId && userMap.get(String(v.userId))) || (v.userEmail && userMap.get(v.userEmail.toLowerCase())) || {};
      const resolvedName = (v.userName && v.userName.toLowerCase() !== "user" && v.userName.toLowerCase() !== "guest visitor")
        ? v.userName
        : (uFromMap.name || v.userName || "");
      const resolvedPhone = v.userPhone || uFromMap.phone || "";
      const resolvedEmail = v.userEmail || uFromMap.email || "";
      const resolvedRole = v.userRole || uFromMap.role || "";

      return {
        visitorId: v.visitorId,
        userId: v.userId,
        isIdentified: v.isIdentified,
        userName: resolvedName || (v.isIdentified ? "User" : `Guest ${v.visitorId.substring(0, 8)}`),
        userEmail: resolvedEmail,
        userPhone: resolvedPhone,
        userRole: resolvedRole,
        device: v.device,
        browser: v.browser,
        os: v.os,
        lastSeenAt: v.lastSeenAt,
        currentPage: activeSession.exitPage || activeSession.landingPage || "/",
        channel: activeSession.source?.channel || v.latestSource?.channel || "Direct",
        utm_campaign: activeSession.source?.utm_campaign || v.latestSource?.utm_campaign || "",
        sessionPageViews: activeSession.pageViews || 1,
        sessionDurationSec: activeSession.durationSec || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        activeCount: enrichedLiveVisitors.length,
        visitors: enrichedLiveVisitors,
      },
    });
  } catch (error) {
    console.error("Live visitors error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch live visitors" }, { status: 500 });
  }
}
