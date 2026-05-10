import { deletePage, getPageById, updatePage } from "../../../../lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req, context) {
  try {
    const { id } = await context.params;
    const page = await getPageById(id);
    if (!page) {
      return new Response(JSON.stringify({ error: "Page not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(page), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GET /api/pages/[id]]", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch page" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function PUT(req, context) {
  try {
    const { id } = await context.params;
    const payload = await req.json();
    const page = await updatePage(id, payload);
    if (!page) {
      return new Response(JSON.stringify({ error: "Page not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(page), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[PUT /api/pages/[id]]", error);
    const message = error?.message || "Unable to update page.";
    const status = message.includes("exists") ? 409 : 400;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(_req, context) {
  try {
    const { id } = await context.params;
    const deleted = await deletePage(id);
    if (!deleted) {
      return new Response(JSON.stringify({ error: "Page not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[DELETE /api/pages/[id]]", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete page" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
