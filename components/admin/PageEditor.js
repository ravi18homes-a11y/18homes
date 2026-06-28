"use client";

import { useEffect, useMemo, useState } from "react";
import SectionBuilder from "./SectionBuilder";
import SeoPanel from "./SeoPanel";

const defaultSeo = {
  metaTitle: "",
  metaDescription: "",
  keywords: "",
  canonicalUrl: "",
  noIndex: false,
  openGraphTitle: "",
  openGraphDescription: "",
  openGraphImage: "",
  schemaMarkup: "",
};

function createSlug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PageEditor({
  initialData = null,
  onSave,
  saving = false,
  mode = "create",
}) {
  const isEdit = mode === "edit" || Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [mainMenu, setMainMenu] = useState(initialData?.mainMenu || "pages");
  const [parentId, setParentId] = useState(initialData?.parentId || "");
  const [pages, setPages] = useState([]);
  const [slugSegmentManual, setSlugSegmentManual] = useState(
    initialData?.slugSegment || initialData?.slug || "",
  );
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [slugError, setSlugError] = useState("");
  const [sections, setSections] = useState(initialData?.sections || []);
  const [seo, setSeo] = useState(initialData?.seo || defaultSeo);
  const [activeTab, setActiveTab] = useState("general");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [showInNavbar, setShowInNavbar] = useState(initialData?.showInNavbar ?? true);
  const [isSlugManual, setIsSlugManual] = useState(
    Boolean(initialData?.slugSegment || initialData?.slug),
  );

  useEffect(() => {
    let ignore = false;
    (async () => {
      const res = await fetch("/api/pages");
      const data = await res.json();
      if (ignore) return;
      setPages(Array.isArray(data.pages) ? data.pages : []);
    })();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setTitle(initialData?.title || "");
    setSlugSegmentManual(initialData?.slugSegment || initialData?.slug || "");
    setSections(initialData?.sections || []);
    setSeo(initialData?.seo || defaultSeo);
    setStatus(initialData?.status || "draft");
    setShowInNavbar(initialData?.showInNavbar ?? true);
    setParentId(initialData?.parentId || "");
    setMainMenu(initialData?.mainMenu || "pages");
  }, [
    initialData?.id,
    initialData?.title,
    initialData?.slugSegment,
    initialData?.slug,
    initialData?.parentId,
    initialData?.mainMenu,
    initialData?.status,
    initialData?.showInNavbar,
    initialData?.updatedAt,
  ]);

  useEffect(() => {
    if (!parentId) {
      if (!isEdit) setMainMenu("pages");
      return;
    }
    const par = pages.find((p) => p.id === parentId);
    if (par) setMainMenu(par.mainMenu);
  }, [parentId, pages, isEdit]);

  const effectiveSlugSegment = useMemo(() => {
    return isSlugManual ? slugSegmentManual : createSlug(title);
  }, [isSlugManual, slugSegmentManual, title]);

  const parent = useMemo(() => {
    if (!parentId) return null;
    return pages.find((p) => p.id === parentId) || null;
  }, [pages, parentId]);

  const computedSlug = useMemo(() => {
    const segment = createSlug(effectiveSlugSegment || "");
    if (!segment) return "";
    if (parent) return `${parent.slug}/${segment}`;
    if (mainMenu === "home" || mainMenu === "pages") return segment;
    return `${mainMenu}/${segment}`;
  }, [effectiveSlugSegment, parent, mainMenu]);

  useEffect(() => {
    let timeout;
    if (!computedSlug) return;

    timeout = setTimeout(async () => {
      const searchParams = new URLSearchParams({ slug: computedSlug });
      if (initialData?.id) {
        searchParams.set("excludeId", initialData.id);
      }
      const res = await fetch(
        `/api/pages/check-slug?${searchParams.toString()}`,
      );
      const data = await res.json();
      setSlugAvailable(data.available);
      setSlugError(data.available ? "" : "Slug is already taken.");
    }, 400);

    return () => clearTimeout(timeout);
  }, [computedSlug, initialData?.id]);

  const metaPreview = useMemo(() => {
    return {
      title: seo.metaTitle || title || "Untitled page",
      description:
        seo.metaDescription || "Write a meta description for this page.",
      url: seo.canonicalUrl || `https://example.com/${computedSlug}`,
    };
  }, [seo, title, computedSlug]);

  const handleSave = async () => {
    const resolvedParent = isEdit
      ? parentId || null
      : (parentId || initialData?.parentId || null) || null;

    const payload = {
      title,
      mainMenu,
      parentId: resolvedParent,
      slugSegment: createSlug(effectiveSlugSegment),
      status,
      sections,
      seo,
      showInNavbar,
    };
    await onSave(payload);
  };

  const localSlugError = !effectiveSlugSegment
    ? "Slug segment is required."
    : !computedSlug
      ? "Invalid slug."
      : "";

  const finalSlugError = localSlugError || slugError;
  const finalSlugAvailable = localSlugError ? false : slugAvailable;
  const hasSaveError = !!finalSlugError || !title || !finalSlugAvailable;

  const locationHint = !parent
    ? "Top-level site page — shown in the navbar after Contact when published."
    : `Nested under “${parent.title}” — appears in the menu under that item.`;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { key: "general", label: "General" },
          { key: "sections", label: "Sections" },
          { key: "seo", label: "SEO" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 cursor-pointer py-2 text-sm font-medium transition ${activeTab === tab.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
            {locationHint}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-semibold">Page title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                placeholder="Page title"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              <span className="font-semibold">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <p className="text-xs text-slate-500">
                Only published pages appear on the public site and in the
                navbar.
              </p>
            </label>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showInNavbar}
                onChange={(event) => setShowInNavbar(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
              />
              <div className="space-y-1">
                <span className="text-sm font-semibold text-slate-900">Show in navigation bar</span>
                <p className="text-xs text-slate-600">
                  Enable this to show this page in the main website header. When disabled, the page will not appear in the navbar, but visitors can still access it directly if they know its URL.
                </p>
              </div>
            </label>
          </div>

          {(isEdit || initialData?.parentId) && (
            <label className="block space-y-2 text-sm text-slate-700">
              <span className="font-semibold">
                {isEdit ? "Parent page" : "Hierarchy"}
              </span>
              {isEdit ? (
                <select
                  value={parentId}
                  onChange={(event) => setParentId(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                >
                  <option value="">No parent (root under its menu)</option>
                  {pages
                    .filter(
                      (p) =>
                        p.mainMenu === mainMenu &&
                        (!initialData?.id || p.id !== initialData.id),
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} — /{p.slug}
                      </option>
                    ))}
                </select>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-800">
                  Child of{" "}
                  <strong>{parent ? parent.title : "…"}</strong>
                </div>
              )}
            </label>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
              <span className="font-semibold">Slug segment</span>
              <input
                value={effectiveSlugSegment}
                onChange={(event) => {
                  setSlugSegmentManual(event.target.value);
                  setIsSlugManual(true);
                }}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                placeholder="my-page-url"
              />
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span>Full path:</span>
                <code className="rounded-xl bg-slate-100 px-2 py-1">
                  /{computedSlug || "your-path"}
                </code>
                {finalSlugError ? (
                  <span className="text-rose-600">{finalSlugError}</span>
                ) : (
                  <span className="text-emerald-600">Slug available</span>
                )}
              </div>
            </label>
          </div>
        </section>
      )}

      {activeTab === "sections" && (
        <SectionBuilder sections={sections} onChange={setSections} />
      )}

      {activeTab === "seo" && (
        <SeoPanel seo={seo} onChange={setSeo} preview={metaPreview} />
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          {hasSaveError
            ? "Fix required fields before saving."
            : "Your page is ready to save."}
        </div>
        <button
          type="button"
          disabled={saving || hasSaveError}
          onClick={handleSave}
          className="inline-flex items-center cursor-pointer justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Save page"}
        </button>
      </div>
    </div>
  );
}
