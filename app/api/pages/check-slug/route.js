import { slugExists } from "../../../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const excludeId = searchParams.get("excludeId");

    if (!slug) {
      return new Response(
        JSON.stringify({
          error: "Slug query parameter is required.",
          available: false,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const exists = await slugExists(slug, excludeId || null);
    return new Response(JSON.stringify({ available: !exists }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GET /api/pages/check-slug]", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to check slug",
        available: false,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
