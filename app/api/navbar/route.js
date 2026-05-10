import { getNavbarTree } from "../../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const fixed = [
    { key: "home", label: "Home", href: "/" },
    { key: "buy", label: "Buy", href: "/buy" },
    { key: "sell", label: "Sell", href: "/sell" },
    { key: "contact", label: "Contact", href: "/contact" },
  ];

  const tree = await getNavbarTree();

  return new Response(
    JSON.stringify({
      menus: fixed.map((item) => ({
        ...item,
        children: tree[item.key] || [],
      })),
      /** Top-level items after Contact (mainMenu "pages"), with nested children for dropdowns */
      sitePages: tree.pages || [],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

