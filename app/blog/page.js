import Footer from "../COMMON/Footer";
import Navbar from "../COMMON/Navbar";
import PageHeader from "../COMMON/PageHeader";
import { MainBlog } from "./MainBlog";
import { getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("blog");
  const seo = page?.seo || {};

  return {
    title: seo.metaTitle || "Blogs & Insights | 18 Homes",
    description:
      seo.metaDescription ||
      "Read latest real estate blogs, guides, market trends, and property advice from 18 Homes.",
    keywords: seo.keywords || undefined,
    alternates: {
      canonical: seo.canonicalUrl || undefined,
    },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: seo.openGraphTitle || seo.metaTitle || "Blogs & Insights | 18 Homes",
      description:
        seo.openGraphDescription ||
        seo.metaDescription ||
        "Read latest real estate blogs, guides, market trends, and property advice.",
      images: seo.openGraphImage ? [{ url: seo.openGraphImage }] : undefined,
    },
  };
}

export default async function page() {
  const pageData = await getPageBySlug("blog");
  const schemaMarkup = pageData?.seo?.schemaMarkup;

  return (
    <div>
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: schemaMarkup
              .replace(/<script\b[^>]*>/gi, "")
              .replace(/<\/script>/gi, "")
              .trim(),
          }}
        />
      )}
      <Navbar color="white" />
      <PageHeader title="Blogs & Insights" />
      <MainBlog />
      <Footer />
    </div>
  );
}
