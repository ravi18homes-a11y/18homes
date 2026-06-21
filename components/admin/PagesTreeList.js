"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const FIXED_MENUS = [
  { key: "home", label: "Home", href: "/" },
  { key: "buy", label: "Buy", href: "/buy" },
  { key: "sell", label: "Sell", href: "/sell" },
  { key: "contact", label: "Contact", href: "/contact" },
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
    items.sort((a, b) => a.title.localeCompare(b.title));
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
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch("/api/pages");
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        if (ignore) return;
        const pagesList = Array.isArray(data.pages)
          ? data.pages
          : Array.isArray(data)
            ? data
            : [];
        setPages(pagesList);
        setError(null);
      } catch (err) {
        console.error("Failed to load pages:", err);
        if (ignore) return;
        setError(err.message);
        setPages([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const sitePages = useMemo(
    () => pages.filter((p) => p.mainMenu === "pages"),
    [pages],
  );
  const legacyPages = useMemo(
    () => pages.filter((p) => p.mainMenu !== "pages"),
    [pages],
  );

  const siteTree = useMemo(() => buildTree(sitePages), [sitePages]);

  const legacyByMenu = useMemo(() => {
    const map = { home: [], buy: [], sell: [], contact: [] };
    for (const p of legacyPages) {
      if (map[p.mainMenu]) map[p.mainMenu].push(p);
    }
    for (const k of Object.keys(map)) {
      map[k] = buildTree(map[k]);
    }
    return map;
  }, [legacyPages]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      const pagesList = Array.isArray(data.pages)
        ? data.pages
        : Array.isArray(data)
          ? data
          : [];
      setPages(pagesList);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh pages:", err);
      setError(err.message);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        let msg = "Delete failed.";
        try {
          const body = await res.json();
          msg = body.error || msg;
        } catch {
          /* ignore */
        }
        toast.error(msg);
      } else {
        toast.success("Page deleted successfully!");
        await refresh();
      }
    } catch (err) {
      toast.error("Failed to delete page. Connection error.");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (tree, menuKey) => {
    const rows = flatten(tree);
    if (rows.length === 0) {
      return (
        <div className="px-6 py-10 text-center text-sm text-slate-500">
          No pages here yet.
        </div>
      );
    }
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Path
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Navbar
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {rows.map(({ item, depth }) => (
              <tr key={item.id}>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block"
                      style={{ width: depth * 16 }}
                    />
                    <span className="text-slate-300">{depth > 0 ? "↳" : ""}</span>
                    <span>{item.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <code className="rounded-xl bg-slate-100 px-2 py-1">/{item.slug}</code>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "published"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status || "draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
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
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/admin/pages/edit/${item.id}`}
                    className="mr-3 text-slate-900 hover:text-slate-700"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/pages/new?parentId=${item.id}`}
                    className="mr-3 text-indigo-600 hover:text-indigo-800"
                  >
                    Add child
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                    className="text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Pages</h1>
          <p className="mt-1 text-sm text-slate-600">
            Site pages appear in the main navbar after Contact. Add nested
            pages with <strong>Add child</strong> on any row.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/pages/homepage"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Edit Homepage
          </Link>
          <Link
            href="/admin/pages/new"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Create page
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
          Loading pages…
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8">
          <p className="font-semibold text-rose-700">Error loading pages</p>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Navbar — after Contact</h2>
                <p className="text-sm text-slate-300">
                  Published pages here show in the header after Contact (max 7 active root pages shown, newest first).
                </p>
              </div>
              <span className="text-sm text-slate-300">
                {siteTree.length} root · {sitePages.length} total
              </span>
            </div>
            {siteTree.length === 0 ? (
              <div className="space-y-4 px-6 py-12 text-center">
                <p className="text-slate-600">
                  Create your first site page. It will appear in the navigation
                  bar after Contact.
                </p>
                <Link
                  href="/admin/pages/new"
                  className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Create first page
                </Link>
              </div>
            ) : (
              renderTable(siteTree, "pages")
            )}
          </section>

          {legacyPages.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
              Older pages were tied to Home / Buy / Sell / Contact paths. They
              stay in the list below; new work should use{" "}
              <strong>Navbar — after Contact</strong> above.
            </div>
          )}

          {legacyPages.length > 0 &&
            FIXED_MENUS.map((menu) => {
              const items = legacyByMenu[menu.key] || [];
              if (items.length === 0) return null;
              return (
                <section
                  key={menu.key}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
                        Legacy · {menu.label}
                      </span>
                      <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        {menu.href}
                      </code>
                    </div>
                  </div>
                  {renderTable(items, menu.key)}
                </section>
              );
            })}
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
