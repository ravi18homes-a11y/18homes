"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";

export const MainBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/blogs")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.blogs) {
          setBlogs(data.blogs);
        }
      })
      .catch((err) => console.error("Error fetching blogs:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="w-full py-16 bg-slate-50 min-h-[60vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold tracking-wide">
            <BookOpen size={16} /> Latest Articles & News
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Our Insights & Blogs
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Stay updated with expert advice, market trends, property guides, and real estate investment tips.
          </p>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin text-emerald-600 mb-3" size={40} />
            <p className="text-sm font-medium">Loading blog articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-slate-800">No Blog Posts Available Currently</h3>
            <p className="text-slate-500 text-sm mt-2">Please check back later for exciting new articles.</p>
          </div>
        ) : (
          /* GRID OF CARDS */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => {
              const linkTarget = blog.link && blog.link.trim() ? blog.link.trim() : `/blog/${blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
              const isExternal = linkTarget.startsWith("http://") || linkTarget.startsWith("https://");

              return (
                <div
                  key={blog.id || blog._id || index}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden flex flex-col transition-all duration-300 transform hover:-translate-y-1.5"
                >
                  {/* CARD IMAGE */}
                  <div className="relative w-full h-52 overflow-hidden bg-slate-100">
                    <img
                      src={
                        blog.image ||
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800"
                      }
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* CARD BODY */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                        {blog.description}
                      </p>
                    </div>

                    {/* CARD LINK BUTTON */}
                    {isExternal ? (
                      <a
                        href={linkTarget}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between w-full pt-3 text-emerald-600 font-semibold text-sm border-t border-slate-100 group-hover:text-emerald-700 transition-colors"
                      >
                        <span>Read Full Article</span>
                        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                      </a>
                    ) : (
                      <Link
                        href={linkTarget}
                        className="inline-flex items-center justify-between w-full pt-3 text-emerald-600 font-semibold text-sm border-t border-slate-100 group-hover:text-emerald-700 transition-colors"
                      >
                        <span>Read Full Article</span>
                        <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
