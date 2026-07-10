import { getHomepageData, getAllPages } from "../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const host = req.headers.get("host") || "www.18homes.in";
    const protocol = host.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    // Get all published pages from the database
    const allPages = await getAllPages();
    const publishedPages = allPages.filter((p) => p.status === "published");

    // Maintain sitemap items using a Map to avoid duplicates
    const sitemapItems = new Map();

    // Default core static routes
    const defaultStatic = [
      { path: "", priority: "1.00", changefreq: "daily" },
      { path: "buy", priority: "0.80", changefreq: "weekly" },
      { path: "sell", priority: "0.80", changefreq: "weekly" },
      { path: "contact", priority: "0.80", changefreq: "weekly" },
      { path: "login-signup", priority: "0.80", changefreq: "monthly" },
      { path: "about", priority: "0.80", changefreq: "weekly" },
    ];

    for (const item of defaultStatic) {
      sitemapItems.set(item.path, {
        url: `${baseUrl}/${item.path}`.replace(/\/$/, ""), // remove trailing slash for home
        lastmod: new Date().toISOString(),
        priority: item.priority,
        changefreq: item.changefreq,
      });
    }

    // Append dynamic pages from database
    for (const page of publishedPages) {
      const cleanSlug = String(page.slug || "").replace(/^\/+|\/+$/g, "");
      const pageUrl = `${baseUrl}/${cleanSlug}`;
      const lastmod = page.updatedAt ? new Date(page.updatedAt).toISOString() : new Date().toISOString();

      if (sitemapItems.has(cleanSlug)) {
        // Update existing static path's last modification date
        const existing = sitemapItems.get(cleanSlug);
        sitemapItems.set(cleanSlug, {
          ...existing,
          lastmod,
        });
      } else {
        sitemapItems.set(cleanSlug, {
          url: pageUrl,
          lastmod,
          priority: "0.70",
          changefreq: "weekly",
        });
      }
    }

    // Build the dynamic sitemap XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/css" href="https://www.xml-sitemaps.com/css/sitemap.css"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    for (const item of sitemapItems.values()) {
      xml += `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>\n`;
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("[GET /sitemap.xml]", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
