import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import Visitor from "@/models/Visitor";
import Session from "@/models/Session";
import TrackingEvent from "@/models/TrackingEvent";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    let { visitorId, userId, name, email, phone, role } = body;

    if (!visitorId || !userId) {
      return NextResponse.json(
        { success: false, error: "Both visitorId and userId are required" },
        { status: 400 }
      );
    }

    // Try finding user details from database if name/phone is missing or generic
    if (mongoose.connection && mongoose.connection.db) {
      try {
        const { ObjectId } = mongoose.Types;
        let userDoc = null;
        if (ObjectId.isValid(userId)) {
          userDoc = await mongoose.connection.db.collection("users").findOne({ _id: new ObjectId(userId) });
        }
        if (!userDoc && email) {
          userDoc = await mongoose.connection.db.collection("users").findOne({ email });
        }
        if (userDoc) {
          if (!name || name.toLowerCase() === "user" || name.toLowerCase() === "guest visitor") {
            name = userDoc.name || (userDoc.firstName ? `${userDoc.firstName} ${userDoc.lastName || ""}`.trim() : "") || name;
          }
          if (!email) email = userDoc.email || "";
          if (!phone) phone = userDoc.phone || userDoc.contact || userDoc.phoneNumber || "";
          if (!role) role = userDoc.role || "";
        }
      } catch (dbErr) {
        console.warn("User lookup in identify route error:", dbErr);
      }
    }

    // 1. Link Visitor record
    const updateFields = {
      userId,
      isIdentified: true,
      lastSeenAt: new Date(),
    };
    if (name) updateFields.userName = name;
    if (email) updateFields.userEmail = email;
    if (phone) updateFields.userPhone = phone;
    if (role) updateFields.userRole = role;

    await Visitor.updateOne(
      { visitorId },
      { $set: updateFields },
      { upsert: false }
    );

    // 2. Associate existing Sessions with the User
    await Session.updateMany(
      { visitorId, userId: { $in: [null, ""] } },
      { $set: { userId } }
    );

    // 3. Associate historical Events with the User (preserves full anonymous history)
    await TrackingEvent.updateMany(
      { visitorId, userId: { $in: [null, ""] } },
      { $set: { userId } }
    );

    return NextResponse.json({
      success: true,
      message: "Visitor identity linked successfully",
      visitorId,
      userId,
    });
  } catch (error) {
    console.error("Error linking visitor to user:", error);
    return NextResponse.json({ success: false, error: "Failed to identify visitor" }, { status: 500 });
  }
}
