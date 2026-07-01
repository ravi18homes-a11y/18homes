import Footer from "./COMMON/Footer";
import Navbar from "./COMMON/Navbar";
import HomeBlogs from "./components/Blogs";
import ContactSection from "./components/ContactSection";
import FilterPropertiesComp from "./components/FilterPropertiesComp";
import HeroSlider from "./components/HeroSection";
import HomeAbout from "./components/HomeAbout";
import HomeBuyComp from "./components/HomeBuyComp";
import HomeServices from "./components/HomeService";
import InstrumentsSection from "./components/InstrumentsSection";
import Testimonials from "./components/Testimonials";
import { getHomepageData } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const data = await getHomepageData();
  const seo = data?.seo || {};
  
  const robots = seo.noIndex ? { index: false, follow: false } : undefined;

  return {
    title: seo.metaTitle || "18 Homes - Modern Real Estate Platform",
    description: seo.metaDescription || "Find your dream home with 18 Homes in Delhi-NCR",
    keywords: seo.keywords || undefined,
    alternates: {
      canonical: seo.canonicalUrl || undefined,
    },
    robots,
    openGraph: {
      title: seo.openGraphTitle || seo.metaTitle || "18 Homes - Modern Real Estate Platform",
      description: seo.openGraphDescription || seo.metaDescription || "Find your dream home with 18 Homes in Delhi-NCR",
      images: seo.openGraphImage ? [{ url: seo.openGraphImage }] : undefined,
    },
    twitter: {
      card: seo.twitterCard || "summary_large_image",
      title: seo.twitterTitle || seo.metaTitle || undefined,
      description: seo.twitterDescription || seo.metaDescription || undefined,
      images: seo.twitterImage ? [seo.twitterImage] : undefined,
    },
  };
}

export default async function Home() {
  const data = await getHomepageData();
  const seo = data?.seo || {};

  return (
    <main>
      {seo.schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seo.schemaMarkup }}
        />
      )}
      <div>
        <Navbar />
        <HeroSlider data={data?.hero} />
        <FilterPropertiesComp />
        <HomeBuyComp />
        <HomeServices data={data?.services} />
        <HomeAbout data={data?.about} />
        <HomeBlogs data={data?.blogs} />
        <InstrumentsSection data={data?.instruments} />
        <Testimonials data={data?.testimonials} />
        <ContactSection data={data?.contact} />
        <Footer />
      </div>
    </main>
  );
}
