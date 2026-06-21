import { getHomepageData, updateHomepageData } from "../../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getHomepageData();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GET /api/homepage]", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch homepage data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(req) {
  try {
    const payload = await req.json();
    console.log("[POST /api/homepage] payload received:", payload);
    const data = await updateHomepageData(payload);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[POST /api/homepage]", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to update homepage data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
