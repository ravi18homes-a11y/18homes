import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import TrackingEvent from "@/models/TrackingEvent";
import Visitor from "@/models/Visitor";

function getHumanReadableDescription(event) {
  const type = event.eventType;
  const prop = event.propertyDetails || {};
  const search = event.searchDetails || {};
  const meta = event.metadata || {};
  const source = event.source || {};

  switch (type) {
    case "session_start": {
      const channel = source.channel || "Direct";
      const campaign = source.utm_campaign ? ` (${source.utm_campaign})` : "";
      return `Started a new visit via ${channel}${campaign}`;
    }
    case "page_view": {
      const path = source.path || "/";
      const title = meta.title ? ` "${meta.title}"` : "";
      return `Viewed page${title} (${path})`;
    }
    case "property_view": {
      const title = prop.title || "Property Listing";
      const loc = prop.location ? ` in ${prop.location}` : "";
      const price = prop.priceText ? ` (${prop.priceText})` : "";
      return `Viewed property: ${title}${loc}${price}`;
    }
    case "property_image_view": {
      const title = prop.title || "property";
      return `Examined photos for: ${title}`;
    }
    case "property_save": {
      return `Saved property to wishlist: ${prop.title || "Property"}`;
    }
    case "property_unsave": {
      return `Removed property from wishlist: ${prop.title || "Property"}`;
    }
    case "property_share": {
      return `Shared property: ${prop.title || "Property"}`;
    }
    case "property_location_view": {
      return `Viewed property location map: ${prop.title || "Property"}`;
    }
    case "property_search": {
      const q = search.query ? `"${search.query}"` : "all properties";
      return `Searched for ${q}`;
    }
    case "filter_applied": {
      const name = meta.filterName || "filter";
      const val = meta.value || "";
      return `Applied search filter: ${name} = ${val}`;
    }
    case "sort_applied": {
      return `Sorted properties by: ${meta.sortBy || "relevance"}`;
    }
    case "whatsapp_click": {
      const target = prop.title ? `for ${prop.title}` : "via quick button";
      return `Clicked WhatsApp to chat ${target}`;
    }
    case "call_click": {
      const target = prop.title ? `for ${prop.title}` : "via quick call button";
      return `Clicked Call button ${target}`;
    }
    case "lead_form_start": {
      return `Started filling out the inquiry form`;
    }
    case "lead_submit": {
      const target = prop.title ? `for ${prop.title}` : "";
      return `Submitted an inquiry ${target}`;
    }
    case "schedule_visit": {
      return `Requested a site visit schedule for ${prop.title || "Property"}`;
    }
    case "signup": {
      return `Created a new 18Homes account`;
    }
    case "login": {
      return `Logged into 18Homes`;
    }
    case "logout": {
      return `Logged out`;
    }
    default:
      return `Performed action: ${type}`;
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const visitorId = searchParams.get("visitorId");
    const eventType = searchParams.get("eventType");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25", 10)));

    const query = {};

    if (userId && visitorId) {
      query.$or = [{ userId }, { visitorId }];
    } else if (userId) {
      // Also find any visitorIds associated with this user to include their guest history
      const matchingVisitors = await Visitor.find({ userId }).select({ visitorId: 1 }).lean();
      const vIds = matchingVisitors.map((v) => v.visitorId);
      if (vIds.length > 0) {
        query.$or = [{ userId }, { visitorId: { $in: vIds } }];
      } else {
        query.userId = userId;
      }
    } else if (visitorId) {
      query.visitorId = visitorId;
    }

    if (eventType && eventType !== "all") {
      query.eventType = eventType;
    }

    const [events, total] = await Promise.all([
      TrackingEvent.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TrackingEvent.countDocuments(query),
    ]);

    const formattedEvents = events.map((e) => ({
      ...e,
      id: e.eventId,
      description: getHumanReadableDescription(e),
    }));

    return NextResponse.json({
      success: true,
      data: {
        events: formattedEvents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    console.error("Timeline error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch timeline" }, { status: 500 });
  }
}
