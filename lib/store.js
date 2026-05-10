import dbConnect from "./mongodb";
import Page from "../models/Page";
import mongoose from "mongoose";

export const MAIN_MENUS = ["home", "buy", "sell", "contact", "pages"];

/** URL segments reserved for root-level CMS slugs (mainMenu "pages", no parent). */
const RESERVED_ROOT_SLUGS = new Set([
  "admin",
  "api",
  "_next",
  "static",
  "home",
  "buy",
  "sell",
  "contact",
  "login-signup",
  "edit-profile",
  "setting",
  "settings",
  "service",
  "services",
  "reset-password",
  "createpage",
  "allpages",
  "blogs",
  "blog",
  "favicon",
  "robots",
  "sitemap",
]);

if (!global._pagesStore) {
  global._pagesStore = [];
}
export const pagesStore = global._pagesStore;

let _dbMode = "unknown"; // "mongo" | "memory" | "unknown"

function ensureIso(value) {
  try {
    return value ? new Date(value).toISOString() : null;
  } catch {
    return null;
  }
}

function randomId() {
  // Stable enough for local dev; not for distributed uniqueness.
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
}

async function ensureStoreReady() {
  if (_dbMode === "mongo") return "mongo";
  if (_dbMode === "memory") return "memory";

  try {
    await dbConnect();
    _dbMode = "mongo";
    return "mongo";
  } catch (err) {
    console.error("[store] Mongo connection failed; using memory store.", err);
    _dbMode = "memory";
    return "memory";
  }
}

function slugifySegment(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/--+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function assertRootSlugAllowed(slugSegment, mainMenu, parentId) {
  if (parentId) return;
  const seg = slugifySegment(slugSegment);
  if (!seg) return;
  if ((mainMenu === "pages" || mainMenu === "home") && RESERVED_ROOT_SLUGS.has(seg)) {
    throw new Error(`Slug "${seg}" is reserved. Choose a different URL segment.`);
  }
}

export async function getAllPages() {
  const mode = await ensureStoreReady();
  if (mode === "mongo") {
    const pages = await Page.find({})
      .sort({ updatedAt: -1 })
      .lean({ virtuals: true });
    return pages.map(normalizeLeanPage);
  }

  return [...pagesStore]
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .map((p) => normalizeLeanPage(p));
}

export async function getPageById(id) {
  const mode = await ensureStoreReady();
  if (mode === "mongo") {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const page = await Page.findById(id).lean({ virtuals: true });
    return page ? normalizeLeanPage(page) : null;
  }

  const page = pagesStore.find((p) => String(p.id || p._id) === String(id));
  return page ? normalizeLeanPage(page) : null;
}

export async function getPageBySlug(slug) {
  const mode = await ensureStoreReady();
  const normalized = String(slug || "").replace(/^\/+|\/+$/g, "");
  if (mode === "mongo") {
    const page = await Page.findOne({ slug: normalized }).lean({
      virtuals: true,
    });
    return page ? normalizeLeanPage(page) : null;
  }

  const page = pagesStore.find((p) => String(p.slug || "") === normalized);
  return page ? normalizeLeanPage(page) : null;
}

export async function slugExists(slug, excludeId = null) {
  const mode = await ensureStoreReady();
  const normalized = String(slug || "").replace(/^\/+|\/+$/g, "");
  if (mode === "mongo") {
    const query = { slug: normalized };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }
    const found = await Page.findOne(query).select({ _id: 1 }).lean();
    return Boolean(found);
  }

  return pagesStore.some((p) => {
    if (String(p.slug || "") !== normalized) return false;
    if (excludeId == null) return true;
    return String(p.id || p._id) !== String(excludeId);
  });
}

export async function createPage(payload) {
  const mode = await ensureStoreReady();
  const title = String(payload?.title || "").trim();
  const mainMenu = String(payload?.mainMenu || "")
    .trim()
    .toLowerCase();
  const parentId =
    payload?.parentId && mode === "mongo" && mongoose.Types.ObjectId.isValid(payload.parentId)
      ? new mongoose.Types.ObjectId(payload.parentId)
      : payload?.parentId
        ? String(payload.parentId)
        : null;

  if (!title) throw new Error("Title is required.");
  if (!MAIN_MENUS.includes(mainMenu)) throw new Error("Invalid main menu.");

  const slugSegment = slugifySegment(
    payload?.slugSegment || payload?.slug || payload?.title,
  );
  if (!slugSegment) throw new Error("Slug segment is required.");

  const fullSlug = await buildFullSlug({ mainMenu, parentId, slugSegment });
  assertRootSlugAllowed(slugSegment, mainMenu, parentId);
  const exists = await slugExists(fullSlug);
  if (exists) throw new Error("Slug already exists.");

  if (mode === "mongo") {
    const created = await Page.create({
      title,
      mainMenu,
      parentId,
      slugSegment,
      slug: fullSlug,
      status: payload?.status === "published" ? "published" : "draft",
      sections: Array.isArray(payload?.sections) ? payload.sections : [],
      seo: sanitizeSeo(payload?.seo),
    });
    return normalizeDocPage(created);
  }

  const now = new Date().toISOString();
  const created = {
    id: randomId(),
    title,
    mainMenu,
    parentId: parentId ? String(parentId) : null,
    slugSegment,
    slug: fullSlug,
    status: payload?.status === "published" ? "published" : "draft",
    sections: Array.isArray(payload?.sections) ? payload.sections : [],
    seo: sanitizeSeo(payload?.seo),
    createdAt: now,
    updatedAt: now,
  };
  pagesStore.push(created);
  return normalizeLeanPage(created);
}

export async function updatePage(id, payload) {
  const mode = await ensureStoreReady();
  if (mode === "mongo") {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    const existing = await Page.findById(id);
    if (!existing) return null;

  const title =
    payload?.title != null ? String(payload.title).trim() : existing.title;
  const mainMenu =
    payload?.mainMenu != null
      ? String(payload.mainMenu).trim().toLowerCase()
      : existing.mainMenu;
    const parentId =
      payload?.parentId === "" || payload?.parentId === null
        ? null
        : payload?.parentId && mongoose.Types.ObjectId.isValid(payload.parentId)
          ? new mongoose.Types.ObjectId(payload.parentId)
          : (existing.parentId ?? null);

  if (!title) throw new Error("Title is required.");
  if (!MAIN_MENUS.includes(mainMenu)) throw new Error("Invalid main menu.");

  const slugSegment =
    payload?.slugSegment != null || payload?.slug != null
      ? slugifySegment(payload?.slugSegment || payload?.slug)
      : existing.slugSegment;
  if (!slugSegment) throw new Error("Slug segment is required.");

  // prevent circular reference / self parent
  if (parentId && String(parentId) === String(existing._id)) {
    throw new Error("Page cannot be its own parent.");
  }

    const fullSlug = await buildFullSlug({ mainMenu, parentId, slugSegment });
    assertRootSlugAllowed(slugSegment, mainMenu, parentId);
    const taken = await slugExists(fullSlug, id);
    if (taken) throw new Error("Slug already exists.");

  existing.title = title;
  existing.mainMenu = mainMenu;
  existing.parentId = parentId;
  existing.slugSegment = slugSegment;
  existing.slug = fullSlug;
  if (payload?.status) {
    existing.status = payload.status === "published" ? "published" : "draft";
  }
  if (payload?.sections) {
    existing.sections = Array.isArray(payload.sections) ? payload.sections : [];
  }
  if (payload?.seo) {
    existing.seo = sanitizeSeo(payload.seo);
  }

    const saved = await existing.save();
    return normalizeDocPage(saved);
  }

  const idx = pagesStore.findIndex((p) => String(p.id || p._id) === String(id));
  if (idx === -1) return null;

  const existing = pagesStore[idx];
  const title =
    payload?.title != null ? String(payload.title).trim() : existing.title;
  const mainMenu =
    payload?.mainMenu != null
      ? String(payload.mainMenu).trim().toLowerCase()
      : existing.mainMenu;
  const parentId =
    payload?.parentId === "" || payload?.parentId === null
      ? null
      : payload?.parentId
        ? String(payload.parentId)
        : (existing.parentId ?? null);

  if (!title) throw new Error("Title is required.");
  if (!MAIN_MENUS.includes(mainMenu)) throw new Error("Invalid main menu.");

  const slugSegment =
    payload?.slugSegment != null || payload?.slug != null
      ? slugifySegment(payload?.slugSegment || payload?.slug)
      : existing.slugSegment;
  if (!slugSegment) throw new Error("Slug segment is required.");

  if (parentId && String(parentId) === String(existing.id || existing._id)) {
    throw new Error("Page cannot be its own parent.");
  }

  const fullSlug = await buildFullSlug({ mainMenu, parentId, slugSegment });
  assertRootSlugAllowed(slugSegment, mainMenu, parentId);
  const taken = await slugExists(fullSlug, id);
  if (taken) throw new Error("Slug already exists.");

  const now = new Date().toISOString();
  const updated = {
    ...existing,
    title,
    mainMenu,
    parentId: parentId ? String(parentId) : null,
    slugSegment,
    slug: fullSlug,
    status: payload?.status
      ? payload.status === "published"
        ? "published"
        : "draft"
      : existing.status,
    sections:
      payload?.sections != null
        ? Array.isArray(payload.sections)
          ? payload.sections
          : []
        : existing.sections,
    seo: payload?.seo ? sanitizeSeo(payload.seo) : existing.seo,
    updatedAt: now,
  };

  pagesStore[idx] = updated;
  return normalizeLeanPage(updated);
}

export async function deletePage(id) {
  const mode = await ensureStoreReady();
  if (mode === "mongo") {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;

    // If a parent is deleted, children get re-attached to the same mainMenu root.
    await Page.updateMany({ parentId: id }, { $set: { parentId: null } });
    const res = await Page.deleteOne({ _id: id });
    return res.deletedCount === 1;
  }

  const before = pagesStore.length;
  for (const p of pagesStore) {
    if (String(p.parentId || "") === String(id)) p.parentId = null;
  }
  const idx = pagesStore.findIndex((p) => String(p.id || p._id) === String(id));
  if (idx !== -1) pagesStore.splice(idx, 1);
  return pagesStore.length !== before;
}

export async function generateSlug(value) {
  return slugifySegment(value || "");
}

export async function getNavbarTree() {
  const mode = await ensureStoreReady();
  const pages =
    mode === "mongo"
      ? await Page.find({ status: "published" })
          .select({ title: 1, slug: 1, mainMenu: 1, parentId: 1 })
          .sort({ mainMenu: 1, title: 1 })
          .lean({ virtuals: true })
      : pagesStore.filter((p) => (p.status || "draft") === "published");

  const normalized = pages.map((p) => ({
    id: String(p.id || p._id),
    title: p.title,
    slug: p.slug,
    href: `/${p.slug}`,
    mainMenu: p.mainMenu,
    parentId: p.parentId ? String(p.parentId) : null,
  }));

  const byId = new Map(normalized.map((p) => [p.id, { ...p, children: [] }]));
  const rootsByMenu = {
    home: [],
    buy: [],
    sell: [],
    contact: [],
    pages: [],
  };

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId).children.push(node);
      continue;
    }
    rootsByMenu[node.mainMenu].push(node);
  }

  // Ensure deterministic order for children arrays
  function sortTree(items) {
    items.sort((a, b) => a.title.localeCompare(b.title));
    for (const item of items) sortTree(item.children);
  }
  for (const menu of Object.keys(rootsByMenu)) sortTree(rootsByMenu[menu]);

  return rootsByMenu;
}

async function buildFullSlug({ mainMenu, parentId, slugSegment }) {
  const segment = slugifySegment(slugSegment);
  if (!segment) return "";

  let base = "";
  if (parentId) {
    const mode = await ensureStoreReady();
    const parent =
      mode === "mongo"
        ? await Page.findById(parentId).select({ slug: 1, mainMenu: 1 }).lean()
        : pagesStore.find((p) => String(p.id || p._id) === String(parentId));

    if (!parent) throw new Error("Parent page not found.");
    if (String(parent.mainMenu) !== String(mainMenu)) {
      throw new Error("Parent page must belong to the same main menu.");
    }
    base = parent.slug;
  } else {
    base =
      mainMenu === "home" || mainMenu === "pages" ? "" : mainMenu;
  }

  return base ? `${base}/${segment}` : segment;
}

function sanitizeSeo(seo) {
  const value = seo && typeof seo === "object" ? seo : {};
  return {
    metaTitle: String(value.metaTitle || ""),
    metaDescription: String(value.metaDescription || ""),
    keywords: String(value.keywords || ""),
    canonicalUrl: String(value.canonicalUrl || ""),
    noIndex: Boolean(value.noIndex),
    openGraphTitle: String(value.openGraphTitle || ""),
    openGraphDescription: String(value.openGraphDescription || ""),
    openGraphImage: String(value.openGraphImage || ""),
  };
}

function normalizeLeanPage(page) {
  const createdAt = ensureIso(page.createdAt);
  const updatedAt = ensureIso(page.updatedAt);
  return {
    id: page.id ? String(page.id) : String(page._id),
    title: page.title,
    slug: page.slug,
    slugSegment: page.slugSegment,
    mainMenu: page.mainMenu,
    parentId: page.parentId ? String(page.parentId) : null,
    status: page.status || "draft",
    sections: page.sections || [],
    seo: sanitizeSeo(page.seo),
    createdAt,
    updatedAt,
  };
}

function normalizeDocPage(doc) {
  const json = doc.toJSON();
  return normalizeLeanPage(json);
}
