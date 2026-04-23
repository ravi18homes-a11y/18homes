"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";

export default function AdminPages({ initialPages }) {
  const [pages, setPages] = useState(initialPages);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = pages.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = (id) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  const handleToggleStatus = (id) => {
    setPages((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "published" ? "draft" : "published" }
          : p
      )
    );
  };

  return (
    <>
      <Head>
        <title>Pages Manager — Admin Dashboard</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="flex min-h-screen bg-white text-gray-800 font-[DM Sans]">

        {/* Main */}
        <main className=" flex-1 p-8">

          {/* Top */}
          <div className="flex justify-between mb-6">
            <div>
              <h1 className="text-3xl font-extrabold font-[Syne] text-black">Pages</h1>
              <p className="text-sm text-gray-500">Manage your dynamic content pages</p>
            </div>

            <Link href="/admin/pages/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#f5a623] to-[#e8841a] text-white font-semibold shadow-lg hover:-translate-y-1 transition">
              + Create New Page
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Pages", value: pages.length, color: "#f5a623" },
              { label: "Published", value: pages.filter(p => p.status === "published").length, color: "#4ade80" },
              { label: "Drafts", value: pages.filter(p => p.status === "draft").length, color: "#94a3b8" },
              { label: "This Month", value: pages.filter(p => p.createdAt.startsWith("2026-03")).length, color: "#60a5fa" }
            ].map(s => (
              <div key={s.label} className="bg-gray-100 border border-gray-300 rounded-xl p-5">
                <div className="text-3xl font-extrabold font-[Syne]" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3 mb-5">
            <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg px-4 flex-1">
              <span className="text-gray-400 text-lg">⌕</span>
              <input
                className="bg-transparent outline-none px-2 py-2 w-full text-sm"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              {["all", "published", "draft"].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    filter === f
                      ? "border-[#f5a623] text-[#f5a623] bg-[#f5a623]/10"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-300 text-xs text-gray-400 uppercase">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th>Slug</th>
                  <th>Tags</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map(page => (
                  <tr key={page.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 flex gap-3 items-center">
                      <div className="w-12 h-9 rounded bg-cover" style={{ backgroundImage: `url(${page.coverImage})` }} />
                      <div>
                        <div className="text-black">{page.title}</div>
                        <div className="text-xs text-gray-500">{page.subtitle}</div>
                      </div>
                    </td>

                    <td><code className="bg-gray-100 px-2 py-1 text-xs rounded">/{page.slug}</code></td>

                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {page.tags?.slice(0,2).map(t => (
                          <span key={t} className="bg-gray-100 px-2 py-1 text-xs rounded-full">{t}</span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <button
                        onClick={() => handleToggleStatus(page.id)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          page.status === "published"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {page.status}
                      </button>
                    </td>

                    <td className="text-sm text-gray-500">{page.updatedAt}</td>

                    <td className="flex gap-2">
                      <Link href={`/blog/${page.slug}`} target="_blank" className="p-2 border border-gray-300 rounded">↗</Link>
                      <Link href={`/admin/pages/edit/${page.id}`} className="p-2 border border-gray-300 rounded">✎</Link>
                      <button onClick={() => setDeleteConfirm(page.id)} className="p-2 border border-gray-300 rounded text-red-500">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 text-sm text-gray-500 border-t border-gray-300">
              Showing {filtered.length} of {pages.length}
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white border border-gray-300 p-8 rounded-2xl text-center w-[400px]">
            <h3 className="text-xl mb-3 text-black">Delete?</h3>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-200 p-2 rounded">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white p-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}