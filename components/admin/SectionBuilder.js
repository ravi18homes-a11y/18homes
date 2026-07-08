"use client";

import { useMemo, useState } from "react";

const sectionTemplates = {
  hero: {
    title: "Hero title",
    subtitle: "A short introduction for the hero section.",
    buttonText: "Learn more",
    buttonUrl: "#",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
  },
  text: {
    heading: "Section heading",
    contentType: "text",
    body: "Write a text block with rich content and details.",
    listStyle: "disc",
    listItems: ["First item", "Second item", "Third item"],
    headingColor: "#0f172a",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
  },
  image: {
    url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    alt: "Visual showcase",
    caption: "Highlight your product with a strong image.",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
  },
  features: {
    heading: "Features grid",
    items: ["Fast", "Flexible", "Beautiful"],
    columns: 3,
    backgroundColor: "#020617",
    textColor: "#ffffff",
  },
  cta: {
    ctaText: "Ready to get started?",
    ctaButton: "Contact sales",
    ctaUrl: "#",
    backgroundColor: "#0f172a",
    textColor: "#ffffff",
  },
  faq: {
    items: [
      {
        question: "How does the builder work?",
        answer: "Use sections, SEO, and save your page.",
      },
      {
        question: "Can I edit SEO metadata?",
        answer: "Yes, the SEO panel includes title, description, OG, and more.",
      },
    ],
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
  },
};

function createSection(type, index) {
  return {
    id: `${type}-${Date.now()}-${index}`,
    type,
    data: sectionTemplates[type] || {},
  };
}

function toRoman(num) {
  const roman = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  };
  let str = '';
  for (let i of Object.keys(roman)) {
    let q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }
  return str;
}

function SectionConfig({ section, onUpdate }) {
  const { type, data } = section;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    onUpdate({ ...section, data: { ...data, [field]: value } });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage("Uploading image...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (res.ok) {
        onUpdate({ ...section, data: { ...data, url: result.url } });
        setUploadMessage("Image uploaded successfully!");
      } else {
        setUploadMessage(`Upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      setUploadMessage("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadMessage(""), 3000);
    }
  };

  const handleListUpdate = (field) => (event) => {
    const value = event.target.value.split("\n").filter(Boolean);
    onUpdate({ ...section, data: { ...data, [field]: value } });
  };

  const handleFaqUpdate = (index, field) => (event) => {
    const next = data.items.map((item, idx) =>
      idx === index ? { ...item, [field]: event.target.value } : item,
    );
    onUpdate({ ...section, data: { ...data, items: next } });
  };

  return (
    <div className="space-y-4 rounded-3xl bg-slate-50 p-5 shadow-inner">
      {type === "hero" && (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Headline
          </label>
          <input
            value={data.title}
            onChange={handleChange("title")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          />
          <label className="block text-sm font-medium text-slate-700">
            Subheadline
          </label>
          <textarea
            value={data.subtitle}
            onChange={handleChange("subtitle")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            rows={3}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Button text
            </label>
            <input
              value={data.buttonText}
              onChange={handleChange("buttonText")}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            />
            <label className="block text-sm font-medium text-slate-700">
              Button URL
            </label>
            <input
              value={data.buttonUrl}
              onChange={handleChange("buttonUrl")}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            />
          </div>
        </>
      )}

      {type === "text" && (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Heading
          </label>
          <input
            value={data.heading}
            onChange={handleChange("heading")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          />
          
          {/* Content Type Selector */}
          <div className="space-y-2 mt-4">
            <span className="block text-sm font-medium text-slate-700">Content Type</span>
            <div className="flex bg-slate-200/60 p-0.5 rounded-full w-max">
              <button
                type="button"
                onClick={() => onUpdate({ ...section, data: { ...data, contentType: "text" } })}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  (data.contentType || "text") === "text"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📄 Paragraph Text
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ ...section, data: { ...data, contentType: "list" } })}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  data.contentType === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📝 Point-wise List
              </button>
            </div>
          </div>

          {(data.contentType || "text") === "text" ? (
            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium text-slate-700">
                Body copy
              </label>
              <textarea
                value={data.body || ""}
                onChange={handleChange("body")}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
                rows={4}
                placeholder="Write your text block here. New lines and spaces will be preserved exactly as typed on the webpage."
              />
              <p className="text-xs text-slate-500 mt-1">
                💡 Formatting like paragraph breaks and line breaks will be preserved exactly as you write.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mt-4 rounded-2xl border border-slate-200/60 p-4 bg-white">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  List Style Type
                </label>
                <select
                  value={data.listStyle || "disc"}
                  onChange={handleChange("listStyle")}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-slate-400 outline-none"
                >
                  <option value="disc">Bullet / Disc (•)</option>
                  <option value="decimal">Numbered (1, 2, 3)</option>
                  <option value="upper-roman">Roman Uppercase (I, II, III)</option>
                  <option value="lower-roman">Roman Lowercase (i, ii, iii)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  List Items / Points
                </label>
                <div className="space-y-2.5">
                  {(data.listItems || ["", "", ""]).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs font-semibold w-7 text-right select-none">
                        {data.listStyle === "upper-roman"
                          ? `${toRoman(idx + 1)}.`
                          : data.listStyle === "lower-roman"
                          ? `${toRoman(idx + 1).toLowerCase()}.`
                          : (data.listStyle || "disc") === "decimal"
                          ? `${idx + 1}.`
                          : "•"}
                      </span>
                      <input
                        value={item}
                        onChange={(e) => {
                          const nextItems = [...(data.listItems || ["", "", ""])];
                          nextItems[idx] = e.target.value;
                          onUpdate({ ...section, data: { ...data, listItems: nextItems } });
                        }}
                        placeholder={`Enter list item ${idx + 1}`}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2.5 text-sm"
                      />
                      {(data.listItems || ["", "", ""]).length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const nextItems = (data.listItems || ["", "", ""]).filter((_, i) => i !== idx);
                            onUpdate({ ...section, data: { ...data, listItems: nextItems } });
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition cursor-pointer"
                          title="Delete item"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const currentItems = data.listItems || ["", "", ""];
                    onUpdate({ ...section, data: { ...data, listItems: [...currentItems, ""] } });
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full px-4 py-2 transition cursor-pointer"
                >
                  <span>➕</span> Add Point
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {type === "image" && (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Image Upload
          </label>
          <div className="flex flex-col gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            />
            {uploadMessage && (
              <p className={`text-sm ${uploadMessage.includes('failed') || uploadMessage.includes('error') ? 'text-red-500' : 'text-green-600'}`}>
                {uploadMessage}
              </p>
            )}
            {data.url && (
              <div className="mt-2 rounded-xl border border-slate-200 p-2 bg-slate-50 inline-block w-max">
                <img src={data.url} alt="Preview" className="h-32 w-auto object-cover rounded-lg" />
              </div>
            )}
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Alt text
          </label>
          <input
            value={data.alt}
            onChange={handleChange("alt")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          />
          <label className="block text-sm font-medium text-slate-700">
            Caption
          </label>
          <textarea
            value={data.caption}
            onChange={handleChange("caption")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            rows={3}
          />
        </>
      )}

      {type === "features" && (
        <>
          <label className="block text-sm font-medium text-slate-700">
            Heading
          </label>
          <input
            value={data.heading}
            onChange={handleChange("heading")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          />
          <label className="block text-sm font-medium text-slate-700">
            Features (one per line)
          </label>
          <textarea
            value={data.items.join("\n")}
            onChange={handleListUpdate("items")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
            rows={4}
          />
          <label className="block text-sm font-medium text-slate-700">
            Columns
          </label>
          <select
            value={data.columns}
            onChange={handleChange("columns")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </>
      )}

      {type === "cta" && (
        <>
          <label className="block text-sm font-medium text-slate-700">
            CTA text
          </label>
          <input
            value={data.ctaText}
            onChange={handleChange("ctaText")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          />
          <label className="block text-sm font-medium text-slate-700">
            Button label
          </label>
          <input
            value={data.ctaButton}
            onChange={handleChange("ctaButton")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          />
          <label className="block text-sm font-medium text-slate-700">
            Button URL
          </label>
          <input
            value={data.ctaUrl}
            onChange={handleChange("ctaUrl")}
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3"
          />
        </>
      )}

      {type === "faq" && (
        <>
          <div className="space-y-4">
            {data.items.map((item, index) => (
              <div
                key={index}
                className="rounded-3xl border border-slate-200 bg-white p-4"
              >
                <label className="block text-sm font-medium text-slate-700">
                  Question
                </label>
                <input
                  value={item.question}
                  onChange={handleFaqUpdate(index, "question")}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                />
                <label className="mt-3 block text-sm font-medium text-slate-700">
                  Answer
                </label>
                <textarea
                  value={item.answer}
                  onChange={handleFaqUpdate(index, "answer")}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
                  rows={3}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Color Customization Panel */}
      <div className="border-t border-slate-200/60 pt-4 mt-6">
        <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
          <span>🎨</span> Section Styling Colors
        </h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Background Color */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600">Background Color</label>
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full border border-slate-200 overflow-hidden cursor-pointer flex-shrink-0">
                <input
                  type="color"
                  value={data.backgroundColor || (type === "hero" || type === "cta" ? "#0f172a" : type === "features" ? "#020617" : "#ffffff")}
                  onChange={handleChange("backgroundColor")}
                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none p-0"
                />
              </div>
              <input
                type="text"
                value={data.backgroundColor || ""}
                onChange={handleChange("backgroundColor")}
                placeholder="HEX color e.g. #ffffff"
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600">Text/Foreground Color</label>
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full border border-slate-200 overflow-hidden cursor-pointer flex-shrink-0">
                <input
                  type="color"
                  value={data.textColor || (type === "hero" || type === "cta" || type === "features" ? "#ffffff" : "#0f172a")}
                  onChange={handleChange("textColor")}
                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none p-0"
                />
              </div>
              <input
                type="text"
                value={data.textColor || ""}
                onChange={handleChange("textColor")}
                placeholder="HEX color e.g. #0f172a"
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SectionBuilder({ sections = [], onChange }) {
  const [notification, setNotification] = useState(null);

  const preview = useMemo(
    () => sections.map((section) => ({ id: section.id, type: section.type })),
    [sections],
  );

  const handleAdd = (type) => {
    const next = [...sections, createSection(type, sections.length)];
    onChange(next);

    setNotification(`${type.replace("-", " ")} section added! Scroll down to modify it.`);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const updateSection = (index, nextSection) => {
    const next = [...sections];
    next[index] = nextSection;
    onChange(next);
  };

  const removeSection = (index) => {
    const next = sections.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const reorder = (index, direction) => {
    const next = [...sections];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= next.length) {
      return;
    }
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-6 relative">
      {notification && (
        <div className="sticky top-4 z-50 mx-auto w-max max-w-md rounded-full bg-green-100 px-6 py-3 text-sm font-semibold text-green-800 shadow-md transition-all duration-300">
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="capitalize">{notification}</span>
          </span>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(sectionTemplates).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleAdd(type)}
            className="rounded-3xl border border-slate-200 cursor-pointer bg-white px-4 py-5 text-left shadow-sm transition hover:border-slate-300"
          >
            <h3 className="font-semibold capitalize">
              {type.replace("-", " ")}
            </h3>
            <p className="mt-2 text-sm text-slate-500">Add a {type} section.</p>
          </button>
        ))}
      </div>

      {!sections.length && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
          Start by adding a section type above.
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Section {index + 1}</p>
                <h2 className="text-xl font-semibold capitalize">
                  {section.type.replace("-", " ")}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => reorder(index, "up")}
                  className="rounded-full cursor-pointer border border-slate-200 bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => reorder(index, "down")}
                  className="rounded-full border cursor-pointer border-slate-200 bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200"
                >
                  Move down
                </button>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="rounded-full border cursor-pointer border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            </div>
            <SectionConfig
              section={section}
              onUpdate={(next) => updateSection(index, next)}
            />
          </div>
        ))}
      </div>

      {preview.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <strong className="block text-slate-900">Section preview</strong>
          {preview.map((item) => (
            <div key={item.id} className="mt-2">
              {item.type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
