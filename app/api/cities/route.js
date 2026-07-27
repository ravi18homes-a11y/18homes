import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import City from "@/models/City";
import Page from "@/models/Page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get("all") === "true";

    const filter = fetchAll ? {} : { isActive: true };
    const cities = await City.find(filter).sort({ order: 1, createdAt: -1 }).lean({ virtuals: true });

    return NextResponse.json({ success: true, cities });
  } catch (error) {
    console.error("GET /api/cities error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cities." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();

    const { title, description, image, link, order, isActive } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "City title is required." },
        { status: 400 }
      );
    }

    const cleanSlug = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const defaultLink = `/${cleanSlug}`;
    const targetLink = (link || defaultLink).trim();
    const targetSlug = targetLink.startsWith("/") ? targetLink.slice(1) : targetLink;

    // Auto calculate order if not provided
    let finalOrder = typeof order === "number" ? order : parseInt(order || "0", 10);
    if (isNaN(finalOrder) || finalOrder === 0) {
      const maxOrderDoc = await City.findOne().sort({ order: -1 }).select({ order: 1 }).lean();
      finalOrder = (maxOrderDoc?.order || 0) + 1;
    }

    const newCity = await City.create({
      title: title.trim(),
      description: (description || "").trim(),
      image: (image || "").trim(),
      link: targetLink,
      order: finalOrder,
      isActive: isActive !== false,
    });

    // Ensure a corresponding Page exists for /admin/pages management
    if (targetSlug) {
      const existingPage = await Page.findOne({ slug: targetSlug });
      if (!existingPage) {
        await Page.create({
          title: title.trim(),
          mainMenu: "city",
          slugSegment: cleanSlug,
          slug: targetSlug,
          status: "published",
          showInNavbar: true,
          sections: [],
          seo: {
            metaTitle: `${title.trim()} Properties | 18 Homes`,
            metaDescription: (description || "").trim() || `Explore top houses, flats, and properties in ${title.trim()}.`,
            openGraphImage: (image || "").trim(),
          },
        });
      }
    }

    return NextResponse.json({ success: true, city: newCity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cities error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create city." },
      { status: 500 }
    );
  }
}
