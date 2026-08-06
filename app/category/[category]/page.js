import Navbar from "@/app/COMMON/Navbar";
import Footer from "@/app/COMMON/Footer";
import FilterPropertiesComp from "@/app/components/FilterPropertiesComp";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const category = resolvedParams?.category || "";
  const categoryTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : "Category";
  return {
    title: `${categoryTitle} Properties for Rent & Sale | 18Homes`,
    description: `Find the best ${category} properties for sale and rent on 18Homes. Explore apartments, flats, plots, commercial, and more with trusted real estate listings.`,
  };
}

export default async function CategoryPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-24  min-h-screen bg-[#F7F7F7]">
        <FilterPropertiesComp />
      </div>
      <Footer />
    </main>
  );
}
