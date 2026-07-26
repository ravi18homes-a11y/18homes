import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get("all") === "true";

    const filter = fetchAll ? {} : { isActive: true };
    const blogs = await Blog.find(filter).sort({ order: 1, createdAt: -1 }).lean({ virtuals: true });

    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs." },
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
        { success: false, error: "Blog title is required." },
        { status: 400 }
      );
    }

    // Auto calculate order if not provided
    let finalOrder = typeof order === "number" ? order : parseInt(order || "0", 10);
    if (isNaN(finalOrder) || finalOrder === 0) {
      const maxOrderDoc = await Blog.findOne().sort({ order: -1 }).select({ order: 1 }).lean();
      finalOrder = (maxOrderDoc?.order || 0) + 1;
    }

    const newBlog = await Blog.create({
      title: title.trim(),
      description: (description || "").trim(),
      image: (image || "").trim(),
      link: (link || "").trim(),
      order: finalOrder,
      isActive: isActive !== false,
    });

    return NextResponse.json({ success: true, blog: newBlog }, { status: 201 });
  } catch (error) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create blog." },
      { status: 500 }
    );
  }
}
