"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminContactViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contact, setContact] = useState(null);

  const API =
    (process.env.NEXT_PUBLIC_APP_DATABASE_URL || "http://localhost:5000") +
    "/api/contacts";

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  useEffect(() => {
    fetch(`${API}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => setContact(res.data));
  }, [id]);

  if (!contact) return <div className="p-10">Loading contact...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* MESSAGE */}
      <Card title="Message">
        <p>{contact.message}</p>
      </Card>

      {/* PROPERTY */}
      <Card title="Property">
        <p className="font-semibold">{contact.property?.title}</p>
        <p className="text-gray-600">
          {contact.property?.address?.locality},{" "}
          {contact.property?.address?.city}
        </p>

        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <Field label="Purpose" value={contact.property?.purpose} />
          <Field label="Type" value={contact.property?.propertyType} />
          <Field 
            label="Price" 
            value={contact.property?.priceText 
              ? (contact.property.priceText.includes("₹") ? contact.property.priceText : `₹ ${contact.property.priceText}`) 
              : (contact.property?.priceValue 
                ? `₹ ${contact.property.priceValue.toLocaleString()}` 
                : (contact.property?.price ? `₹ ${contact.property.price}` : "—"))
            } 
          />
          <Field label="Pincode" value={contact.property?.address?.pincode} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {contact.property?.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              className="rounded shadow h-32 object-cover"
            />
          ))}
        </div>
      </Card>

      {/* BUYER + OWNER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Buyer">
          <Field label="Name" value={contact.buyer?.name} />
          <Field label="Email" value={contact.buyer?.email} />
          <Field label="Phone" value={contact.buyer?.phone} />
        </Card>

        <Card title="Owner">
          <Field label="Name" value={contact.owner?.name} />
          <Field label="Email" value={contact.owner?.email} />
          <Field label="Phone" value={contact.owner?.phone} />
        </Card>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <button
          onClick={() => router.back()}
          className="bg-gray-600 text-white px-6 py-2 rounded"
        >
          Back
        </button>
      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="text-sm">
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold">{value || "—"}</p>
    </div>
  );
}
