import { getHomepageData } from "../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getHomepageData();
    const xml = data?.seo?.sitemapXml || "";

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("[GET /sitemap.xml]", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
