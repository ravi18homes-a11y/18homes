import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Visitor from "@/models/Visitor";
import Session from "@/models/Session";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { visitorId, sessionId, currentPath } = body;

    if (!visitorId || !sessionId) {
      return NextResponse.json({ success: false, error: "Missing ids" }, { status: 400 });
    }

    const now = new Date();

    // Fast updates for live presence tracking
    await Promise.all([
      Visitor.updateOne(
        { visitorId },
        { $set: { lastHeartbeat: now, lastSeenAt: now } }
      ),
      Session.updateOne(
        { sessionId },
        { $set: { lastActivityAt: now, exitPage: currentPath || "/" } }
      ),
    ]);

    return NextResponse.json({ success: true, timestamp: now.toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
