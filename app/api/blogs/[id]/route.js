import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Blog from "@/models/Blog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const blog = await Blog.findById(id).lean({ virtuals: true });
    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error("GET /api/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const { title, description, image, link, order, isActive } = body;

    const existing = await Blog.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    if (title !== undefined) existing.title = title.trim();
    if (description !== undefined) existing.description = description.trim();
    if (image !== undefined) existing.image = image.trim();
    if (link !== undefined) existing.link = link.trim();
    if (order !== undefined) existing.order = Number(order);
    if (isActive !== undefined) existing.isActive = Boolean(isActive);

    const updatedBlog = await existing.save();

    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (error) {
    console.error("PUT /api/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update blog." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Blog deleted successfully." });
  } catch (error) {
    console.error("DELETE /api/blogs/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog." },
      { status: 500 }
    );
  }
}
