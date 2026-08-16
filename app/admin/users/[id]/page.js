"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Edit3,
  Ban,
  ShieldCheck,
  Building2,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Shield,
  Loader2,
  ExternalLink,
  Home,
  Crown
} from "lucide-react";

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  // Resolved Saved Properties & Listed Properties
  const [savedPropertiesList, setSavedPropertiesList] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [userListedProperties, setUserListedProperties] = useState([]);
  const [loadingListed, setLoadingListed] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const API =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    "/api/users";

  const fetchUser = () => {
    setLoading(true);
    fetch(`${API}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setUser(res?.data || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load user:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  /* ================= FETCH & RESOLVE SAVED PROPERTIES ================= */
  useEffect(() => {
    if (!user) return;

    const rawSaved = user.savedProperties || user.wishlist || user.saved || [];
    if (!Array.isArray(rawSaved) || rawSaved.length === 0) {
      setSavedPropertiesList([]);
      return;
    }

    setLoadingSaved(true);
    const propBaseUrl =
      (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
      "/api/properties";

    Promise.all(
      rawSaved.map(async (item) => {
        // Check if item is already a populated object with a title
        if (typeof item === "object" && item !== null && item.title) {
          return item;
        }

        // If item is a string ID or unpopulated object
        const propId = typeof item === "string" ? item : item?._id || item?.id;
        if (!propId) return null;

        try {
          const res = await fetch(`${propBaseUrl}/${propId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json?.success && json?.data) {
            return json.data;
          }
          return typeof item === "object"
            ? item
            : { _id: propId, title: `Property (${propId})` };
        } catch (e) {
          console.error("Error fetching property detail:", e);
          return typeof item === "object"
            ? item
            : { _id: propId, title: `Property (${propId})` };
        }
      })
    )
      .then((results) => {
        setSavedPropertiesList(results.filter(Boolean));
      })
      .catch((err) => {
        console.error("Error resolving saved properties:", err);
      })
      .finally(() => {
        setLoadingSaved(false);
      });
  }, [user, token]);

  /* ================= FETCH USER'S LISTED PROPERTIES ================= */
  useEffect(() => {
    if (!user || !token) return;

    const rawPosted =
      user.properties ||
      user.postedProperties ||
      user.listings ||
      user.myProperties ||
      [];

    const propAdminUrl =
      (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
      "/api/properties/admin/all";

    setLoadingListed(true);

    const userStrId = String(user._id || user.id || "");
    const userEmail = String(user.email || "").toLowerCase().trim();
    const userPhone = String(user.phone || "").replace(/\D/g, "");

    fetch(`${propAdminUrl}?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        let allProps = [];
        if (json?.success && Array.isArray(json?.data?.properties)) {
          allProps = json.data.properties;
        } else if (Array.isArray(json?.data)) {
          allProps = json.data;
        } else if (Array.isArray(json)) {
          allProps = json;
        }

        // Merge rawPosted items from user document if present
        if (Array.isArray(rawPosted) && rawPosted.length > 0) {
          rawPosted.forEach((rp) => {
            if (typeof rp === "object" && rp !== null && (rp._id || rp.id)) {
              const rpId = String(rp._id || rp.id);
              if (!allProps.some((p) => String(p._id || p.id) === rpId)) {
                allProps.push(rp);
              }
            }
          });
        }

        // Robust matching across user ID, email, and phone
        const matched = allProps.filter((p) => {
          if (!p) return false;

          // 1. User ID check
          const pUserId = String(
            p.user?._id || p.user || p.userId || p.owner?._id || p.owner || p.postedBy || ""
          );
          if (userStrId && pUserId && pUserId === userStrId) return true;

          // 2. Email check
          const pEmail = String(
            p.user?.email || p.email || p.contactEmail || p.owner?.email || ""
          )
            .toLowerCase()
            .trim();
          if (userEmail && pEmail && pEmail === userEmail) return true;

          // 3. Phone check
          const pPhone = String(
            p.user?.phone || p.phone || p.contactPhone || p.mobile || ""
          ).replace(/\D/g, "");
          if (
            userPhone &&
            pPhone &&
            userPhone.length >= 6 &&
            (pPhone === userPhone || pPhone.includes(userPhone))
          ) {
            return true;
          }

          return false;
        });

        setUserListedProperties(matched);
      })
      .catch((err) => {
        console.error("Error fetching user listed properties:", err);
      })
      .finally(() => {
        setLoadingListed(false);
      });
  }, [user, token]);

  /* ================= TOGGLE BLOCK ================= */
  const handleToggleBlock = async () => {
    if (!user || !token) return;
    const isBlocked = user.isBlocked;
    const actionText = isBlocked ? "unblock" : "block";
    const ok = confirm(`Are you sure you want to ${actionText} user "${user.name || "User"}"?`);
    if (!ok) return;

    setBlocking(true);
    try {
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });

      const json = await res.json();
      if (res.ok || json?.success) {
        toast.success(`User ${isBlocked ? "unblocked" : "blocked"} successfully!`);
        fetchUser();
      } else {
        toast.error(json?.message || `Failed to ${actionText} user`);
      }
    } catch (err) {
      toast.error(`Failed to ${actionText} user`);
    } finally {
      setBlocking(false);
    }
  };

  const formatPrice = (p) => {
    if (!p) return "—";
    if (p.priceText) {
      return p.priceText.includes("₹") ? p.priceText : `₹ ${p.priceText}`;
    }
    const val = p.priceValue || p.price;
    if (!val) return "—";
    const num = Number(val);
    if (isNaN(num)) return `₹ ${val}`;
    if (num >= 10000000) return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹ ${(num / 100000).toFixed(2)} Lac`;
    return `₹ ${num.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#8c4bdc] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-semibold text-sm">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center max-w-md space-y-4">
          <p className="text-lg font-bold text-slate-800">User Not Found</p>
          <p className="text-xs text-slate-500">The user record you requested does not exist or was deleted.</p>
          <button
            onClick={() => router.push("/admin/users")}
            className="px-5 py-2.5 bg-[#8c4bdc] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
          >
            Back to Users List
          </button>
        </div>
      </div>
    );
  }

  const isBlocked = user?.isBlocked;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 min-h-screen bg-slate-50/50">
      
      {/* ================= HEADER BAR ================= */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/admin/users")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Users</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleBlock}
            disabled={blocking}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 ${
              isBlocked
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
            }`}
          >
            {isBlocked ? <ShieldCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            <span>{isBlocked ? "Unblock Account" : "Block Account"}</span>
          </button>

          <button
            onClick={() => router.push(`/admin/users/${id}/edit`)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#8c4bdc] hover:bg-[#7b3ec5] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ================= USER OVERVIEW CARD ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <div className="relative shrink-0">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=8c4bdc&color=fff`}
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-md"
          />
          <span
            className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
              isBlocked ? "bg-rose-500" : "bg-emerald-500"
            }`}
          />
        </div>

        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-3">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900">{user?.name || "N/A"}</h1>
                <span
                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    user?.role === "admin"
                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                      : user?.role === "builder"
                      ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      : user?.role === "dealer"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}
                >
                  {user?.role || "user"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phone || "No Mobile"}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-xl ${
                  isBlocked ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {isBlocked ? "Account Blocked" : "Active Account"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl">
              <p className="text-slate-400 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Verification Status
              </p>
              <p className="font-bold text-slate-800 uppercase mt-0.5">{user?.approvalStatus || "Approved"}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl">
              <p className="text-slate-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Last Login
              </p>
              <p className="font-bold text-slate-800 mt-0.5">
                {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl">
              <p className="text-slate-400 font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Member Since
              </p>
              <p className="font-bold text-slate-800 mt-0.5">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MEMBERSHIP PLAN DETAILS ================= */}
      {user?.subscription && (
        <Section title="Current Active Membership Plan" icon={<Crown className="w-5 h-5 text-[#8c4bdc]" />}>
          <Grid>
            <Field label="Plan Name" value={user.subscription.planName} />
            <Field label="Plan Source" value={user.subscription.assignedByAdmin ? "🛡️ Admin Granted" : "💳 User Purchased (Self)"} />
            <Field label="Billing Amount" value={user.subscription.amount > 0 ? `₹${user.subscription.amount.toLocaleString("en-IN")}` : "Free"} />
            <Field label="Invoice Number" value={user.subscription.invoiceNumber || "—"} />
            <Field label="Start Date" value={user.subscription.startDate ? new Date(user.subscription.startDate).toLocaleDateString("en-IN") : "—"} />
            <Field label="Expiry Date" value={user.subscription.expiryDate ? new Date(user.subscription.expiryDate).toLocaleDateString("en-IN") : "—"} />
          </Grid>
        </Section>
      )}

      {/* ================= BUILDER / DEALER DETAILS ================= */}
      {user?.role === "builder" && user?.builderDetails && (
        <Section title="Builder Details & Verification Documents" icon={<Building2 className="w-5 h-5 text-indigo-600" />}>
          <Grid>
            <Field label="Firm Name" value={user.builderDetails.firmName} />
            <Field label="RERA Number" value={user.builderDetails.reraNumber} />
            <Field label="GST Number" value={user.builderDetails.gstNumber} />
            <Field label="PAN Number" value={user.builderDetails.panNumber} />
            <Field label="Aadhaar Number" value={user.builderDetails.aadhaarNumber} />
            <Field label="Office Address" value={user.builderDetails.officeAddress} />
            <Field label="Completed Projects" value={user.builderDetails.completedProjectsCount} />
          </Grid>
        </Section>
      )}

      {user?.role === "dealer" && user?.dealerDetails && (
        <Section title="Dealer Agency Details" icon={<Briefcase className="w-5 h-5 text-amber-600" />}>
          <Grid>
            <Field label="Agency Name" value={user.dealerDetails.agencyName} />
            <Field label="License Number" value={user.dealerDetails.licenseNumber} />
            <Field label="GST Number" value={user.dealerDetails.gstNumber} />
            <Field label="PAN Card" value={user.dealerDetails.panNumber} />
            <Field label="Aadhaar" value={user.dealerDetails.aadhaarNumber} />
            <Field label="Operating Areas" value={user.dealerDetails.operatingAreas} />
            <Field label="Experience (Years)" value={user.dealerDetails.experienceYears} />
          </Grid>
        </Section>
      )}

      {/* ================= ADDRESS ================= */}
      <Section title="Address Information" icon={<MapPin className="w-5 h-5 text-[#8c4bdc]" />}>
        <Grid>
          <Field label="House / Flat No" value={user?.address?.houseNo} />
          <Field label="Street" value={user?.address?.street} />
          <Field label="Locality" value={user?.address?.locality} />
          <Field label="City" value={user?.address?.city} />
          <Field label="District" value={user?.address?.district} />
          <Field label="State" value={user?.address?.state} />
          <Field label="Pincode" value={user?.address?.pincode} />
          <Field label="Country" value={user?.address?.country || "India"} />
        </Grid>
      </Section>

      {/* ================= SAVED / FAVORITE PROPERTIES ================= */}
      <Section title="Saved / Favorite Properties" icon={<Heart className="w-5 h-5 text-rose-500" />}>
        {loadingSaved ? (
          <div className="p-8 text-center text-slate-500 font-medium flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-[#8c4bdc] animate-spin" />
            <span>Loading saved properties details...</span>
          </div>
        ) : savedPropertiesList.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Property Title</th>
                  <th className="p-3.5">Location / City</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {savedPropertiesList.map((p, i) => {
                  const propId = p?._id || p?.id || (typeof p === "string" ? p : null);
                  const title = p?.title || `Property ID: ${propId}`;
                  const city =
                    typeof p?.address === "object" && p?.address !== null
                      ? `${p.address.locality ? p.address.locality + ", " : ""}${p.address.city || ""}`
                      : p?.address || p?.location || p?.city || "—";

                  return (
                    <tr key={propId || i} className="hover:bg-slate-50/50">
                      <td className="p-3.5 text-xs text-slate-400 font-bold">{i + 1}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {p?.images?.[0] || p?.image ? (
                            <img
                              src={p.images?.[0] || p.image}
                              alt={title}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8c4bdc] flex items-center justify-center shrink-0">
                              <Home className="w-5 h-5" />
                            </div>
                          )}
                          <span className="font-bold text-slate-900 text-sm line-clamp-1">{title}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600 text-xs">{city}</td>
                      <td className="p-3.5 font-bold text-slate-900 text-sm">{formatPrice(p)}</td>
                      <td className="p-3.5 text-right">
                        {propId && (
                          <button
                            onClick={() => router.push(`/admin/properties/${propId}`)}
                            className="px-3 py-1.5 bg-[#8c4bdc] hover:bg-[#7b3ec5] text-white text-xs font-bold rounded-xl shadow transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Property</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium italic">No saved properties found for this user.</p>
        )}
      </Section>

      {/* ================= USER'S LISTED PROPERTIES ================= */}
      <Section title="User's Posted Property Listings" icon={<Home className="w-5 h-5 text-indigo-600" />}>
        {loadingListed ? (
          <div className="p-8 text-center text-slate-500 font-medium flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            <span>Loading listed properties...</span>
          </div>
        ) : userListedProperties.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Property Title</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Price</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userListedProperties.map((p, i) => (
                  <tr key={p._id || p.id || i} className="hover:bg-slate-50/50">
                    <td className="p-3.5 text-xs text-slate-400 font-bold">{i + 1}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        {p?.images?.[0] || p?.image ? (
                          <img
                            src={p.images?.[0] || p.image}
                            alt={p.title}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Home className="w-5 h-5" />
                          </div>
                        )}
                        <span className="font-bold text-slate-900 text-sm line-clamp-1">{p.title || "—"}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 text-xs">
                      {typeof p.address === "object" && p.address !== null
                        ? `${p.address.locality ? p.address.locality + ", " : ""}${p.address.city || ""}`
                        : p.address || p.location || "—"}
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${p.isSold ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {p.isSold ? "Sold Out" : "Active"}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 text-sm">{formatPrice(p)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => router.push(`/admin/properties/${p._id || p.id}`)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage Property</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 font-medium italic">No posted property listings found for this user.</p>
        )}
      </Section>

    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        {icon}
        <h2 className="font-extrabold text-slate-900 text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">{children}</div>
  );
}

function Field({ label, value }) {
  return (
    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="font-bold text-slate-800 text-sm mt-0.5">{value || "—"}</p>
    </div>
  );
}
