export default function SectionRenderer({ sections = [] }) {
  if (!sections.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
        No sections defined yet.
      </div>
    );
  }

  // Pre-calculate heading tags for each section to enforce SEO hierarchy
  // "first heading h1 and second h2 and there should be two h2 then h3 then h4"
  const headingTags = ["h1", "h2", "h2", "h3", "h4", "h5", "h6"];
  let headingCount = 0;

  const getHeadingTag = (hasHeading) => {
    if (!hasHeading) return "h2";
    const tag = headingTags[headingCount] || "h6";
    headingCount++;
    return tag;
  };

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const { id, type, data } = section;
        switch (type) {
          case "hero": {
            const hasHeading = Boolean(data.title);
            const HeadingTag = data.headingTag || getHeadingTag(hasHeading);
            return (
              <section
                key={id}
                className="relative rounded-3xl overflow-hidden shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#0f172a",
                  backgroundImage: data.bgImage ? `url(${data.bgImage})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {data.bgImage && (
                  <div className="absolute inset-0 bg-black/45 z-0 pointer-events-none" />
                )}
                <div
                  className="relative z-10 px-6 py-16 text-center sm:px-12"
                  style={{ color: data.textColor || "#f8fafc" }}
                >
                  {data.title && (
                    <HeadingTag className="text-4xl font-semibold mb-4">{data.title}</HeadingTag>
                  )}
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
          }
          case "text": {
            const hasHeading = Boolean(data.heading);
            const HeadingTag = data.headingTag || getHeadingTag(hasHeading);
            return (
              <section
                key={id}
                className="rounded-3xl p-10 shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#ffffff",
                  color: data.textColor || "#0f172a",
                }}
              >
                {data.heading && (
                  <HeadingTag
                    className="text-3xl font-semibold mb-4"
                    style={{ color: data.headingColor || data.textColor || "#0f172a" }}
                  >
                    {data.heading}
                  </HeadingTag>
                )}
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
                  <div
                    className="rich-text-content leading-8 opacity-90"
                    dangerouslySetInnerHTML={{ __html: data.body || "" }}
                  />
                )}
              </section>
            );
          }
          case "image": {
            const hasHeading = Boolean(data.caption);
            const HeadingTag = data.headingTag || getHeadingTag(hasHeading);
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
                    {data.caption && (
                      <HeadingTag className="text-2xl font-semibold">{data.caption}</HeadingTag>
                    )}
                    <p className="opacity-80">{data.alt}</p>
                  </div>
                </div>
              </section>
            );
          }
          case "features": {
            const hasHeading = Boolean(data.heading);
            const HeadingTag = data.headingTag || getHeadingTag(hasHeading);
            return (
              <section
                key={id}
                className="rounded-3xl p-10 shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#020617",
                  color: data.textColor || "#ffffff",
                }}
              >
                {data.heading && (
                  <HeadingTag className="text-3xl font-semibold mb-6">{data.heading}</HeadingTag>
                )}
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
          }
          case "cta": {
            const hasHeading = Boolean(data.ctaText);
            const HeadingTag = data.headingTag || getHeadingTag(hasHeading);
            return (
              <section
                key={id}
                className="rounded-3xl p-10 text-center shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#0f172a",
                  color: data.textColor || "#ffffff",
                }}
              >
                {data.ctaText && (
                  <HeadingTag className="text-3xl font-semibold mb-4">{data.ctaText}</HeadingTag>
                )}
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
          }
          case "faq": {
            const HeadingTag = data.headingTag || getHeadingTag(true);
            return (
              <section
                key={id}
                className="rounded-3xl p-10 shadow-sm"
                style={{
                  backgroundColor: data.backgroundColor || "#ffffff",
                  color: data.textColor || "#0f172a",
                }}
              >
                <HeadingTag className="text-3xl font-semibold mb-6">FAQ</HeadingTag>
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
                      <div
                        className="rich-text-content opacity-80 mt-2"
                        dangerouslySetInnerHTML={{ __html: item.answer || "" }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          }
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
