import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const {
      eventType,
      propertyId,
      propertyTitle,
      builderId,
      city,
      flatUnit,
      userName,
      userEmail,
      userPhone,
      durationSec,
      timestamp,
    } = body;

    if (!eventType || !propertyId) {
      return NextResponse.json(
        { success: false, error: "eventType and propertyId are required" },
        { status: 400 }
      );
    }

    const eventRecord = await Analytics.create({
      eventType,
      propertyId,
      propertyTitle: propertyTitle || "Property Listing",
      builderId: builderId || "builder",
      city: city || "Ghaziabad",
      flatUnit: flatUnit || "A-302",
      userName: userName || "Guest Visitor",
      userEmail: userEmail || "visitor@18homes.in",
      userPhone: userPhone || "+91 98765 43210",
      durationSec: durationSec || 0,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    return NextResponse.json({ success: true, data: eventRecord });
  } catch (error) {
    console.error("Error saving analytics event to database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record analytics event" },
      { status: 500 }
    );
  }
}
