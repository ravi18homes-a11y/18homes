import mongoose from "mongoose";

export const ALLOWED_EVENT_TYPES = [
  "session_start",
  "page_view",
  "property_view",
  "property_image_view",
  "property_save",
  "property_unsave",
  "property_share",
  "property_location_view",
  "property_contact",
  "property_search",
  "filter_applied",
  "sort_applied",
  "whatsapp_click",
  "call_click",
  "lead_form_start",
  "lead_submit",
  "schedule_visit",
  "signup",
  "login",
  "logout",
];

const TrackingEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ALLOWED_EVENT_TYPES,
      index: true,
    },
    visitorId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    propertyId: {
      type: String,
      default: null,
      index: true,
    },
    propertyDetails: {
      title: { type: String, default: "" },
      propertyType: { type: String, default: "" },
      location: { type: String, default: "" },
      price: { type: Number, default: 0 },
      priceText: { type: String, default: "" },
      bhk: { type: String, default: "" },
      ownerId: { type: String, default: "" },
    },
    searchDetails: {
      query: { type: String, default: "" },
      filters: { type: mongoose.Schema.Types.Mixed, default: {} },
      sortBy: { type: String, default: "" },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    source: {
      path: { type: String, default: "/" },
      referrer: { type: String, default: "" },
      utm_source: { type: String, default: "" },
      utm_medium: { type: String, default: "" },
      utm_campaign: { type: String, default: "" },
      utm_term: { type: String, default: "" },
      utm_content: { type: String, default: "" },
    },
    device: {
      type: String,
      default: "Desktop",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// High-performance compound indexes for common query patterns
TrackingEventSchema.index({ visitorId: 1, createdAt: -1 });
TrackingEventSchema.index({ userId: 1, createdAt: -1 });
TrackingEventSchema.index({ sessionId: 1, createdAt: -1 });
TrackingEventSchema.index({ eventType: 1, createdAt: -1 });
TrackingEventSchema.index({ propertyId: 1, createdAt: -1 });
TrackingEventSchema.index({ "source.utm_campaign": 1, createdAt: -1 });

export default mongoose.models.TrackingEvent ||
  mongoose.model("TrackingEvent", TrackingEventSchema);
