import Head from "next/head";
import Link from "next/link";
import EditPageClient from "./EditPageClient";

export default async function EditPage({ params }) {
  const { id } = await params;

  return (
    <>
      <Head>
        <title>Edit Page</title>
      </Head>
      <div className="min-h-screen bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Edit page</h1>
              <p className="text-slate-600 mt-1">
                Update content, sections, and SEO settings for this page.
              </p>
            </div>
            <Link
              href="/admin/pages"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-100"
            >
              Back to pages
            </Link>
          </div>
          <EditPageClient id={id} />
        </div>
      </div>
    </>
  );
}
