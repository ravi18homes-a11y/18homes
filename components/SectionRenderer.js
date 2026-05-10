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
                    >
                      {data.buttonText}
                    </a>
                  )}
                </div>
              </section>
            );
          case "text":
            return (
              <section key={id} className="rounded-3xl bg-white p-10 shadow-sm">
                <h3
                  className="text-3xl font-semibold mb-4"
                  style={{ color: data.headingColor || "#0f172a" }}
                >
                  {data.heading}
                </h3>
                <p className="text-slate-600 leading-8">{data.body}</p>
              </section>
            );
          case "image":
            return (
              <section key={id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={data.url}
                    alt={data.alt || "Image section"}
                    className="h-72 w-full rounded-3xl object-cover sm:w-1/2"
                  />
                  <div className="space-y-3 sm:w-1/2">
                    <h3 className="text-2xl font-semibold">{data.caption}</h3>
                    <p className="text-slate-600">{data.alt}</p>
                  </div>
                </div>
              </section>
            );
          case "features":
            return (
              <section
                key={id}
                className="rounded-3xl bg-slate-950 p-10 text-white shadow-sm"
              >
                <h3 className="text-3xl font-semibold mb-6">{data.heading}</h3>
                <div
                  className={`grid gap-6 ${data.columns === 2 ? "grid-cols-2" : data.columns === 3 ? "grid-cols-3" : "grid-cols-1"}`}
                >
                  {data.items?.map((item, index) => (
                    <div key={index} className="rounded-3xl bg-slate-900 p-6">
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
                className="rounded-3xl bg-slate-900 p-10 text-center text-white shadow-sm"
              >
                <h3 className="text-3xl font-semibold mb-4">{data.ctaText}</h3>
                <a
                  href={data.ctaUrl || "#"}
                  className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900"
                >
                  {data.ctaButton}
                </a>
              </section>
            );
          case "faq":
            return (
              <section key={id} className="rounded-3xl bg-white p-10 shadow-sm">
                <h3 className="text-3xl font-semibold mb-6">FAQ</h3>
                <div className="space-y-4">
                  {data.items?.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-slate-200 p-5"
                    >
                      <p className="font-semibold">{item.question}</p>
                      <p className="text-slate-600 mt-2">{item.answer}</p>
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
