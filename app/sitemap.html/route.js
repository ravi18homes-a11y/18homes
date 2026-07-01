import { getHomepageData } from "../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getHomepageData();
    const html = data?.seo?.sitemapHtml || "";

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("[GET /sitemap.html]", error);
    return new Response("Error generating HTML sitemap", { status: 500 });
  }
}
