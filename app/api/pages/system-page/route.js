import Page from "@/models/Page";
import dbConnect from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PAGES = {
  service: { title: "Service Page", mainMenu: "service", slugSegment: "service", slug: "service" },
  blog: { title: "Blog Page", mainMenu: "pages", slugSegment: "blog", slug: "blog" },
  city: { title: "City Page", mainMenu: "city", slugSegment: "city", slug: "city" },
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug") || "service";

    await dbConnect();
    let page = await Page.findOne({ slug }).lean({ virtuals: true });

    if (!page && SYSTEM_PAGES[slug]) {
      const sysConfig = SYSTEM_PAGES[slug];
      const created = await Page.create({
        title: sysConfig.title,
        mainMenu: sysConfig.mainMenu,
        slugSegment: sysConfig.slugSegment,
        slug: sysConfig.slug,
        status: "published",
        showInNavbar: false,
        sections: [],
        seo: {
          metaTitle: `${sysConfig.title} | 18 Homes`,
          metaDescription: `Official ${sysConfig.title} page for 18 Homes real estate.`,
        },
      });
      page = created.toJSON();
    }

    if (!page) {
      return new Response(JSON.stringify({ error: "System page not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const result = {
      id: String(page.id || page._id),
      title: page.title,
      slug: page.slug,
      mainMenu: page.mainMenu,
      seo: page.seo || {},
    };

    return new Response(JSON.stringify({ page: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GET /api/pages/system-page]", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to fetch system page" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
