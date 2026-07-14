"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function AdminPropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken")
      : null;

  const API =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    `/api/properties/${id}`;

  /* ================= FETCH PROPERTY ================= */
  useEffect(() => {
    fetch(API, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setProperty(res?.data || null);
        setLoading(false);
      });
  }, [id]);

  const toggleSoldStatus = async () => {
    if (!property) return;
    
    const res = await fetch(
      (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
      `/api/properties/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isSold: !property.isSold,
        }),
      }
    );
    
    const json = await res.json();
    if (json?.success) {
      setProperty(json?.data);
      toast.success(json?.data?.isSold ? "Property marked as sold" : "Property marked as available");
    } else {
      toast.error(json?.message || "Failed to update property status");
    }
  };

  if (loading) return <div className="p-10">Loading property…</div>;
  if (!property) return <div className="p-10">Property not found</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-xl shadow p-6 space-y-3">
        <h1 className="text-2xl font-bold">{property.title}</h1>

        <p className="text-lg font-semibold text-green-700">
          {property.priceText || "—"}
        </p>

        <p className="text-gray-600">
          {property.address?.locality || "—"},{" "}
          {property.address?.city || "—"},{" "}
          {property.address?.state || "—"}
        </p>

        <div className="flex flex-wrap gap-3 text-sm mt-2">
          <Badge label={`Purpose: ${property.purpose}`} />
          <Badge label={`Type: ${property.propertyType}`} />
          <Badge label={`Furnishing: ${property.furnishing}`} />
          <Badge label={`Listed by: ${property.listedBy || "owner"}`} />
          <Badge
            label={property.isSold ? "Sold Out" : "Available"}
            danger={property.isSold}
          />
          <Badge
            label={property.isFlagged ? "Flagged" : "Active"}
            danger={property.isFlagged}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
          >
            ← Back
          </button>
          
          <button
            onClick={toggleSoldStatus}
            className={`mt-4 px-4 py-2 text-white rounded font-semibold ${
              property.isSold
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {property.isSold ? "Make Available" : "Mark Sold"}
          </button>
        </div>
      </div>

      {/* ================= IMAGES ================= */}
      <Section title="Property Images">
        {property.images?.length ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    {property.images.map((file, i) => {
      const isVideo = file?.toLowerCase().includes(".mp4");

      return isVideo ? (
        <video
          key={i}
          src={file}
          controls
          className="h-40 w-full object-cover rounded-lg border"
        />
      ) : (
        <img
          key={i}
          src={file}
          alt="property"
          className="h-40 w-full object-cover rounded-lg border"
        />
      );
    })}
  </div>
) : (
  <p className="text-gray-500">No images uploaded</p>
)}
      </Section>

      {/* ================= DESCRIPTION ================= */}
      <Section title="Description">
        <p className="text-gray-700 leading-relaxed">
          {property.description || "—"}
        </p>
      </Section>

      {/* ================= PROPERTY DETAILS ================= */}
      <Section title="Property Details">
        <Grid>
          <Field label="Purpose" value={property.purpose} />
          <Field label="Type" value={property.propertyType} />
          <Field label="Bedrooms" value={property.bedrooms ?? "—"} />
          <Field
            label="Bathrooms"
            value={
              property.bathrooms === 0
                ? "N/A"
                : property.bathrooms ?? "—"
            }
          />
          <Field
            label="Area"
            value={
              property.area?.size
                ? (/^[0-9\s.,]+$/.test(String(property.area.size).trim())
                  ? `${property.area.size} ${property.area.unit || "sqft"}`
                  : property.area.size)
                : "—"
            }
          />
          <Field label="User Views" value={property.views} />
          <Field label="Admin Views" value={property.adminViews} />
          <Field
            label="Created At"
            value={formatDate(property.createdAt)}
          />
          <Field
            label="Updated At"
            value={formatDate(property.updatedAt)}
          />
        </Grid>
      </Section>

      {/* ================= ADDRESS ================= */}
      <Section title="Address">
        <Grid>
          <Field label="City" value={property.address?.city} />
          <Field label="State" value={property.address?.state} />
          <Field label="Locality" value={property.address?.locality} />
          <Field label="Pincode" value={property.address?.pincode} />
        </Grid>
      </Section>

      {/* ================= OWNER ================= */}
      <Section title="Owner Details">
        <Grid>
          <Field label="Name" value={property.owner?.name} />
          <Field label="Email" value={property.owner?.email} />
          <Field label="Phone" value={property.owner?.phone} />
        </Grid>
      </Section>

      {/* ================= FLAG REASON ================= */}
      {property.isFlagged && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-bold text-red-600 mb-2">Flag Reason</h3>
          <p className="text-red-700">
            {property.flagReason || "—"}
          </p>
        </div>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="font-bold text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold">{value || "—"}</p>
    </div>
  );
}

function Badge({ label, danger }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        danger
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {label}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toISOString().slice(0, 10);
}
