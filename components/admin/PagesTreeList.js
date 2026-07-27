"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { MoreVertical, Plus, Edit, Trash2, Globe, Shield, Sparkles, Loader2 } from "lucide-react";

const SYSTEM_PAGES_CONFIG = [
  { key: "service", title: "Service Page", slug: "service", href: "/service", mainMenu: "service", desc: "Main services showcase page (/service)" },
  { key: "blog", title: "Blog Page", slug: "blog", href: "/blog", mainMenu: "pages", desc: "Main blog listing page (/blog)" },
];

function buildTree(pages) {
  const byId = new Map(pages.map((p) => [p.id, { ...p, children: [] }]));

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId).children.push(node);
    }
  }

  const roots = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) continue;
    roots.push(node);
  }

  const sortTree = (items) => {
    items.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    for (const item of items) sortTree(item.children);
  };
  sortTree(roots);
  return roots;
}

function flatten(items, depth = 0, acc = []) {
  for (const item of items) {
    acc.push({ item, depth });
    flatten(item.children || [], depth + 1, acc);
  }
  return acc;
}

export default function PagesTreeList() {
  const router = useRouter();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/pages");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const pagesList = Array.isArray(data.pages) ? data.pages : [];
      setPages(pagesList);
      setError(null);
    } catch (err) {
      console.error("Failed to load pages:", err);
      setError(err.message);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        let msg = "Delete failed.";
        try {
          const body = await res.json();
          msg = body.error || msg;
        } catch { }
        toast.error(msg);
      } else {
        toast.success("Page deleted successfully!");
        await fetchPages();
      }
    } catch (err) {
      toast.error("Failed to delete page.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSystemPageSeo = async (sysConfig) => {
    try {
      setActionLoading(`seo_${sysConfig.slug}`);
      const res = await fetch(`/api/pages/system-page?slug=${sysConfig.slug}`);
      const json = await res.json();
      if (json.page?.id) {
        router.push(`/admin/pages/edit/${json.page.id}`);
      } else {
        toast.error("Failed to open SEO editor for system page.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error opening system page SEO editor.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddChildToSystemPage = async (sysConfig) => {
    try {
      setActionLoading(`child_${sysConfig.slug}`);
      const res = await fetch(`/api/pages/system-page?slug=${sysConfig.slug}`);
      const json = await res.json();
      if (json.page?.id) {
        router.push(`/admin/pages/new?mainMenu=${sysConfig.mainMenu}&parentId=${json.page.id}`);
      } else {
        router.push(`/admin/pages/new?mainMenu=${sysConfig.mainMenu}`);
      }
    } catch (err) {
      console.error(err);
      router.push(`/admin/pages/new?mainMenu=${sysConfig.mainMenu}`);
    } finally {
      setActionLoading(null);
    }
  };

  const sitePages = useMemo(
    () => pages.filter((p) => p.mainMenu === "pages" || p.mainMenu === "city"),
    [pages]
  );
  const siteTree = useMemo(() => buildTree(sitePages), [sitePages]);

  return (
    <div className="space-y-8 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Globe className="text-slate-700" size={28} /> Website Pages & Navigation
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage built-in system page SEO settings and add custom child pages under Service, Blog, etc.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/pages/homepage"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
          >
            Edit Homepage Settings
          </Link>
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition shadow-md"
          >
            <Plus size={18} /> Create Custom Page
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-400 flex flex-col items-center">
          <Loader2 className="animate-spin text-slate-600 mb-3" size={36} />
          <p className="text-sm font-medium">Loading website pages...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8">
          <p className="font-semibold text-rose-700">Error loading pages</p>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
        </div>
      ) : (
        <>
          {/* SECTION 1: SYSTEM & BUILT-IN PAGES */}
          <section className="overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-purple-100 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Shield size={20} className="text-purple-400" /> Built-in System Pages (Service, Blog, Home, etc.)
                </h2>
                <p className="text-xs text-purple-200 mt-0.5">
                  Content layout is built into frontend code. Edit **SEO Tags** or **+ Add Child Page** under any system route.
                </p>
              </div>
              <span className="text-xs bg-purple-900/60 px-3 py-1 rounded-full text-purple-200 border border-purple-700/50">
                {SYSTEM_PAGES_CONFIG.length} System Routes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-slate-100 text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 whitespace-nowrap py-3.5">Page Title</th>
                    <th className="px-6 whitespace-nowrap py-3.5">Route Path</th>
                    <th className="px-6 whitespace-nowrap py-3.5">Type / Description</th>
                    <th className="px-6 whitespace-nowrap py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm bg-white">
                  {SYSTEM_PAGES_CONFIG.map((sys) => {
                    // Check if this system page has child pages in MongoDB
                    const sysPageInDb = pages.find((p) => p.slug === sys.slug || p.slugSegment === sys.slug);
                    const childPages = sysPageInDb
                      ? pages.filter((p) => String(p.parentId) === String(sysPageInDb.id || sysPageInDb._id))
                      : pages.filter((p) => p.mainMenu === sys.mainMenu && p.parentId && p.slug !== sys.slug);

                    const isSeoLoading = actionLoading === `seo_${sys.slug}`;
                    const isChildLoading = actionLoading === `child_${sys.slug}`;

                    return (
                      <React.Fragment key={sys.key}>
                        <tr className="hover:bg-purple-50/30 transition">
                          <td className="px-6 whitespace-nowrap  py-4 font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-600 flex-shrink-0" />
                            <span>{sys.title}</span>
                          </td>
                          <td className="px-6 whitespace-nowrap py-4 font-mono text-xs text-slate-600">
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              {sys.href}
                            </span>
                          </td>
                          <td className="px-6 whitespace-nowrap py-4 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold text-[11px] mb-1">
                              Built-in System Page
                            </span>
                            <p>{sys.desc}</p>
                          </td>
                          <td className="px-6 whitespace-nowrap  py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit SEO Button */}
                              <button
                                onClick={() => handleEditSystemPageSeo(sys)}
                                disabled={isSeoLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                                title="Edit SEO Meta Tags"
                              >
                                {isSeoLoading ? <Loader2 size={14} className="animate-spin" /> : <Edit size={14} />}
                                <span>Edit SEO</span>
                              </button>

                              {/* Add Child Page Button */}
                              <button
                                onClick={() => handleAddChildToSystemPage(sys)}
                                disabled={isChildLoading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                                title="Add child page under this route"
                              >
                                {isChildLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                <span>+ Add Child</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Render Child Pages under System Page */}
                        {childPages.map((child) => (
                          <tr key={child.id || child._id} className="bg-slate-50/50 hover:bg-slate-100/50 transition">
                            <td className="px-6 whitespace-nowrap py-3 pl-12 font-medium text-slate-800 flex items-center gap-2 text-xs">
                              <span className="text-slate-400">↳</span>
                              <span>{child.title}</span>
                            </td>
                            <td className="px-6 whitespace-nowrap py-3 font-mono text-xs text-slate-600">
                              <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                                /{child.slug}
                              </span>
                            </td>
                            <td className="px-6 whitespace-nowrap py-3 text-xs text-slate-500">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${child.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                                }`}>
                                {child.status || "draft"}
                              </span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap  text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/admin/pages/edit/${child.id || child._id}`}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium"
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => setDeleteTarget({ id: child.id || child._id, title: child.title })}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 2: CUSTOM NAVBAR PAGES */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-900 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">Custom Dynamic Pages</h2>
                <p className="text-xs text-slate-300">
                  Custom dynamic CMS pages created via Section Builder.
                </p>
              </div>
              <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                {siteTree.length} Root Pages · {sitePages.length} Total
              </span>
            </div>

            {siteTree.length === 0 ? (
              <div className="space-y-3 px-6 py-10 text-center">
                <p className="text-slate-500 text-sm">No custom dynamic pages created yet.</p>
                <Link
                  href="/admin/pages/new"
                  className="inline-flex rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Create Custom Page
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 whitespace-nowrap py-3">Title</th>
                      <th className="px-6 whitespace-nowrap py-3">Path</th>
                      <th className="px-6 whitespace-nowrap py-3">Status</th>
                      <th className="px-6 whitespace-nowrap py-3">Navbar</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-sm">
                    {flatten(siteTree).map(({ item, depth }) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <span style={{ width: depth * 16 }} />
                            <span className="text-slate-300">{depth > 0 ? "↳" : ""}</span>
                            <span>{item.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          <code className="rounded-xl bg-slate-100 px-2 py-1 text-xs">/{item.slug}</code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                              }`}
                          >
                            {item.status || "draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {item.showInNavbar !== false ? (
                            <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-semibold">
                              Visible
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 text-slate-500 px-3 py-1 text-xs font-semibold">
                              Hidden
                            </span>
                          )}
                        </td>
                        <td className="px-6 whitespace-nowrap py-4 text-right text-sm font-medium relative">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/pages/edit/${item.id}`}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/admin/pages/new?mainMenu=${item.mainMenu || "pages"}&parentId=${item.id}`}
                              className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium"
                            >
                              + Child
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                              className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-slate-900">Delete Page</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>? Any child pages will be moved to the root level.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="rounded-full bg-rose-600 hover:bg-rose-700 px-4 py-2 text-sm font-medium text-white transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
