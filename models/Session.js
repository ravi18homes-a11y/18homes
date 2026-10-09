import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
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
    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    durationSec: {
      type: Number,
      default: 0,
    },
    landingPage: {
      type: String,
      default: "/",
    },
    exitPage: {
      type: String,
      default: "/",
    },
    pageViews: {
      type: Number,
      default: 0,
    },
    eventCount: {
      type: Number,
      default: 0,
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
    source: {
      utm_source: { type: String, default: "" },
      utm_medium: { type: String, default: "" },
      utm_campaign: { type: String, default: "" },
      utm_term: { type: String, default: "" },
      utm_content: { type: String, default: "" },
      referrer: { type: String, default: "" },
      channel: { type: String, default: "Direct" },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

SessionSchema.index({ visitorId: 1, startedAt: -1 });
SessionSchema.index({ userId: 1, startedAt: -1 });
SessionSchema.index({ "source.channel": 1, startedAt: -1 });
SessionSchema.index({ "source.utm_campaign": 1, startedAt: -1 });

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
