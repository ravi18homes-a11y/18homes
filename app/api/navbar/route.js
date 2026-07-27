import { getNavbarTree } from "../../../lib/store";
import dbConnect from "@/lib/mongodb";
import Service from "@/models/Service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let serviceChildren = [];

  try {
    await dbConnect();
    const services = await Service.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean({ virtuals: true });

    serviceChildren = services.map((s) => ({
      id: String(s.id || s._id),
      title: s.title,
      href: s.link && s.link.trim() ? s.link.trim() : "/service/house",
    }));
  } catch (err) {
    console.error("Error fetching navbar services:", err);
  }

  const fixed = [
    { key: "home", label: "Home", href: "/" },
    { key: "buy", label: "Buy", href: "/buy" },
    { key: "sell", label: "Sell", href: "/sell" },
    { key: "service", label: "Service", href: "/service", childrenOverride: serviceChildren },
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
      sitePages: tree.pages || [],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
