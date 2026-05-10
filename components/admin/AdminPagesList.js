import Link from "next/link";
import { useRouter } from "next/router";

export default function AdminPagesList({ pages, onRefresh }) {
  const router = useRouter();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this page? This cannot be undone.")) {
      return;
    }
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    onRefresh?.();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Saved pages</h2>
        <span className="text-sm text-slate-500">{pages.length} pages</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {pages.map((page) => (
              <tr key={page.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {page.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {page.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(page.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/pages/edit/${page.id}`}
                    className="mr-3 text-slate-900 hover:text-slate-700"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
