"use client";
import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TOOLBAR_BUTTONS = [
  { cmd: "bold", icon: "B", title: "Bold" },
  { cmd: "italic", icon: "I", title: "Italic" },
  { cmd: "underline", icon: "U", title: "Underline" },
  { cmd: "formatBlock", value: "h2", icon: "H2", title: "Heading 2" },
  { cmd: "formatBlock", value: "h3", icon: "H3", title: "Heading 3" },
  { cmd: "insertUnorderedList", icon: "≡", title: "Bullet List" },
  { cmd: "insertOrderedList", icon: "①", title: "Numbered List" },
  { cmd: "createLink", icon: "🔗", title: "Insert Link", prompt: true },
  { cmd: "removeFormat", icon: "✕f", title: "Clear Format" },
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function NewPage() {
  const router = useRouter();
  const editorRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [slugManual, setSlugManual] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    heading: "",
    description: "",
    content: "",
    slug: "",
    coverImage: "",
    metaTitle: "",
    metaDescription: "",
    tags: [],
    author: "Admin",
    status: "draft",
    stats: [{ label: "", value: "" }],
    services: [{ icon: "", label: "" }],
  });

  useEffect(() => {
    if (!slugManual && form.title) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.title) }));
    }
  }, [form.title]);

  useEffect(() => {
    if (!form.metaTitle && form.title) {
      setForm((prev) => ({
        ...prev,
        metaTitle: form.title + " | Kushel Digi",
      }));
    }
  }, [form.title]);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const execCmd = (cmd, value = null) => {
    if (cmd === "createLink") {
      const url = prompt("Enter URL:");
      if (url) document.execCommand("createLink", false, url);
    } else {
      document.execCommand(cmd, false, value);
    }
    editorRef.current?.focus();
  };

  const syncContent = () => {
    if (editorRef.current) {
      set("content", editorRef.current.innerHTML);
    }
  };

  return (
    <>
      <Head>
        <title>Create Page</title>
      </Head>

      <div className="min-h-screen flex flex-col bg-white text-gray-800 font-sans">

        {/* Topbar */}
        <header className="flex justify-between items-center px-6 py-3 bg-gray-100 border-b border-gray-300 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Link href="/admin/allpages" className="text-gray-500 hover:text-black text-sm">
              ← Back
            </Link>
            <div className="w-[1px] h-5 bg-gray-300" />
            <h1 className="font-bold text-lg text-black">Create New Page</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs bg-gray-200 px-3 py-1 rounded font-mono text-gray-600">
              /blog/{form.slug || "slug"}
            </div>

            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3 py-1 rounded bg-gray-200 border border-gray-300 text-gray-600 hover:text-black"
            >
              {previewMode ? "Edit" : "Preview"}
            </button>

            <button
              onClick={() => setSaving(true)}
              className="px-4 py-1 rounded bg-gray-200 border text-gray-600"
            >
              Draft
            </button>

            <button
              onClick={() => setSaving(true)}
              className="px-4 py-1 rounded bg-gradient-to-r from-[#f5a623] to-[#e8841a] text-white font-semibold"
            >
              Publish
            </button>
          </div>
        </header>

        {/* Layout */}
        <div className="grid grid-cols-[1fr_300px] flex-1">

          {/* MAIN */}
          <div className="border-r border-gray-300 flex flex-col">

            {/* Tabs */}
            <div className="flex border-b border-gray-300 bg-gray-100 px-6">
              {["content", "seo", "stats"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm ${
                    activeTab === tab
                      ? "text-[#f5a623] border-b-2 border-[#f5a623]"
                      : "text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* CONTENT TAB */}
            <div className="p-6 overflow-y-auto">

              <input
                className="w-full p-3 bg-white border border-gray-300 rounded mb-4"
                placeholder="Title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />

              <textarea
                className="w-full p-3 bg-white border border-gray-300 rounded mb-4"
                placeholder="Description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />

              {/* Editor */}
              <div className="border border-gray-300 rounded bg-white">
                <div className="flex gap-2 p-2 border-b border-gray-300">
                  {TOOLBAR_BUTTONS.map((btn) => (
                    <button
                      key={btn.icon}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        execCmd(btn.cmd, btn.value);
                      }}
                      className="px-2 py-1 bg-gray-200 rounded text-sm"
                    >
                      {btn.icon}
                    </button>
                  ))}
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  onInput={syncContent}
                  className="p-4 min-h-[300px]"
                />
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="bg-gray-50 p-4 space-y-4">

            <div className="bg-white p-4 rounded border border-gray-300">
              <h3 className="text-sm mb-3">Publish</h3>

              <select
                className="w-full p-2 bg-white border border-gray-300 rounded"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>

              <button className="w-full mt-3 bg-gradient-to-r from-[#f5a623] to-[#e8841a] py-2 rounded text-white">
                Publish Page
              </button>
            </div>

            <div className="bg-white p-4 rounded border border-gray-300">
              <h3 className="text-sm mb-2">Checklist</h3>

              {[
                form.title,
                form.slug,
                form.content,
                form.metaDescription,
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span>{item ? "Done" : "Pending"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}