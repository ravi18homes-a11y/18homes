import { getHomepageData } from "../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getHomepageData();
    const txt = data?.seo?.robotsTxt || "";

    return new Response(txt, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("[GET /robots.txt]", error);
    return new Response("Error generating robots.txt", { status: 500 });
  }
}
