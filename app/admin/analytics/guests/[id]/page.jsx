"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  Clock,
  MapPin,
  Sparkles,
  Activity,
  Layers,
  PhoneCall,
  Phone,
  Mail,
  Eye,
  ExternalLink,
  MessageSquare,
  Search,
  CheckCircle2,
  Calendar,
  Laptop,
} from "lucide-react";
import Link from "next/link";

export default function GuestDetailPage() {
  const { id: visitorId } = useParams();
  const router = useRouter();

  const [guestData, setGuestData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelinePage, setTimelinePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visitorId) return;

    setLoading(true);
    // Fetch guest interest signals & profile
    fetch(`/api/tracking/admin/interests?visitorId=${visitorId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setGuestData(json.data);
        }
      })
      .catch((err) => console.error("Guest fetch error:", err));

    // Fetch guest timeline
    fetch(`/api/tracking/admin/timeline?visitorId=${visitorId}&page=${timelinePage}&limit=20`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setTimeline(json.data.events || []);
          setTotalPages(json.data.pagination?.totalPages || 1);
        }
      })
      .catch((err) => console.error("Timeline error:", err))
      .finally(() => setLoading(false));
  }, [visitorId, timelinePage]);

  const signals = guestData?.interestSignals || {};
  const isIdentified = guestData?.isIdentified || !!guestData?.userId;
  const displayName = guestData?.userName && guestData.userName.toLowerCase() !== "user"
    ? guestData.userName
    : (isIdentified ? "Identified User" : `Guest ${visitorId}`);

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-slate-50/60 min-h-screen">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analytics</span>
        </button>
      </div>

      {/* Guest Hero Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 ${
            isIdentified
              ? guestData?.userRole === "admin"
                ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300"
                : "bg-purple-100 text-purple-700 ring-2 ring-purple-300"
              : "bg-slate-100 text-slate-500"
          }`}>
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {displayName}
              </h1>

              {guestData?.userRole ? (
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                  guestData.userRole === "admin"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : guestData.userRole === "builder"
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : guestData.userRole === "dealer"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-purple-100 text-purple-800 border border-purple-200"
                }`}>
                  {guestData.userRole}
                </span>
              ) : isIdentified ? (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Registered User
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Anonymous Guest
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                ID: {visitorId}
              </span>

              {guestData?.userPhone && (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${guestData.userPhone}`}
                    className="font-bold text-purple-700 hover:underline flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-md"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{guestData.userPhone}</span>
                  </a>
                  <a
                    href={`https://wa.me/${guestData.userPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1"
                  >
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}

              {guestData?.userEmail && (
                <a
                  href={`mailto:${guestData.userEmail}`}
                  className="text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md"
                >
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{guestData.userEmail}</span>
                </a>
              )}
            </div>

            <p className="text-[11px] text-slate-400 pt-1">
              First seen: {guestData?.firstSeenAt ? new Date(guestData.firstSeenAt).toLocaleString() : "Recently"} · Last seen: {guestData?.lastSeenAt ? new Date(guestData.lastSeenAt).toLocaleString() : "Recently"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center min-w-[120px]">
            <p className="text-[10px] text-purple-600 font-black uppercase tracking-wider">Interest Score</p>
            <p className="text-3xl font-black text-[#8c4bdc]">{signals.score || 0}</p>
            <p className="text-[11px] text-purple-700 font-extrabold mt-0.5">{signals.engagementLevel || "Low"} Intent</p>
          </div>
        </div>
      </div>

      {/* Interest Signals & Behavioral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Behavioral Preferences</span>
          </h3>
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Preferred Locations</span>
              <span className="font-bold text-slate-800 text-right">
                {signals.preferredLocations?.map((l) => l.location).join(", ") || "None recorded"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Preferred Type</span>
              <span className="font-bold text-slate-800 capitalize text-right">
                {signals.preferredPropertyTypes?.map((t) => t.type).join(", ") || "None recorded"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Preferred BHK</span>
              <span className="font-bold text-slate-800 text-right">
                {signals.preferredBhk?.map((b) => b.bhk).join(", ") || "Not determined"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Activity Breakdown</span>
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-semibold">Total Visits</span>
              <span className="text-base font-black text-slate-800">{guestData?.totalSessions || 1}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-semibold">Pageviews</span>
              <span className="text-base font-black text-slate-800">{guestData?.totalPageViews || 0}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-semibold">Properties Viewed</span>
              <span className="text-base font-black text-purple-700">{signals.viewedPropertiesCount || 0}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-400 block font-semibold">Inquiries & Clicks</span>
              <span className="text-base font-black text-emerald-700">
                {(signals.whatsappClicksCount || 0) + (signals.callClicksCount || 0) + (signals.leadsCount || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Acquisition & Device</span>
          </h3>
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">First Touch</span>
              <span className="font-bold text-slate-800">
                {guestData?.firstTouchSource?.channel || guestData?.firstTouchSource?.utm_source || "Direct"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Campaign</span>
              <span className="font-bold text-purple-600">
                {guestData?.latestSource?.utm_campaign || "None"}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Device & OS</span>
              <span className="font-medium text-slate-700">
                {guestData?.device || "Desktop"} · {guestData?.browser || "Browser"} ({guestData?.os || "OS"})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Viewed Properties Section (CLICKABLE) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-600" />
            <span>Properties Viewed by this Visitor</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Click any property to inspect listing
          </span>
        </div>

        {guestData?.topViewedProperties && guestData.topViewedProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {guestData.topViewedProperties.map((prop, idx) => (
              <Link
                key={idx}
                href={`/buy/property-details?id=${prop._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 transition flex flex-col justify-between space-y-2 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-extrabold text-slate-900 group-hover:text-[#8c4bdc] transition truncate">
                      {prop.title || `Property #${prop._id}`}
                    </p>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#8c4bdc] shrink-0 opacity-70 group-hover:opacity-100" />
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{prop.location || "Location not specified"}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="font-bold text-slate-700">{prop.priceText || "Price on request"}</span>
                  <span className="font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md text-[10px]">
                    {prop.viewCount} views
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">No specific property view history recorded for this visitor.</p>
        )}
      </div>

      {/* Chronological Activity Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <Clock className="w-4 h-4 text-[#8c4bdc]" />
          <span>Chronological Activity Timeline</span>
        </h3>

        {timeline.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No activity events logged for this visitor.</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((ev, idx) => {
              const propId = ev.propertyId || ev.propertyDetails?._id || ev.propertyDetails?.id;
              return (
                <div key={idx} className="relative flex items-start gap-4">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-[#8c4bdc]" />
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex-1 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{ev.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{new Date(ev.createdAt).toLocaleString()}</span>
                        {ev.source?.path && <span>· Path: {ev.source.path}</span>}
                      </div>
                    </div>

                    {propId && (
                      <Link
                        href={`/buy/property-details?id=${propId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Property</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              disabled={timelinePage <= 1}
              onClick={() => setTimelinePage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              Prev
            </button>
            <span className="text-xs font-bold text-slate-600">
              Page {timelinePage} of {totalPages}
            </span>
            <button
              disabled={timelinePage >= totalPages}
              onClick={() => setTimelinePage((p) => p + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
