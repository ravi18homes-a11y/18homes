"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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
    if (!window.confirm("Delete this page? Children will move to root.")) {
      return;
    }
    const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      let msg = "Delete failed.";
      try {
        const body = await res.json();
        msg = body.error || msg;
      } catch {
        /* ignore */
      }
      window.alert(msg);
      return;
    }
    await refresh();
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
                    onClick={() => handleDelete(item.id)}
                    className="text-rose-600 hover:text-rose-800"
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
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Create page
        </Link>
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
                  Published pages here show in the header after Contact, with
                  hover menus for children.
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
    </div>
  );
}
