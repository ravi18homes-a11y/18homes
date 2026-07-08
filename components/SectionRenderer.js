export default function SectionRenderer({ sections = [] }) {
  if (!sections.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
        No sections defined yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const { id, type, data } = section;
        switch (type) {
          case "hero":
            return (
              <section
                key={id}
                className="rounded-3xl overflow-hidden shadow-sm"
                style={{ backgroundColor: data.backgroundColor || "#0f172a" }}
              >
                <div
                  className="px-6 py-16 text-center sm:px-12"
                  style={{ color: data.textColor || "#f8fafc" }}
                >
                  <h2 className="text-4xl font-semibold mb-4">{data.title}</h2>
                  <p className="mx-auto max-w-2xl text-lg opacity-90">
                    {data.subtitle}
                  </p>
                  {data.buttonText && (
                    <a
                      href={data.buttonUrl || "#"}
                      className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg"
                      style={{
                        backgroundColor: data.textColor || "#ffffff",
                        color: data.backgroundColor || "#0f172a",
                      }}
                    >
                      {data.buttonText}
                    </a>
                  )}
                </div>
              </section>
            );
          case "text":
            return (
              <section
                key={id}
                className="rounded-3xl p-10 shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#ffffff",
                  color: data.textColor || "#0f172a",
                }}
              >
                <h3
                  className="text-3xl font-semibold mb-4"
                  style={{ color: data.headingColor || data.textColor || "#0f172a" }}
                >
                  {data.heading}
                </h3>
                {data.contentType === "list" ? (
                  data.listStyle === "disc" ? (
                    <ul
                      className="space-y-2 leading-8 opacity-90 pl-6 list-disc"
                      style={{ listStyleType: "disc" }}
                    >
                      {(data.listItems || []).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <ol
                      className="space-y-2 leading-8 opacity-90 pl-6"
                      style={{ listStyleType: data.listStyle || "decimal" }}
                    >
                      {(data.listItems || []).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ol>
                  )
                ) : (
                  <p className="leading-8 opacity-90" style={{ whiteSpace: "pre-wrap" }}>
                    {data.body}
                  </p>
                )}
              </section>
            );
          case "image":
            return (
              <section
                key={id}
                className="rounded-3xl p-6 shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#ffffff",
                  color: data.textColor || "#0f172a",
                }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={data.url}
                    alt={data.alt || "Image section"}
                    className="h-72 w-full rounded-3xl object-cover sm:w-1/2"
                  />
                  <div className="space-y-3 sm:w-1/2">
                    <h3 className="text-2xl font-semibold">{data.caption}</h3>
                    <p className="opacity-80">{data.alt}</p>
                  </div>
                </div>
              </section>
            );
          case "features":
            return (
              <section
                key={id}
                className="rounded-3xl p-10 shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#020617",
                  color: data.textColor || "#ffffff",
                }}
              >
                <h3 className="text-3xl font-semibold mb-6">{data.heading}</h3>
                <div
                  className={`grid gap-6 ${data.columns === 2 ? "grid-cols-2" : data.columns === 3 ? "grid-cols-3" : "grid-cols-1"}`}
                >
                  {data.items?.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-3xl p-6"
                      style={{
                        backgroundColor: data.backgroundColor ? "rgba(255, 255, 255, 0.08)" : "#0f172a",
                        color: data.textColor || "#ffffff",
                      }}
                    >
                      <p className="text-lg">{item}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          case "cta":
            return (
              <section
                key={id}
                className="rounded-3xl p-10 text-center shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#0f172a",
                  color: data.textColor || "#ffffff",
                }}
              >
                <h3 className="text-3xl font-semibold mb-4">{data.ctaText}</h3>
                <a
                  href={data.ctaUrl || "#"}
                  className="inline-flex rounded-full px-6 py-3 text-sm font-semibold shadow-lg"
                  style={{
                    backgroundColor: data.textColor || "#ffffff",
                    color: data.backgroundColor || "#0f172a",
                  }}
                >
                  {data.ctaButton}
                </a>
              </section>
            );
          case "faq":
            return (
              <section
                key={id}
                className="rounded-3xl p-10 shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#ffffff",
                  color: data.textColor || "#0f172a",
                }}
              >
                <h3 className="text-3xl font-semibold mb-6">FAQ</h3>
                <div className="space-y-4">
                  {data.items?.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border p-5"
                      style={{
                        borderColor: data.textColor ? "rgba(255, 255, 255, 0.15)" : "#e2e8f0",
                      }}
                    >
                      <p className="font-semibold">{item.question}</p>
                      <p className="opacity-80 mt-2">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          default:
            return (
              <section
                key={id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-slate-600">Unknown section type: {type}</p>
              </section>
            );
        }
      })}
    </div>
  );
}
