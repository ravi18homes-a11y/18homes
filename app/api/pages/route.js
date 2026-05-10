import { getAllPages, createPage } from "../../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const pages = await getAllPages();
    return new Response(JSON.stringify({ pages: pages || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GET /api/pages]", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch pages",
        pages: [],
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function POST(req) {
  try {
    const payload = await req.json();
    console.log("[POST /api/pages] payload:", payload);

    const page = await createPage(payload);
    return new Response(JSON.stringify(page), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[POST /api/pages]", error);
    const message = error?.message || "Unable to create page.";
    const status = message.includes("exists") ? 409 : 400;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
