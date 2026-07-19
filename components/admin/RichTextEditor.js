"use client";

import { useEffect, useRef } from "react";

export default function RichTextEditor({ value, onChange }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isChangingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let active = true;

    const initQuill = async () => {
      const { default: Quill } = await import("quill");
      await import("quill/dist/quill.snow.css");

      if (!active) return;
      if (quillRef.current) return; // Prevent double initialization

      const quill = new Quill(containerRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["link", "image"],
            ["clean"],
          ],
        },
      });

      quillRef.current = quill;

      if (value) {
        quill.root.innerHTML = value;
      }

      quill.on("text-change", () => {
        if (!active) return;
        isChangingRef.current = true;
        const html = quill.root.innerHTML;
        const normalized = html === "<p><br></p>" ? "" : html;
        onChange(normalized);
        // Reset the changing flag after state update cycle
        setTimeout(() => {
          isChangingRef.current = false;
        }, 0);
      });
    };

    initQuill();

    return () => {
      active = false;
      quillRef.current = null;
    };
  }, []);

  // Update value if changed from outside (e.g. initial load or template change),
  // but avoid updating if it is a self-triggered change to prevent cursor jumping
  useEffect(() => {
    if (quillRef.current && !isChangingRef.current) {
      const currentHtml = quillRef.current.root.innerHTML;
      const normalizedCurrent = currentHtml === "<p><br></p>" ? "" : currentHtml;
      const normalizedValue = value === "<p><br></p>" ? "" : (value || "");

      if (normalizedValue !== normalizedCurrent) {
        quillRef.current.root.innerHTML = normalizedValue;
      }
    }
  }, [value]);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div ref={containerRef} className="min-h-[220px]" />
    </div>
  );
}
