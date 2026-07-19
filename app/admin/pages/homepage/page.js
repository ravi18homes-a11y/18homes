"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function HomepageEditor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("seo");
  const [message, setMessage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState({}); // Track uploading status per key

  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((json) => {
        const rawJson = json || {};

        // Enrich Hero Slides
        const hero = rawJson.hero || {};
        const slides = Array.isArray(hero.slides) ? [...hero.slides] : [];
        while (slides.length < 3) {
          slides.push({ image: "", heading1: "", heading2: "", heading3: "", heading4: "" });
        }

        // Enrich About Points
        const about = rawJson.about || {};
        const points = Array.isArray(about.points) ? [...about.points] : [];
        while (points.length < 4) {
          points.push("");
        }

        // Enrich Services Items
        const services = rawJson.services || {};
        const serviceItems = Array.isArray(services.items) ? [...services.items] : [];
        while (serviceItems.length < 6) {
          serviceItems.push({ title: "", desc: "", img: "" });
        }

        // Enrich Blogs Items
        const blogs = rawJson.blogs || {};
        const blogItems = Array.isArray(blogs.items) ? [...blogs.items] : [];
        while (blogItems.length < 4) {
          blogItems.push({ date: "", title: "", img: "" });
        }

        // Enrich Testimonials Items
        const testimonials = rawJson.testimonials || {};
        const testimonialItems = Array.isArray(testimonials.items) ? [...testimonials.items] : [];
        while (testimonialItems.length < 4) {
          testimonialItems.push({ text: "", name: "", role: "", img: "" });
        }

        // Enrich Footer Services
        const footer = rawJson.footer || {};
        const rawFooterServices = Array.isArray(footer.services) ? footer.services : [];
        const footerServices = rawFooterServices.map((srv) => {
          if (typeof srv === "string") {
            return { label: srv, link: "" };
          }
          return {
            label: srv?.label || "",
            link: srv?.link || ""
          };
        });
        while (footerServices.length < 4) {
          footerServices.push({ label: "", link: "" });
        }

        const enriched = {
          ...rawJson,
          navbar: {
            logo: rawJson.navbar?.logo || "",
            logoAlt: rawJson.navbar?.logoAlt || "Logo",
          },
          seo: {
            metaTitle: rawJson.seo?.metaTitle || "",
            metaDescription: rawJson.seo?.metaDescription || "",
            keywords: rawJson.seo?.keywords || "",
            canonicalUrl: rawJson.seo?.canonicalUrl || "",
            noIndex: Boolean(rawJson.seo?.noIndex),
            openGraphTitle: rawJson.seo?.openGraphTitle || "",
            openGraphDescription: rawJson.seo?.openGraphDescription || "",
            openGraphImage: rawJson.seo?.openGraphImage || "",
            twitterTitle: rawJson.seo?.twitterTitle || "",
            twitterDescription: rawJson.seo?.twitterDescription || "",
            twitterImage: rawJson.seo?.twitterImage || "",
            twitterCard: rawJson.seo?.twitterCard || "summary_large_image",
            schemaMarkup: rawJson.seo?.schemaMarkup || "",
            sitemapXml: rawJson.seo?.sitemapXml || "",
            sitemapHtml: rawJson.seo?.sitemapHtml || "",
            robotsTxt: rawJson.seo?.robotsTxt || "",
          },
          hero: {
            ...hero,
            slides: slides.slice(0, 3)
          },
          about: {
            subtitle: about.subtitle || "About",
            title: about.title || "",
            description: about.description || "",
            image: about.image || "",
            points: points.slice(0, 4),
            bgColor: about.bgColor || "",
            textColor: about.textColor || "",
          },
          services: {
            subtitle: services.subtitle || "Service",
            title: services.title || "",
            items: serviceItems.slice(0, 6),
            bgColor: services.bgColor || "",
            textColor: services.textColor || "",
          },
          blogs: {
            subtitle: blogs.subtitle || "Latest post",
            title: blogs.title || "",
            items: blogItems.slice(0, 4),
            bgColor: blogs.bgColor || "",
            textColor: blogs.textColor || "",
          },
          instruments: {
            ...(rawJson.instruments || {}),
            bgColor: rawJson.instruments?.bgColor || "",
            textColor: rawJson.instruments?.textColor || "",
          },
          testimonials: {
            title: testimonials.title || "",
            description: testimonials.description || "",
            items: testimonialItems,
            bgColor: testimonials.bgColor || "",
            textColor: testimonials.textColor || "",
          },
          contact: {
            ...(rawJson.contact || {}),
            bgColor: rawJson.contact?.bgColor || "",
            textColor: rawJson.contact?.textColor || "",
          },
          footer: {
            ...footer,
            services: footerServices.slice(0, 4),
            bgColor: footer.bgColor || "",
            textColor: footer.textColor || "",
          },
        };
        setData(enriched);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load homepage data.");
        setMessage({ type: "error", text: "Failed to load homepage data." });
        setLoading(false);
      });
  }, []);

  const handleImageUpload = async (file, pathArray) => {
    const key = pathArray.join("-");
    setUploadingImage((prev) => ({ ...prev, [key]: true }));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (res.ok && result.url) {
        updateField(pathArray, result.url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image");
    } finally {
      setUploadingImage((prev) => ({ ...prev, [key]: false }));
    }
  };

  const updateField = (pathArray, value) => {
    setData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;
      for (let i = 0; i < pathArray.length - 1; i++) {
        const key = pathArray[i];
        if (current[key] === undefined || current[key] === null) {
          current[key] = {};
        }
        current = current[key];
      }
      current[pathArray[pathArray.length - 1]] = value;
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Homepage updated successfully!");
        setMessage({ type: "success", text: "Homepage updated successfully!" });
      } else {
        const errJson = await res.json();
        toast.error(errJson.error || "Failed to save.");
        setMessage({ type: "error", text: errJson.error || "Failed to save." });
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-600">Loading homepage settings...</div>;
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
        Could not load settings. Please check your connection.
      </div>
    );
  }

  const tabs = [
    { key: "navbar", label: "🔝 Navbar" },
    { key: "seo", label: "SEO & Meta" },
    { key: "hero", label: "Hero Banner" },
    { key: "about", label: "About" },
    { key: "services", label: "Services" },
    { key: "blogs", label: "Blogs" },
    { key: "instruments", label: "Premium Solutions" },
    { key: "testimonials", label: "Testimonials" },
    { key: "contact", label: "Contact Form" },
    { key: "footer", label: "Footer" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Edit Homepage Content</h1>
          <p className="mt-1 text-sm text-slate-600">
            Edit text, headings, and upload images for the website homepage.
          </p>
        </div>
        <Link
          href="/admin/pages"
          className="rounded-full bg-white px-5 py-2.5 text-sm text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-100"
        >
          Back to pages
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer ${activeTab === tab.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-6">
        {/* NAVBAR TAB */}
        {activeTab === "navbar" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Navbar Settings</h3>
              <p className="mt-1 text-xs text-slate-500">
                Upload or change the logo displayed in the navigation bar across the entire website.
              </p>
            </div>

            <div className="p-6 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-5">
              <h4 className="font-semibold text-slate-700">Navbar Logo</h4>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Current Logo</span>
                  <div className="w-32 h-24 rounded-2xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shadow-sm">
                    {data.navbar?.logo ? (
                      <img
                        src={data.navbar.logo}
                        alt={data.navbar?.logoAlt || "Logo"}
                        className="object-contain w-full h-full p-2"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 text-center px-2">No logo set</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition">
                    {uploadingImage["navbar-logo"] ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3" />
                        </svg>
                        Upload New Logo
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e.target.files[0], ["navbar", "logo"]);
                        }
                      }}
                    />
                  </label>
                  {data.navbar?.logo && (
                    <button
                      type="button"
                      onClick={() => updateField(["navbar", "logo"], "")}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Logo Image URL <span className="font-normal text-slate-400">(or paste a direct URL)</span></span>
                <input
                  value={data.navbar?.logo || ""}
                  onChange={(e) => updateField(["navbar", "logo"], e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400 text-sm"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Logo Alt Text</span>
                <input
                  value={data.navbar?.logoAlt || ""}
                  onChange={(e) => updateField(["navbar", "logoAlt"], e.target.value)}
                  placeholder="e.g. 18Homes Logo"
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400 text-sm"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              💡 <strong>Tip:</strong> After saving, the new logo will appear on the live website immediately. Recommended: at least <strong>140×140px</strong>, PNG or SVG with a transparent background.
            </div>
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">SEO Settings</h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-semibold">Homepage Title (Meta Title)</span>
                  <input
                    value={data.seo?.metaTitle || ""}
                    onChange={(e) => updateField(["seo", "metaTitle"], e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>

                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-semibold">Canonical URL</span>
                  <input
                    value={data.seo?.canonicalUrl || ""}
                    onChange={(e) => updateField(["seo", "canonicalUrl"], e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>

                <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                  <span className="font-semibold">Keywords (comma-separated)</span>
                  <input
                    value={data.seo?.keywords || ""}
                    onChange={(e) => updateField(["seo", "keywords"], e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>

                <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                  <span className="font-semibold">Meta Description</span>
                  <textarea
                    value={data.seo?.metaDescription || ""}
                    onChange={(e) => updateField(["seo", "metaDescription"], e.target.value)}
                    rows="3"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 resize-none"
                  />
                </label>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5 md:col-span-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(data.seo?.noIndex)}
                      onChange={(e) => updateField(["seo", "noIndex"], e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <span className="text-sm font-semibold text-slate-900">Hide from Search Engines (noIndex)</span>
                      <p className="text-xs text-slate-500">
                        Enable this to apply the robots noindex meta tag, which prevents search engines from indexing the homepage.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* OPEN GRAPH META */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Open Graph (Facebook / Social Sharing)</h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-semibold">OG Title</span>
                  <input
                    value={data.seo?.openGraphTitle || ""}
                    onChange={(e) => updateField(["seo", "openGraphTitle"], e.target.value)}
                    placeholder="Defaults to Meta Title"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>

                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-slate-700">OG Sharing Image</span>
                  <div className="flex items-center gap-4">
                    {data.seo?.openGraphImage && (
                      <img
                        src={data.seo.openGraphImage}
                        alt="OG sharing"
                        className="w-24 h-16 object-cover rounded-xl border border-slate-200"
                      />
                    )}
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                      {uploadingImage["seo-openGraphImage"] ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(e.target.files[0], ["seo", "openGraphImage"]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                  <span className="font-semibold">OG Description</span>
                  <textarea
                    value={data.seo?.openGraphDescription || ""}
                    onChange={(e) => updateField(["seo", "openGraphDescription"], e.target.value)}
                    placeholder="Defaults to Meta Description"
                    rows="3"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 resize-none"
                  />
                </label>
              </div>
            </div>

            {/* TWITTER CARD */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Twitter Card Metadata</h3>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-semibold">Twitter Title</span>
                  <input
                    value={data.seo?.twitterTitle || ""}
                    onChange={(e) => updateField(["seo", "twitterTitle"], e.target.value)}
                    placeholder="Defaults to Meta Title"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  />
                </label>

                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-semibold">Twitter Card Style</span>
                  <select
                    value={data.seo?.twitterCard || "summary_large_image"}
                    onChange={(e) => updateField(["seo", "twitterCard"], e.target.value)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary with Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </label>

                <div className="space-y-2 md:col-span-2">
                  <span className="block text-sm font-semibold text-slate-700">Twitter Image</span>
                  <div className="flex items-center gap-4">
                    {data.seo?.twitterImage && (
                      <img
                        src={data.seo.twitterImage}
                        alt="Twitter banner"
                        className="w-24 h-16 object-cover rounded-xl border border-slate-200"
                      />
                    )}
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                      {uploadingImage["seo-twitterImage"] ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(e.target.files[0], ["seo", "twitterImage"]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                  <span className="font-semibold">Twitter Description</span>
                  <textarea
                    value={data.seo?.twitterDescription || ""}
                    onChange={(e) => updateField(["seo", "twitterDescription"], e.target.value)}
                    placeholder="Defaults to Meta Description"
                    rows="3"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 resize-none"
                  />
                </label>
              </div>
            </div>

            {/* CUSTOM SCHEMA INJECTION */}
            <div>
              <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Structured Schema (JSON-LD)</h3>
              <div className="mt-4 space-y-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-semibold">JSON-LD Code (e.g. Website or LocalBusiness schema)</span>
                  <p className="text-xs text-slate-500">
                    Paste raw script contents directly. Note: Do not include the script tag wrapper itself; just the JSON code.
                  </p>
                  <textarea
                    value={data.seo?.schemaMarkup || ""}
                    onChange={(e) => updateField(["seo", "schemaMarkup"], e.target.value)}
                    placeholder='{ "@context": "https://schema.org", "@type": "WebSite", ... }'
                    rows="8"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-950 font-mono text-xs outline-none focus:border-slate-400"
                  />
                </label>
              </div>
            </div>

            {/* SEARCH ENGINE FILES (robots.txt, sitemap.xml, sitemap.html) */}
            <div className="border-t pt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Search Engine Files</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Directly edit robots.txt, sitemap.xml, and sitemap.html contents. You can copy the contents or paste new ones.
                </p>
              </div>

              <div className="space-y-6">
                {/* robots.txt */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">robots.txt</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(data.seo?.robotsTxt || "");
                        toast.success("robots.txt copied to clipboard!");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer active:scale-95 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy robots.txt
                    </button>
                  </div>
                  <textarea
                    value={data.seo?.robotsTxt || ""}
                    onChange={(e) => updateField(["seo", "robotsTxt"], e.target.value)}
                    placeholder="User-agent: *..."
                    rows="8"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-950 font-mono text-xs outline-none focus:border-slate-400"
                  />
                </div>

                {/* sitemap.xml */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">sitemap.xml</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(data.seo?.sitemapXml || "");
                        toast.success("sitemap.xml copied to clipboard!");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer active:scale-95 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy sitemap.xml
                    </button>
                  </div>
                  <textarea
                    value={data.seo?.sitemapXml || ""}
                    onChange={(e) => updateField(["seo", "sitemapXml"], e.target.value)}
                    placeholder="<?xml version='1.0' encoding='UTF-8'?>..."
                    rows="12"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-950 font-mono text-xs outline-none focus:border-slate-400"
                  />
                </div>

                {/* sitemap.html */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">sitemap.html</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(data.seo?.sitemapHtml || "");
                        toast.success("sitemap.html copied to clipboard!");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer active:scale-95 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copy sitemap.html
                    </button>
                  </div>
                  <textarea
                    value={data.seo?.sitemapHtml || ""}
                    onChange={(e) => updateField(["seo", "sitemapHtml"], e.target.value)}
                    placeholder="<!doctype html>..."
                    rows="12"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-950 font-mono text-xs outline-none focus:border-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HERO TAB */}
        {activeTab === "hero" && (
          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Hero Slider (3 slides)</h3>
            {(data.hero?.slides || []).map((slide, idx) => (
              <div key={idx} className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
                <h4 className="font-semibold text-slate-700">Slide {idx + 1}</h4>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <label className="block space-y-2 text-sm text-slate-700">
                      <span className="font-medium">Top Text Badge (e.g. "Delhi NCR Special")</span>
                      <input
                        value={slide.heading1 || ""}
                        onChange={(e) => updateField(["hero", "slides", idx, "heading1"], e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      />
                    </label>
                    <label className="block space-y-2 text-sm text-slate-700">
                      <span className="font-medium">Script Subheading (e.g. "Today's Premium Offer")</span>
                      <input
                        value={slide.heading2 || ""}
                        onChange={(e) => updateField(["hero", "slides", idx, "heading2"], e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="block space-y-2 text-sm text-slate-700">
                      <span className="font-medium">Main Banner Title (e.g. "Luxury Flats In Your Budget")</span>
                      <input
                        value={slide.heading3 || ""}
                        onChange={(e) => updateField(["hero", "slides", idx, "heading3"], e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      />
                    </label>
                    <label className="block space-y-2 text-sm text-slate-700">
                      <span className="font-medium">Call to Action Heading (e.g. "Book Your Dream Home Today")</span>
                      <input
                        value={slide.heading4 || ""}
                        onChange={(e) => updateField(["hero", "slides", idx, "heading4"], e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-slate-700">Slide Image</span>
                  <div className="flex items-center gap-4">
                    {slide.image && (
                      <img
                        src={slide.image}
                        alt={`Slide ${idx + 1}`}
                        className="w-32 h-20 object-cover rounded-xl border border-slate-200"
                      />
                    )}
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
                      {uploadingImage[`hero-slides-${idx}-image`] ? "Uploading..." : "Change Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(e.target.files[0], ["hero", "slides", idx, "image"]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">About Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Script Subtitle (e.g. "About")</span>
                <input
                  value={data.about?.subtitle || ""}
                  onChange={(e) => updateField(["about", "subtitle"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Main Heading</span>
                <input
                  value={data.about?.title || ""}
                  onChange={(e) => updateField(["about", "title"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                <span className="font-semibold">Description Text</span>
                <textarea
                  value={data.about?.description || ""}
                  onChange={(e) => updateField(["about", "description"], e.target.value)}
                  rows="5"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400 resize-none leading-relaxed"
                />
              </label>
            </div>

            <div className="space-y-4">
              <span className="block text-sm font-semibold text-slate-700">Checkmark Bullets</span>
              <div className="grid gap-4 md:grid-cols-2">
                {(data.about?.points || []).map((pt, idx) => (
                  <label key={idx} className="block space-y-1 text-sm text-slate-600">
                    <span>Bullet {idx + 1}</span>
                    <input
                      value={pt || ""}
                      onChange={(e) => {
                        const newPts = [...data.about.points];
                        newPts[idx] = e.target.value;
                        updateField(["about", "points"], newPts);
                      }}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-semibold text-slate-700">About Side Image</span>
              <div className="flex items-center gap-4">
                {data.about?.image && (
                  <img
                    src={data.about.image}
                    alt="About side"
                    className="w-40 h-28 object-contain rounded-xl border border-slate-200 bg-slate-50"
                  />
                )}
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
                  {uploadingImage["about-image"] ? "Uploading..." : "Change Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0], ["about", "image"]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
              <h4 className="font-semibold text-slate-700">Section Colors</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Background Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.about?.bgColor || "#eef6f8"}
                      onChange={(e) => updateField(["about", "bgColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.about?.bgColor || ""}
                      onChange={(e) => updateField(["about", "bgColor"], e.target.value)}
                      placeholder="#eef6f8"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Text Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.about?.textColor || "#101010"}
                      onChange={(e) => updateField(["about", "textColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.about?.textColor || ""}
                      onChange={(e) => updateField(["about", "textColor"], e.target.value)}
                      placeholder="#101010"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Services Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Italic Subheading (e.g. "Service")</span>
                <input
                  value={data.services?.subtitle || ""}
                  onChange={(e) => updateField(["services", "subtitle"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Main Title (e.g. "Our Services")</span>
                <input
                  value={data.services?.title || ""}
                  onChange={(e) => updateField(["services", "title"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            </div>

            <div className="space-y-4">
              <span className="block text-sm font-semibold text-slate-700">Services Cards (6 total)</span>
              <div className="grid gap-6 md:grid-cols-2">
                {(data.services?.items || []).map((srv, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-3">
                    <span className="font-semibold text-xs text-slate-500 uppercase">Card {idx + 1}</span>
                    <label className="block space-y-1 text-sm text-slate-700">
                      <span className="font-medium">Card Title</span>
                      <input
                        value={srv.title || ""}
                        onChange={(e) => updateField(["services", "items", idx, "title"], e.target.value)}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400"
                      />
                    </label>

                    <label className="block space-y-1 text-sm text-slate-700">
                      <span className="font-medium">Card Description</span>
                      <textarea
                        value={srv.desc || ""}
                        onChange={(e) => updateField(["services", "items", idx, "desc"], e.target.value)}
                        rows="3"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400 resize-none text-xs"
                      />
                    </label>

                    <div className="space-y-1">
                      <span className="block text-xs font-semibold text-slate-700">Card Image</span>
                      <div className="flex items-center gap-4">
                        {srv.img && (
                          <img
                            src={srv.img}
                            alt={`Service ${idx + 1}`}
                            className="w-20 h-14 object-cover rounded-lg border border-slate-200"
                          />
                        )}
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
                          {uploadingImage[`services-items-${idx}-img`] ? "Uploading..." : "Change Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], ["services", "items", idx, "img"]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
              <h4 className="font-semibold text-slate-700">Section Colors</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Background Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.services?.bgColor || "#F7EFF2"}
                      onChange={(e) => updateField(["services", "bgColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.services?.bgColor || ""}
                      onChange={(e) => updateField(["services", "bgColor"], e.target.value)}
                      placeholder="#F7EFF2"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Text Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.services?.textColor || "#000000"}
                      onChange={(e) => updateField(["services", "textColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.services?.textColor || ""}
                      onChange={(e) => updateField(["services", "textColor"], e.target.value)}
                      placeholder="#000000"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* BLOGS TAB */}
        {activeTab === "blogs" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Blogs Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Script Subheading (e.g. "Latest post")</span>
                <input
                  value={data.blogs?.subtitle || ""}
                  onChange={(e) => updateField(["blogs", "subtitle"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Main Title (e.g. "18Homes Real Estate Blogs")</span>
                <input
                  value={data.blogs?.title || ""}
                  onChange={(e) => updateField(["blogs", "title"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            </div>

            <div className="space-y-4">
              <span className="block text-sm font-semibold text-slate-700">Blog Cards (4 total)</span>
              <div className="grid gap-6 md:grid-cols-2">
                {(data.blogs?.items || []).map((blog, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-3">
                    <span className="font-semibold text-xs text-slate-500 uppercase">Card {idx + 1}</span>
                    <div className="grid gap-3 grid-cols-2">
                      <label className="block space-y-1 text-sm text-slate-700">
                        <span className="font-medium">Blog Date</span>
                        <input
                          value={blog.date || ""}
                          onChange={(e) => updateField(["blogs", "items", idx, "date"], e.target.value)}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400"
                        />
                      </label>
                      <label className="block space-y-1 text-sm text-slate-700">
                        <span className="font-medium">Blog Title</span>
                        <input
                          value={blog.title || ""}
                          onChange={(e) => updateField(["blogs", "items", idx, "title"], e.target.value)}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400"
                        />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-xs font-semibold text-slate-700">Blog Thumbnail Image</span>
                      <div className="flex items-center gap-4">
                        {blog.img && (
                          <img
                            src={blog.img}
                            alt={`Blog ${idx + 1}`}
                            className="w-20 h-14 object-cover rounded-lg border border-slate-200"
                          />
                        )}
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
                          {uploadingImage[`blogs-items-${idx}-img`] ? "Uploading..." : "Change Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], ["blogs", "items", idx, "img"]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
              <h4 className="font-semibold text-slate-700">Section Colors</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Background Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.blogs?.bgColor || "#F7F7F7"}
                      onChange={(e) => updateField(["blogs", "bgColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.blogs?.bgColor || ""}
                      onChange={(e) => updateField(["blogs", "bgColor"], e.target.value)}
                      placeholder="#F7F7F7"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Text Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.blogs?.textColor || "#000000"}
                      onChange={(e) => updateField(["blogs", "textColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.blogs?.textColor || ""}
                      onChange={(e) => updateField(["blogs", "textColor"], e.target.value)}
                      placeholder="#000000"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* INSTRUMENTS TAB */}
        {activeTab === "instruments" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Premium Solutions Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Script Subtitle</span>
                <input
                  value={data.instruments?.subtitle || ""}
                  onChange={(e) => updateField(["instruments", "subtitle"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Main Heading</span>
                <input
                  value={data.instruments?.title || ""}
                  onChange={(e) => updateField(["instruments", "title"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Description Line 1</span>
                <input
                  value={data.instruments?.desc1 || ""}
                  onChange={(e) => updateField(["instruments", "desc1"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Description Line 2</span>
                <input
                  value={data.instruments?.desc2 || ""}
                  onChange={(e) => updateField(["instruments", "desc2"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                <span className="font-semibold">Description Line 3</span>
                <input
                  value={data.instruments?.desc3 || ""}
                  onChange={(e) => updateField(["instruments", "desc3"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-semibold text-slate-700">Big Background Image</span>
              <div className="flex items-center gap-4">
                {data.instruments?.image && (
                  <img
                    src={data.instruments.image}
                    alt="Solutions background"
                    className="w-40 h-28 object-cover rounded-xl border border-slate-200"
                  />
                )}
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
                  {uploadingImage["instruments-image"] ? "Uploading..." : "Change Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0], ["instruments", "image"]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
              <h4 className="font-semibold text-slate-700">Section Colors</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Background Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.instruments?.bgColor || "#F2F2F2"}
                      onChange={(e) => updateField(["instruments", "bgColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.instruments?.bgColor || ""}
                      onChange={(e) => updateField(["instruments", "bgColor"], e.target.value)}
                      placeholder="#F2F2F2"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Text Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.instruments?.textColor || "#000000"}
                      onChange={(e) => updateField(["instruments", "textColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.instruments?.textColor || ""}
                      onChange={(e) => updateField(["instruments", "textColor"], e.target.value)}
                      placeholder="#000000"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TESTIMONIALS TAB */}
        {activeTab === "testimonials" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Testimonials Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Main Heading (e.g. "What Our Clients Say")</span>
                <input
                  value={data.testimonials?.title || ""}
                  onChange={(e) => updateField(["testimonials", "title"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Short Description</span>
                <input
                  value={data.testimonials?.description || ""}
                  onChange={(e) => updateField(["testimonials", "description"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-2">
                <span className="block text-sm font-semibold text-slate-700">
                  Customer Feedbacks ({data.testimonials?.items?.length || 0} total)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const currentItems = data.testimonials?.items || [];
                    const newItems = [...currentItems, { text: "", name: "", role: "", img: "" }];
                    updateField(["testimonials", "items"], newItems);
                    toast.success("New testimonial card added!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 cursor-pointer active:scale-95 transition"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Testimonial
                </button>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {(data.testimonials?.items || []).map((t, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-slate-500 uppercase">Feedback Card {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentItems = data.testimonials?.items || [];
                          const newItems = currentItems.filter((_, i) => i !== idx);
                          updateField(["testimonials", "items"], newItems);
                          toast.success("Testimonial card removed.");
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer active:scale-95"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 grid-cols-2">
                      <label className="block space-y-1 text-sm text-slate-700">
                        <span className="font-medium">Customer Name</span>
                        <input
                          value={t.name || ""}
                          onChange={(e) => updateField(["testimonials", "items", idx, "name"], e.target.value)}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400"
                        />
                      </label>
                      <label className="block space-y-1 text-sm text-slate-700">
                        <span className="font-medium">Customer Role (e.g. "Tenant")</span>
                        <input
                          value={t.role || ""}
                          onChange={(e) => updateField(["testimonials", "items", idx, "role"], e.target.value)}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400"
                        />
                      </label>
                    </div>

                    <label className="block space-y-1 text-sm text-slate-700">
                      <span className="font-medium">Feedback Text</span>
                      <textarea
                        value={t.text || ""}
                        onChange={(e) => updateField(["testimonials", "items", idx, "text"], e.target.value)}
                        rows="3"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 resize-none text-xs"
                      />
                    </label>

                    <div className="space-y-1">
                      <span className="block text-xs font-semibold text-slate-700">Customer Avatar Image</span>
                      <div className="flex items-center gap-4">
                        {t.img && (
                          <img
                            src={t.img}
                            alt={`Customer avatar ${idx + 1}`}
                            className="w-14 h-14 rounded-full object-cover border border-slate-200"
                          />
                        )}
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
                          {uploadingImage[`testimonials-items-${idx}-img`] ? "Uploading..." : "Change Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0], ["testimonials", "items", idx, "img"]);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
              <h4 className="font-semibold text-slate-700">Section Colors</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Background Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.testimonials?.bgColor || "#0d0128"}
                      onChange={(e) => updateField(["testimonials", "bgColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.testimonials?.bgColor || ""}
                      onChange={(e) => updateField(["testimonials", "bgColor"], e.target.value)}
                      placeholder="#0d0128"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Text Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.testimonials?.textColor || "#ffffff"}
                      onChange={(e) => updateField(["testimonials", "textColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.testimonials?.textColor || ""}
                      onChange={(e) => updateField(["testimonials", "textColor"], e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Contact Form Section</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                <span className="font-semibold">Requirements Form Title (e.g. "Please tell us your requirements")</span>
                <input
                  value={data.contact?.title || ""}
                  onChange={(e) => updateField(["contact", "title"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-semibold text-slate-700">Right Side Cover Image</span>
              <div className="flex items-center gap-4">
                {data.contact?.image && (
                  <img
                    src={data.contact.image}
                    alt="Contact cover"
                    className="w-40 h-28 object-contain rounded-xl border border-slate-200 bg-slate-50"
                  />
                )}
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">
                  {uploadingImage["contact-image"] ? "Uploading..." : "Change Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0], ["contact", "image"]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
              <h4 className="font-semibold text-slate-700">Section Colors</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Background Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.contact?.bgColor || "#1d1d1d"}
                      onChange={(e) => updateField(["contact", "bgColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.contact?.bgColor || ""}
                      onChange={(e) => updateField(["contact", "bgColor"], e.target.value)}
                      placeholder="#1d1d1d"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Text Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.contact?.textColor || "#ffffff"}
                      onChange={(e) => updateField(["contact", "textColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.contact?.textColor || ""}
                      onChange={(e) => updateField(["contact", "textColor"], e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER TAB */}
        {activeTab === "footer" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Footer Settings</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Office Email</span>
                <input
                  value={data.footer?.email || ""}
                  onChange={(e) => updateField(["footer", "email"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Office Phone Number 1</span>
                <input
                  value={data.footer?.phone || ""}
                  onChange={(e) => updateField(["footer", "phone"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Office Phone Number 2</span>
                <input
                  value={data.footer?.phone2 || ""}
                  onChange={(e) => updateField(["footer", "phone2"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Office Phone Number 3</span>
                <input
                  value={data.footer?.phone3 || ""}
                  onChange={(e) => updateField(["footer", "phone3"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                <span className="font-semibold">Office Address</span>
                <textarea
                  value={data.footer?.address || ""}
                  onChange={(e) => updateField(["footer", "address"], e.target.value)}
                  rows="3"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700 md:col-span-2">
                <span className="font-semibold">Copyright text</span>
                <input
                  value={data.footer?.copyright || ""}
                  onChange={(e) => updateField(["footer", "copyright"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Facebook Share Page Link</span>
                <input
                  value={data.footer?.facebook || ""}
                  onChange={(e) => updateField(["footer", "facebook"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Instagram Profile Link</span>
                <input
                  value={data.footer?.instagram || ""}
                  onChange={(e) => updateField(["footer", "instagram"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">Justdial Link</span>
                <input
                  value={data.footer?.justdial || ""}
                  onChange={(e) => updateField(["footer", "justdial"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>

              <label className="block space-y-2 text-sm text-slate-700">
                <span className="font-semibold">YouTube Channel Link</span>
                <input
                  value={data.footer?.youtube || ""}
                  onChange={(e) => updateField(["footer", "youtube"], e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-slate-400"
                />
              </label>
            </div>

            <div className="space-y-2 border-t pt-4">
              <span className="block text-sm font-semibold text-slate-700">Footer Logo</span>
              <div className="flex items-center gap-4">
                {data.footer?.logo && (
                  <img
                    src={data.footer.logo}
                    alt="Footer logo"
                    className="w-20 h-20 object-contain rounded-xl border border-slate-200 bg-slate-50"
                  />
                )}
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">
                  {uploadingImage["footer-logo"] ? "Uploading..." : "Upload Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageUpload(e.target.files[0], ["footer", "logo"]);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <span className="block text-sm font-semibold text-slate-700">Our Services List (4 items)</span>
              <div className="grid gap-6 md:grid-cols-2">
                {(data.footer?.services || []).map((srv, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-3">
                    <span className="font-semibold text-xs text-slate-500 uppercase">Service {idx + 1}</span>
                    <div className="grid gap-3 grid-cols-2">
                      <label className="block space-y-1 text-sm text-slate-700">
                        <span className="font-medium">Item Label</span>
                        <input
                          value={srv?.label || ""}
                          onChange={(e) => {
                            const newSrvs = [...data.footer.services];
                            newSrvs[idx] = { ...newSrvs[idx], label: e.target.value };
                            updateField(["footer", "services"], newSrvs);
                          }}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400 text-xs"
                          placeholder="e.g. 1 BHK Flat"
                        />
                      </label>
                      <label className="block space-y-1 text-sm text-slate-700">
                        <span className="font-medium">Item Link</span>
                        <input
                          value={srv?.link || ""}
                          onChange={(e) => {
                            const newSrvs = [...data.footer.services];
                            newSrvs[idx] = { ...newSrvs[idx], link: e.target.value };
                            updateField(["footer", "services"], newSrvs);
                          }}
                          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400 text-xs"
                          placeholder="e.g. /buy or https://..."
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
              <h4 className="font-semibold text-slate-700">Section Colors</h4>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Background Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.footer?.bgColor || "#F6F6F6"}
                      onChange={(e) => updateField(["footer", "bgColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.footer?.bgColor || ""}
                      onChange={(e) => updateField(["footer", "bgColor"], e.target.value)}
                      placeholder="#F6F6F6"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
                <label className="block space-y-2 text-sm text-slate-700">
                  <span className="font-medium">Text Color</span>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={data.footer?.textColor || "#1E1E1E"}
                      onChange={(e) => updateField(["footer", "textColor"], e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={data.footer?.textColor || ""}
                      onChange={(e) => updateField(["footer", "textColor"], e.target.value)}
                      placeholder="#1E1E1E"
                      className="flex-1 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-slate-900 outline-none focus:border-slate-400 text-sm"
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-6">
          <div className="text-sm text-slate-600">
            Ensure you review each tab's details before saving.
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? "Saving Changes..." : "Save Homepage Data"}
          </button>
        </div>
      </div>
    </div>
  );
}
