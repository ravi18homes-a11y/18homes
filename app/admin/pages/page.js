import PagesTreeList from "../../../components/admin/PagesTreeList";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <PagesTreeList />
      </div>
    </div>
  );
}
