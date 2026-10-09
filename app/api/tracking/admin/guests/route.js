import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Visitor from "@/models/Visitor";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "15", 10)));
    const search = (searchParams.get("search") || "").trim();
    const filterType = searchParams.get("type") || "all"; // "all" | "guests_only" | "identified_only"
    const sortBy = searchParams.get("sortBy") || "lastSeenAt"; // "lastSeenAt" | "firstSeenAt" | "score" | "sessions"

    const query = {};

    if (filterType === "guests_only") {
      query.$or = [{ userId: null }, { userId: "" }, { isIdentified: false }];
    } else if (filterType === "identified_only") {
      query.isIdentified = true;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { visitorId: searchRegex },
        { userName: searchRegex },
        { userEmail: searchRegex },
        { userPhone: searchRegex },
        { "latestSource.utm_campaign": searchRegex },
        { "latestSource.utm_source": searchRegex },
      ];
    }

    const sortOptions = {};
    if (sortBy === "firstSeenAt") sortOptions.firstSeenAt = -1;
    else if (sortBy === "score") sortOptions["interestSignals.score"] = -1;
    else if (sortBy === "sessions") sortOptions.totalSessions = -1;
    else sortOptions.lastSeenAt = -1;

    const [rawVisitors, total] = await Promise.all([
      Visitor.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Visitor.countDocuments(query),
    ]);

    // Batch resolve user documents for identified/linked visitors
    const userIds = rawVisitors
      .map((v) => v.userId)
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const emails = rawVisitors
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
        console.warn("User batch lookup error:", lookupErr);
      }
    }

    const visitors = rawVisitors.map((v) => {
      const uFromMap = (v.userId && userMap.get(String(v.userId))) || (v.userEmail && userMap.get(v.userEmail.toLowerCase())) || {};
      const resolvedName = (v.userName && v.userName.toLowerCase() !== "user" && v.userName.toLowerCase() !== "guest visitor")
        ? v.userName
        : (uFromMap.name || v.userName || "");
      const resolvedPhone = v.userPhone || uFromMap.phone || "";
      const resolvedEmail = v.userEmail || uFromMap.email || "";
      const resolvedRole = v.userRole || uFromMap.role || "";

      return {
        ...v,
        userName: resolvedName || (v.isIdentified ? "User" : `Guest ${v.visitorId.substring(0, 10)}`),
        userPhone: resolvedPhone,
        userEmail: resolvedEmail,
        userRole: resolvedRole,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        visitors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    console.error("Guests list error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch guests list" }, { status: 500 });
  }
}
