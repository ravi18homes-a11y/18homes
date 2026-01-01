"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

  // ================= FETCH PROPERTY =================
  useEffect(() => {
    fetch(API, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setProperty(res.data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!property) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* ================= HEADER CARD ================= */}
      <div className="bg-white rounded-xl shadow p-6 flex gap-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{property.title}</h2>

          <p className="text-gray-600 mt-1">
            ₹ {property.price} • {property.address?.city || "—"}
          </p>

          <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
            <Field label="Purpose" value={property.purpose} />
            <Field label="Property Type" value={property.propertyType} />
            <Field label="Furnishing" value={property.furnishing} />
            <Field label="Status" value={property.isActive ? "Active" : "Inactive"} />
            <Field label="Flagged" value={property.isFlagged ? "Yes" : "No"} />
            <Field label="Views" value={property.views} />
            <Field
              label="Created At"
              value={new Date(property.createdAt).toISOString().slice(0, 10)}
            />
            <Field
              label="Updated At"
              value={new Date(property.updatedAt).toISOString().slice(0, 10)}
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* ================= IMAGES ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Property Images</h3>

        {property.images?.length ? (
          <div className="grid grid-cols-4 gap-4">
            {property.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="property"
                className="h-40 w-full object-cover rounded-lg border"
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No images uploaded</p>
        )}
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-2">Description</h3>
        <p className="text-gray-700">
          {property.description || "—"}
        </p>
      </div>

      {/* ================= DETAILS ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Property Details</h3>

        <div className="grid grid-cols-4 gap-4 text-sm">
          <Field label="Bedrooms" value={property.bedrooms} />
          <Field label="Bathrooms" value={property.bathrooms} />
          <Field
            label="Area"
            value={
              property.area?.size
                ? `${property.area.size} ${property.area.unit || "sqft"}`
                : "—"
            }
          />
          <Field label="Furnishing" value={property.furnishing} />
        </div>
      </div>

      {/* ================= ADDRESS ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Address</h3>

        <div className="grid grid-cols-4 gap-4 text-sm">
          <Field label="City" value={property.address?.city} />
          <Field label="State" value={property.address?.state} />
          <Field label="Locality" value={property.address?.locality} />
          <Field label="Pincode" value={property.address?.pincode} />
        </div>
      </div>

      {/* ================= OWNER ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Owner Details</h3>

        <div className="grid grid-cols-4 gap-4 text-sm">
          <Field label="Owner Name" value={property.owner?.name} />
          <Field label="Owner Email" value={property.owner?.email} />
          <Field label="Owner Phone" value={property.owner?.phone} />
        </div>
      </div>

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

/* ================= FIELD COMPONENT ================= */
function Field({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold">{value || "—"}</p>
    </div>
  );
}
