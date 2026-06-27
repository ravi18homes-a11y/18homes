"use client";

import PageEditor from "@/components/admin/PageEditor";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function EditPageClient({ id }) {
  const router = useRouter();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/pages/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Page not found");
        return res.json();
      })
      .then((data) => {
        setPage(data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load page");
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Page updated successfully!");
        router.push("/admin/pages");
        router.refresh();
      } else {
        toast.error(data.error || "Unable to save. Check the form and try again.");
      }
    } catch (e) {
      toast.error(e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading page data...</div>;
  }

  if (!page) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
        Page not found.
      </div>
    );
  }

  return (
    <div>
      <PageEditor
        initialData={page}
        onSave={handleSave}
        saving={saving}
        mode="edit"
      />
    </div>
  );
}
