import { getHomepageData, updateHomepageData } from "../../../lib/store";
import fs from "fs";
import path from "path";

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

    // Synchronize to physical files under the public/ folder if filesystem is writable
    try {
      if (payload?.seo) {
        const publicDir = path.join(process.cwd(), "public");
        
        // Ensure public directory exists
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        // We no longer write static sitemap.xml and sitemap.html to the public directory.
        // This ensures the dynamic Next.js sitemap routes are used instead.
        if (payload.seo.robotsTxt !== undefined) {
          fs.writeFileSync(path.join(publicDir, "robots.txt"), payload.seo.robotsTxt, "utf8");
        }
      }
    } catch (fsError) {
      console.warn("[POST /api/homepage] Failed to sync SEO files to disk:", fsError.message);
    }

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
