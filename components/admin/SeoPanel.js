"use client";

export default function SeoPanel({ seo, onChange, preview }) {
  const updateField = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    onChange({ ...seo, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Meta title</span>
          <input
            value={seo.metaTitle}
            onChange={updateField("metaTitle")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            placeholder="Page title for search engines"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Meta description</span>
          <textarea
            value={seo.metaDescription}
            onChange={updateField("metaDescription")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            rows={4}
            placeholder="Summarize this page for search results"
          />
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Keywords</span>
          <input
            value={seo.keywords}
            onChange={updateField("keywords")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            placeholder="seo, landing page, nextjs"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Canonical URL</span>
          <input
            value={seo.canonicalUrl}
            onChange={updateField("canonicalUrl")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            placeholder="https://example.com/page"
          />
        </label>
      </div>

      <label className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-4">
        <input
          type="checkbox"
          checked={seo.noIndex}
          onChange={updateField("noIndex")}
          className="h-4 w-4 rounded border-slate-300 text-slate-900"
        />
        <span className="text-sm text-slate-700">Noindex this page</span>
      </label>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Open Graph title</span>
          <input
            value={seo.openGraphTitle}
            onChange={updateField("openGraphTitle")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span className="font-semibold">Open Graph image</span>
          <input
            value={seo.openGraphImage}
            onChange={updateField("openGraphImage")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          />
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-700">
        <span className="font-semibold">Open Graph description</span>
        <textarea
          value={seo.openGraphDescription}
          onChange={updateField("openGraphDescription")}
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          rows={3}
        />
      </label>

      <label className="space-y-2 text-sm text-slate-700 block">
        <span className="font-semibold">Structured Schema (JSON-LD)</span>
        <p className="text-xs text-slate-500">
          Paste raw JSON-LD contents here. Do not include the script tags.
        </p>
        <textarea
          value={seo.schemaMarkup || ""}
          onChange={updateField("schemaMarkup")}
          placeholder='{ "@context": "https://schema.org", "@type": "WebPage", ... }'
          className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 font-mono text-xs"
          rows={6}
        />
      </label>

      <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-slate-100">
        <p className="text-sm font-semibold text-slate-200">
          Live SERP preview
        </p>
        <div className="mt-4 space-y-3">
          <div className="text-lg font-semibold text-slate-50">
            {preview.title}
          </div>
          <div className="text-sm text-sky-400">{preview.url}</div>
          <p className="text-sm leading-6 text-slate-300">
            {preview.description}
          </p>
        </div>
      </div>
    </div>
  );
}
