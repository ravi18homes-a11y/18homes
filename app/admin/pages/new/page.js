"use client";

import PageEditor from "@/components/admin/PageEditor";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "react-hot-toast";

function NewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);

  const handleSave = async (pageData) => {
    setSaving(true);

    const response = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pageData),
    });

    const result = await response.json();
    if (response.ok) {
      toast.success("Page created successfully!");
      router.push("/admin/pages");
    } else {
      toast.error(result.error || "Unable to create page.");
    }
    setSaving(false);
  };

  return (
    <>
      <Head>
        <title>Create Page</title>
      </Head>
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Create a new page</h1>
              <p className="text-slate-600 mt-1">
                Build a page using the section editor and SEO panel.
              </p>
            </div>
            <Link
              href="/admin/pages"
              className="rounded-full bg-white px-4 py-2 text-sm text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-100"
            >
              Back to pages
            </Link>
          </div>
          <PageEditor
            mode="create"
            onSave={handleSave}
            saving={saving}
            initialData={{
              parentId: searchParams.get("parentId") || undefined,
            }}
          />
        </div>
      </div>
    </>
  );
}

export default function NewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPageContent />
    </Suspense>
  );
}
