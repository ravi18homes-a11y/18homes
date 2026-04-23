// pages/admin/pages.js

import Head from "next/head";
import Link from "next/link";
import { pagesStore } from "../../lib/store";
import AdminPages from "./AdminPages";

// import { pagesStore } from "../../lib/store";

export default async function Page() {
  const initialPages = pagesStore;

  return (
    <div>
      {initialPages.map((page, index) => (
        <div key={index}>{page.name}</div>
      ))}
      <AdminPages initialPages={initialPages} />
    </div>
  );
}

