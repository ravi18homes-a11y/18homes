import { getNavbarTree } from "../../../lib/store";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";
import Blog from "@/models/Blog";
import City from "@/models/City";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let serviceChildren = [];
  let blogChildren = [];
  let cityChildren = [];

  try {
    await dbConnect();
    const [services, blogs, cities] = await Promise.all([
      Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean({ virtuals: true }),
      Blog.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean({ virtuals: true }),
      City.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean({ virtuals: true }),
    ]);

    serviceChildren = services.map((s) => ({
      id: String(s.id || s._id),
      title: s.title,
      href: s.link && s.link.trim() ? s.link.trim() : `/service/${s.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    }));

    blogChildren = blogs.map((b) => ({
      id: String(b.id || b._id),
      title: b.title,
      href: b.link && b.link.trim() ? b.link.trim() : `/blog/${b.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    }));

    cityChildren = cities.map((c) => ({
      id: String(c.id || c._id),
      title: c.title,
      href: c.link && c.link.trim() ? c.link.trim() : `/${c.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    }));
  } catch (err) {
    console.error("Error fetching navbar items:", err);
  }

  const fixed = [
    { key: "home", label: "Home", href: "/" },
    { key: "buy", label: "Buy", href: "/buy" },
    { key: "sell", label: "Sell", href: "/sell" },
    { key: "service", label: "Service", href: "/service", childrenOverride: serviceChildren },
    { key: "blog", label: "Blog", href: "/blog", childrenOverride: blogChildren },
    { key: "city", label: "City", href: "/city", childrenOverride: cityChildren },
    { key: "contact", label: "Contact", href: "/contact" },
  ];

  const tree = await getNavbarTree();

  const menus = fixed.map((item) => ({
    key: item.key,
    label: item.label,
    href: item.href,
    children: item.childrenOverride !== undefined ? item.childrenOverride : (tree[item.key] || []),
  }));

  return new Response(
    JSON.stringify({
      menus,
      serviceItems: serviceChildren,
      blogItems: blogChildren,
      cityItems: cityChildren,
      sitePages: tree.pages || [],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
