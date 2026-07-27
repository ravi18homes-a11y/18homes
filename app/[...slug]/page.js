import SectionRenderer from "@/components/SectionRenderer";
import { getPageBySlug, getChildPagesByParentId } from "@/lib/store";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Navbar from "../COMMON/Navbar";
import Footer from "../COMMON/Footer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug: slugParts } = await params;
  const slugPath = Array.isArray(slugParts)
    ? slugParts.join("/")
    : String(slugParts || "");
  const page = await getPageBySlug(slugPath);
  if (!page) {
    return { title: "Page not found" };
  }
  const seo = page.seo || {};
  return {
    title: seo.metaTitle || page.title,
    description: seo.metaDescription || "",
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: seo.openGraphTitle || seo.metaTitle || page.title,
      description:
        seo.openGraphDescription || seo.metaDescription || undefined,
      images: seo.openGraphImage ? [seo.openGraphImage] : undefined,
    },
  };
}

export default async function CmsSlugPage({ params }) {
  const { slug: slugParts } = await params;
  const slugPath = Array.isArray(slugParts)
    ? slugParts.join("/")
    : String(slugParts || "");
  const page = await getPageBySlug(slugPath);
  if (!page) {
    notFound();
  }

  const childPages = await getChildPagesByParentId(page.id || page._id);

  return (
    <>
      {page.seo?.schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: page.seo.schemaMarkup
              .replace(/<script\b[^>]*>/gi, "")
              .replace(/<\/script>/gi, "")
              .trim(),
          }}
        />
      )}
      <Navbar />
      <main className="min-h-screen bg-slate-50 text-slate-900 pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-12">
          {/* Main Custom Sections */}
          <SectionRenderer sections={page.sections || []} />

          {/* Child Pages Showcase Cards Grid (Rendered at the very bottom) */}
          {childPages && childPages.length > 0 && (
            <div className="pt-10 border-t border-slate-200/80 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  <Sparkles size={14} /> Sub-Pages & Listings
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Explore Pages in {page.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Browse through sub-locations, property choices, and detailed pages available under {page.title}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {childPages.map((child) => {
                  const cardImage =
                    child.seo?.openGraphImage ||
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800";

                  return (
                    <Link
                      key={child.id || child._id}
                      href={`/${child.slug}`}
                      className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={cardImage}
                            alt={child.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {child.title}
                        </h4>
                        <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                          {child.seo?.metaDescription ||
                            `Explore properties, pricing, and details for ${child.title}.`}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                        <span>Explore Page</span>
                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
