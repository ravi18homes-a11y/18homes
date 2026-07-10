import SectionRenderer from "@/components/SectionRenderer";
import { getPageBySlug } from "@/lib/store";
import { notFound } from "next/navigation";
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
   <Navbar/>
   <main className="min-h-screen bg-slate-50 text-slate-900 pt-24">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <SectionRenderer sections={page.sections || []} />
      </div>
    </main>
   <Footer/>
   
   </>
  );
}
