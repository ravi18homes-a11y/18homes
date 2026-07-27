import Footer from "../COMMON/Footer";
import Navbar from "../COMMON/Navbar";
import PageHeader from "../COMMON/PageHeader";
import { MainCity } from "./MainCity";
import { getPageBySlug } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("city");
  const seo = page?.seo || {};

  return {
    title: seo.metaTitle || "Properties by City | 18 Homes",
    description:
      seo.metaDescription ||
      "Explore properties, houses, and flats across Ghaziabad, Noida, Delhi and top prime cities.",
    keywords: seo.keywords || undefined,
    alternates: {
      canonical: seo.canonicalUrl || undefined,
    },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: seo.openGraphTitle || seo.metaTitle || "Properties by City | 18 Homes",
      description:
        seo.openGraphDescription ||
        seo.metaDescription ||
        "Explore properties, houses, and flats across top prime cities.",
      images: seo.openGraphImage ? [{ url: seo.openGraphImage }] : undefined,
    },
  };
}

export default async function page() {
  const pageData = await getPageBySlug("city");
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
      <PageHeader title="Properties by City" />
      <MainCity />
      <Footer />
    </div>
  );
}
