import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TrackingEvent, { ALLOWED_EVENT_TYPES } from "@/models/TrackingEvent";
import Visitor from "@/models/Visitor";
import Session from "@/models/Session";
import Analytics from "@/models/Analytics";

// Score weightings for behavioral interest signals
const EVENT_SCORES = {
  property_view: 1,
  property_image_view: 1,
  property_save: 5,
  whatsapp_click: 8,
  call_click: 8,
  lead_submit: 10,
  schedule_visit: 15,
};

function calculateEngagementLevel(score) {
  if (score >= 40) return "Very High";
  if (score >= 20) return "High";
  if (score >= 8) return "Medium";
  return "Low";
}

export async function POST(req) {
  try {
    await dbConnect();

    // Check payload size
    const rawBody = await req.text();
    if (rawBody.length > 50000) {
      return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
    }

    const body = JSON.parse(rawBody);
    const {
      eventId,
      eventType,
      visitorId,
      sessionId,
      userId,
      propertyId,
      propertyDetails = {},
      searchDetails = {},
      metadata = {},
      source = {},
      device = "Desktop",
      browser = "Unknown",
      os = "Unknown",
      createdAt,
    } = body;

    // Validation
    if (!eventId || !eventType || !visitorId || !sessionId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (eventId, eventType, visitorId, sessionId)" },
        { status: 400 }
      );
    }

    if (!ALLOWED_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { success: false, error: `Invalid eventType: ${eventType}` },
        { status: 400 }
      );
    }

    // 1. Idempotency Check
    const existingEvent = await TrackingEvent.findOne({ eventId }).lean();
    if (existingEvent) {
      return NextResponse.json({ success: true, message: "Event already recorded", eventId });
    }

    const eventDate = createdAt ? new Date(createdAt) : new Date();

    // 2. Find or Upsert Session
    let session = await Session.findOne({ sessionId });
    const isNewSession = !session;

    if (isNewSession) {
      session = await Session.create({
        sessionId,
        visitorId,
        userId: userId || null,
        startedAt: eventDate,
        lastActivityAt: eventDate,
        landingPage: source.path || "/",
        exitPage: source.path || "/",
        pageViews: eventType === "page_view" ? 1 : 0,
        eventCount: 1,
        device,
        browser,
        os,
        source: {
          utm_source: source.utm_source || "",
          utm_medium: source.utm_medium || "",
          utm_campaign: source.utm_campaign || "",
          utm_term: source.utm_term || "",
          utm_content: source.utm_content || "",
          referrer: source.referrer || "",
          channel: source.channel || "Direct",
        },
      });
    } else {
      const durationSec = Math.max(0, Math.round((eventDate.getTime() - new Date(session.startedAt).getTime()) / 1000));
      await Session.updateOne(
        { sessionId },
        {
          $set: {
            lastActivityAt: eventDate,
            exitPage: source.path || session.exitPage,
            durationSec,
            ...(userId && !session.userId ? { userId } : {}),
          },
          $inc: {
            eventCount: 1,
            ...(eventType === "page_view" ? { pageViews: 1 } : {}),
          },
        }
      );
    }

    // 3. Find or Upsert Visitor & Calculate Interest Signals
    let visitor = await Visitor.findOne({ visitorId });
    const isNewVisitor = !visitor;

    const sourceObj = {
      utm_source: source.utm_source || "",
      utm_medium: source.utm_medium || "",
      utm_campaign: source.utm_campaign || "",
      utm_term: source.utm_term || "",
      utm_content: source.utm_content || "",
      referrer: source.referrer || "",
      landingPage: source.path || "/",
    };

    if (isNewVisitor) {
      visitor = await Visitor.create({
        visitorId,
        userId: userId || null,
        firstSeenAt: eventDate,
        lastSeenAt: eventDate,
        lastHeartbeat: eventDate,
        totalSessions: 1,
        totalPageViews: eventType === "page_view" ? 1 : 0,
        totalEvents: 1,
        firstTouchSource: sourceObj,
        latestSource: sourceObj,
        device,
        browser,
        os,
        interestSignals: {
          score: EVENT_SCORES[eventType] || 0,
          engagementLevel: calculateEngagementLevel(EVENT_SCORES[eventType] || 0),
          viewedPropertiesCount: eventType === "property_view" ? 1 : 0,
          savedPropertiesCount: eventType === "property_save" ? 1 : 0,
          whatsappClicksCount: eventType === "whatsapp_click" ? 1 : 0,
          callClicksCount: eventType === "call_click" ? 1 : 0,
          leadsCount: eventType === "lead_submit" ? 1 : 0,
          searchesCount: eventType === "property_search" ? 1 : 0,
          preferredLocations: propertyDetails.location ? [{ location: propertyDetails.location, count: 1 }] : [],
          preferredPropertyTypes: propertyDetails.propertyType ? [{ type: propertyDetails.propertyType, count: 1 }] : [],
          preferredBhk: propertyDetails.bhk ? [{ bhk: propertyDetails.bhk, count: 1 }] : [],
        },
      });
    } else {
      // Existing visitor: update activity, counters, interest score, dimensions
      const addedScore = EVENT_SCORES[eventType] || 0;
      const currentSignals = visitor.interestSignals || {};
      const newScore = (currentSignals.score || 0) + addedScore;
      const newLevel = calculateEngagementLevel(newScore);

      const updates = {
        lastSeenAt: eventDate,
        lastHeartbeat: eventDate,
        latestSource: sourceObj,
        ...(userId && !visitor.userId ? { userId, isIdentified: true } : {}),
      };

      const incObj = {
        totalEvents: 1,
        ...(eventType === "page_view" ? { totalPageViews: 1 } : {}),
        ...(isNewSession ? { totalSessions: 1 } : {}),
        "interestSignals.score": addedScore,
        ...(eventType === "property_view" ? { "interestSignals.viewedPropertiesCount": 1 } : {}),
        ...(eventType === "property_save" ? { "interestSignals.savedPropertiesCount": 1 } : {}),
        ...(eventType === "whatsapp_click" ? { "interestSignals.whatsappClicksCount": 1 } : {}),
        ...(eventType === "call_click" ? { "interestSignals.callClicksCount": 1 } : {}),
        ...(eventType === "lead_submit" ? { "interestSignals.leadsCount": 1 } : {}),
        ...(eventType === "property_search" ? { "interestSignals.searchesCount": 1 } : {}),
      };

      updates["interestSignals.engagementLevel"] = newLevel;

      // Update location preferences if property event
      if (propertyDetails.location) {
        const loc = propertyDetails.location;
        const locIdx = (currentSignals.preferredLocations || []).findIndex((l) => l.location === loc);
        if (locIdx >= 0) {
          incObj[`interestSignals.preferredLocations.${locIdx}.count`] = 1;
        } else {
          await Visitor.updateOne(
            { visitorId },
            { $push: { "interestSignals.preferredLocations": { location: loc, count: 1 } } }
          );
        }
      }

      // Update property type preferences
      if (propertyDetails.propertyType) {
        const pType = propertyDetails.propertyType;
        const typeIdx = (currentSignals.preferredPropertyTypes || []).findIndex((t) => t.type === pType);
        if (typeIdx >= 0) {
          incObj[`interestSignals.preferredPropertyTypes.${typeIdx}.count`] = 1;
        } else {
          await Visitor.updateOne(
            { visitorId },
            { $push: { "interestSignals.preferredPropertyTypes": { type: pType, count: 1 } } }
          );
        }
      }

      // Update BHK preferences
      if (propertyDetails.bhk) {
        const bhk = propertyDetails.bhk;
        const bhkIdx = (currentSignals.preferredBhk || []).findIndex((b) => b.bhk === bhk);
        if (bhkIdx >= 0) {
          incObj[`interestSignals.preferredBhk.${bhkIdx}.count`] = 1;
        } else {
          await Visitor.updateOne(
            { visitorId },
            { $push: { "interestSignals.preferredBhk": { bhk: bhk, count: 1 } } }
          );
        }
      }

      await Visitor.updateOne({ visitorId }, { $set: updates, $inc: incObj });
    }

    // 4. Save Event Record
    const newEvent = await TrackingEvent.create({
      eventId,
      eventType,
      visitorId,
      userId: userId || null,
      sessionId,
      propertyId: propertyId || null,
      propertyDetails,
      searchDetails,
      metadata,
      source,
      device,
      createdAt: eventDate,
    });

    // 5. Backward compatibility with existing builder Analytics collection
    if (propertyId) {
      try {
        await Analytics.create({
          eventType,
          propertyId,
          propertyTitle: propertyDetails.title || "Property Listing",
          builderId: propertyDetails.ownerId || "builder",
          city: propertyDetails.location || "Ghaziabad",
          userName: visitor?.userName || "Guest Visitor",
          userEmail: visitor?.userEmail || "visitor@18homes.in",
          userPhone: visitor?.userPhone || "",
          visitorId,
          timestamp: eventDate,
        });
      } catch (legacyErr) {
        // Non-blocking for backward compatibility
      }
    }

    return NextResponse.json({ success: true, eventId, isNewVisitor, isNewSession });
  } catch (error) {
    console.error("Error in tracking event ingestion:", error);
    return NextResponse.json({ success: false, error: "Internal tracking error" }, { status: 500 });
  }
}
