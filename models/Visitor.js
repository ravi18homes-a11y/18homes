import mongoose from "mongoose";

const VisitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      default: null,
      index: true,
    },
    userEmail: {
      type: String,
      default: "",
    },
    userName: {
      type: String,
      default: "",
    },
    userPhone: {
      type: String,
      default: "",
    },
    userRole: {
      type: String,
      default: "",
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now,
      index: true,
    },
    totalSessions: {
      type: Number,
      default: 1,
    },
    totalPageViews: {
      type: Number,
      default: 0,
    },
    totalEvents: {
      type: Number,
      default: 0,
    },
    firstTouchSource: {
      utm_source: { type: String, default: "" },
      utm_medium: { type: String, default: "" },
      utm_campaign: { type: String, default: "" },
      utm_term: { type: String, default: "" },
      utm_content: { type: String, default: "" },
      referrer: { type: String, default: "" },
      landingPage: { type: String, default: "" },
    },
    latestSource: {
      utm_source: { type: String, default: "" },
      utm_medium: { type: String, default: "" },
      utm_campaign: { type: String, default: "" },
      utm_term: { type: String, default: "" },
      utm_content: { type: String, default: "" },
      referrer: { type: String, default: "" },
      landingPage: { type: String, default: "" },
    },
    device: {
      type: String,
      default: "Desktop",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    os: {
      type: String,
      default: "Unknown",
    },
    isIdentified: {
      type: Boolean,
      default: false,
      index: true,
    },
    interestSignals: {
      score: { type: Number, default: 0 },
      engagementLevel: {
        type: String,
        enum: ["Low", "Medium", "High", "Very High"],
        default: "Low",
      },
      preferredLocations: [{ location: String, count: Number }],
      preferredPropertyTypes: [{ type: { type: String }, count: Number }],
      preferredBhk: [{ bhk: String, count: Number }],
      approxBudget: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        label: { type: String, default: "Not Determined" },
      },
      viewedPropertiesCount: { type: Number, default: 0 },
      savedPropertiesCount: { type: Number, default: 0 },
      whatsappClicksCount: { type: Number, default: 0 },
      callClicksCount: { type: Number, default: 0 },
      leadsCount: { type: Number, default: 0 },
      searchesCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

VisitorSchema.index({ userId: 1, lastSeenAt: -1 });
VisitorSchema.index({ "interestSignals.score": -1 });

export default mongoose.models.Visitor || mongoose.model("Visitor", VisitorSchema);
