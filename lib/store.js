import dbConnect from "./mongodb";
import Page from "../models/Page";
import Homepage from "../models/Homepage";
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
      showInNavbar: payload?.showInNavbar !== false,
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
    showInNavbar: payload?.showInNavbar !== false,
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
  if (payload?.showInNavbar !== undefined) {
    existing.showInNavbar = Boolean(payload.showInNavbar);
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
    showInNavbar:
      payload?.showInNavbar !== undefined
        ? Boolean(payload.showInNavbar)
        : existing.showInNavbar,
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
      ? await Page.find({ status: "published", showInNavbar: { $ne: false } })
          .select({ title: 1, slug: 1, mainMenu: 1, parentId: 1, createdAt: 1 })
          .sort({ mainMenu: 1, title: 1 })
          .lean({ virtuals: true })
      : pagesStore.filter((p) => (p.status || "draft") === "published" && p.showInNavbar !== false);

  const normalized = pages.map((p) => ({
    id: String(p.id || p._id),
    title: p.title,
    slug: p.slug,
    href: `/${p.slug}`,
    mainMenu: p.mainMenu,
    parentId: p.parentId ? String(p.parentId) : null,
    createdAt: p.createdAt,
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

  // Get the 7 newest top-level roots for "pages" menu
  let pagesRoots = rootsByMenu.pages;
  pagesRoots.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
    const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
    return dateB - dateA;
  });
  rootsByMenu.pages = pagesRoots.slice(0, 7);

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
    schemaMarkup: String(value.schemaMarkup || ""),
    sitemapXml: String(value.sitemapXml || ""),
    sitemapHtml: String(value.sitemapHtml || ""),
    robotsTxt: String(value.robotsTxt || ""),
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
    showInNavbar: page.showInNavbar !== false,
    createdAt,
    updatedAt,
  };
}

const DEFAULT_HOMEPAGE_DATA = {
  navbar: {
    logo: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1765721624/18homess-removebg-preview_kqdv2j.png",
    logoAlt: "Logo",
  },
  seo: {
    metaTitle: "18 Homes - Modern Real Estate Platform",
    metaDescription: "Find your dream home with 18 Homes in Delhi-NCR",
    keywords: "flats, rent, buy, sell, real estate, delhi ncr",
    canonicalUrl: "",
    noIndex: false,
    openGraphTitle: "",
    openGraphDescription: "",
    openGraphImage: "",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "",
    twitterCard: "summary_large_image",
    schemaMarkup: "",
    sitemapXml: `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/css" href="https://www.xml-sitemaps.com/css/sitemap.css"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:fo="http://www.w3.org/1999/XSL/Format"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!-- created with Free Online Sitemap Generator www.xml-sitemaps.com -->


<url>
  <loc>https://www.18homes.in/</loc>
  <lastmod>2026-07-01T15:39:22+00:00</lastmod>
  <priority>1.00</priority>
</url>
<url>
  <loc>https://www.18homes.in/buy</loc>
  <lastmod>2026-07-01T15:39:22+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://www.18homes.in/sell</loc>
  <lastmod>2026-07-01T15:39:22+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://www.18homes.in/contact</loc>
  <lastmod>2026-07-01T15:39:22+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://www.18homes.in/login-signup</loc>
  <lastmod>2026-07-01T15:39:22+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://www.18homes.in/about</loc>
  <lastmod>2026-07-01T15:39:22+00:00</lastmod>
  <priority>0.80</priority>
</url>

</urlset>`,
    sitemapHtml: `<!doctype html>
<html lang="en">

<head>
	<meta charset="utf-8" />
	<title>18homes.in Site Map - Generated by www.xml-sitemaps.com</title>
	<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
	<style type="text/css">
	body {
		background-color: #fff;
		font-family: "Roboto", "Helvetica", "Arial", sans-serif;
		margin: 0;
	}

	#top {

		background-color: #b1d1e8;
		font-size: 16px;
		padding-bottom: 40px;
	}

	nav {
		font-size: 24px;

		margin: 0px 30px 0px;
		border-bottom-left-radius: 6px;
		border-bottom-right-radius: 6px;
		background-color: #f3f3f3;
		color: #666;
		box-shadow: 0 10px 20px -12px rgba(0, 0, 0, 0.42), 0 3px 20px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2);
		padding: 10px 0;
		text-align: center;
		z-index: 1;
	}

	h3 {
		margin: auto;
		padding: 10px;
		max-width: 600px;
		color: #666;
	}

	h3 span {
		float: right;
	}

	h3 a {
		font-weight: normal;
		display: block;
	}


	#cont {
		position: relative;
		border-radius: 6px;
		box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14), 0 6px 30px 5px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2);

		background: #f3f3f3;

		margin: -20px 30px 0px 30px;
		padding: 20px;
	}

	a:link,
	a:visited {
		color: #0180AF;
		text-decoration: underline;
	}

	a:hover {
		color: #666;
	}


	#footer {
		padding: 10px;
		text-align: center;
	}

	ul {
    	margin: 0px;

    	padding: 0px;
    	list-style: none;
	}
	li {
		margin: 0px;
	}
	li ul {
		margin-left: 20px;
	}

	.lhead {
		background: #ddd;
		padding: 10px;
    	margin: 10px 0px;
	}

	.lcount {
		padding: 0px 10px;
	}

	.lpage {
		border-bottom: #ddd 1px solid;
		padding: 5px;
	}
	.last-page {
		border: none;
	}
	</style>
</head>

<body>
	<div id="top">
		<nav>18homes.in HTML Site Map</nav>
		<h3>
<span>Last updated: 2026, July 1<br />
Total pages: 6</span>
<a href="https://18homes.in">18homes.in Homepage</a>
</h3></div>
	<div id="cont">
		<ul class="level-0">

            <li class="lhead">https:/ </li>
            <li><ul class="level-1">

            <li class="lhead">/ </li>
            <li><ul class="level-2">

            <li class="lhead">www.18homes.in/  <span class="lcount">6 pages</span></li>
            
<li class="lpage"><a href="https://www.18homes.in/" title="Buy, Sell &amp;amp; Rent Properties Online | Real Estate Deals Near You">Buy, Sell &amp; Rent Properties Online | Real Estate Deals Near You</a></li>
<li class="lpage"><a href="https://www.18homes.in/buy" title="18 Homes - Best Property for Sale and Rent in NCR">18 Homes - Best Property for Sale and Rent in NCR</a></li>
<li class="lpage"><a href="https://www.18homes.in/sell" title="18 Homes - Best Property for Sale and Rent in NCR">18 Homes - Best Property for Sale and Rent in NCR</a></li>
<li class="lpage"><a href="https://www.18homes.in/contact" title="18 Homes - Best Property for Sale and Rent in NCR">18 Homes - Best Property for Sale and Rent in NCR</a></li>
<li class="lpage"><a href="https://www.18homes.in/login-signup" title="18 Homes - Best Property for Sale and Rent in NCR">18 Homes - Best Property for Sale and Rent in NCR</a></li>
<li class="lpage last-page"><a href="https://www.18homes.in/about" title="18 Homes - Best Property for Sale and Rent in NCR">18 Homes - Best Property for Sale and Rent in NCR</a></li>
</ul></li>
</ul></li>
</ul>
		<!--
Please note:
You are not allowed to remove the copyright notice below.
Thank you!
www.xml-sitemaps.com
-->
	</div>
	<div id="footer">
		Page created with <a target="_blank" href="https://www.xml-sitemaps.com">Google XML sitemap and html sitemaps generator</a> | Copyright &copy; 2005-2026 XML-Sitemaps.com
	</div>
</body>

</html>`,
    robotsTxt: `User-agent: *

Allow: /

Disallow: /cgi-bin/
Disallow: /admin/
Disallow: /private/
Disallow: /thank-you/

Sitemap: https://www.18homes.in/sitemap.xml`,
  },
  hero: {
    slides: [
      {
        image: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-modern-dining-room-living-room-with-luxury-decor-yellow-lamp_105762-2232_iu2qqe.avif",
        heading1: "Delhi NCR Special",
        heading2: "Today's Premium Offer",
        heading3: "Luxury Flats In Your Budget",
        heading4: "Book Your Dream Home Today",
      },
      {
        image: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/interior-bedroom-home_1048944-24812703_hecplb.avif",
        heading1: "Delhi NCR Special",
        heading2: "Today's Premium Offer",
        heading3: "Luxury Flats In Your Budget",
        heading4: "Book Your Dream Home Today",
      },
      {
        image: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/interior-bedroom_1048944-19082391_a5ntf1.avif",
        heading1: "Delhi NCR Special",
        heading2: "Today's Premium Offer",
        heading3: "Luxury Flats In Your Budget",
        heading4: "Book Your Dream Home Today",
      },
    ],
  },
  about: {
    subtitle: "About",
    title: "18homes – Your Dream Home",
    description: "18Homes is a trusted real estate platform located in Delhi-NCR, providing premium flats for both rent and purchase. Our goal is to provide a safe, modern, and comfortable home for every budget and family. For the past several years, we have been helping thousands of customers find a home with the right location, right price, and right amenities. Our team ensures that you get verified properties, transparent deals, and excellent support service—so that the process of finding a home is easy, fast, and reliable.",
    image: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1765562605/1765562251061_vqijhn.png",
    points: [
      "Verified flats in prime locations",
      "Rent and sale options according to your budget",
      "Secure apartments with modern amenities",
      "Transparent process and 100% assistance",
    ],
    bgColor: "",
    textColor: "",
  },
  services: {
    subtitle: "Service",
    title: "Our Services",
    items: [
      {
        title: "1 BHK Flat on Rent",
        desc: "Secure and verified 1 BHK flats in prime locations. Affordable price, modern interior, and comfortable living with ready-to-move-in option.",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-luxury-modern-bedroom-suite-hotel-with-tv-cabinet_105762-2280_ozfq80.avif",
      },
      {
        title: "2 BHK Family Apartment",
        desc: "Excellent 2 BHK options for families, featuring large rooms, ample natural light, and 24/7 security. Superb location near schools, markets, and metro.",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-luxury-modern-bedroom-suite-hotel-with-tv-cabinet_105762-2280_ozfq80.avif",
      },
      {
        title: "3 BHK Luxury Flat",
        desc: "Premium 3 BHK apartments for large families, featuring high-class interior, spacious layout, and modern amenities. Perfect for a better and comfortable lifestyle.",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/cozy-living-room-with-coral-sofa_23-2152001401_mtbfyd.avif",
      },
      {
        title: "Flat Buying Assistance",
        desc: "Service to buy your preferred flat in Delhi-NCR with verified properties, transparent deals, and easy documentation. See first, then trust.",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/3d-rendering-modern-dining-room-living-room-with-luxury-decor-green-sofa_105762-2140_eu0udp.avif",
      },
      {
        title: "PG / Room on Rent",
        desc: "Furnished PG and rooms for students and bachelors. Ready-to-move-in facilities with Free WiFi, housekeeping, and pocket-friendly rent.",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928068/3d-rendering-modern-dining-room-living-room-with-luxury-decor-yellow-lamp_105762-2232_iu2qqe.avif",
      },
      {
        title: "Zero Brokerage Rental Service",
        desc: "Connect directly with verified owners and rent your flat without any extra charges. Fast booking, easy paperwork, and 100% assistance.",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/comfortable-living-room-with-gray-sofa_305343-17365_zlfzp5.avif",
      },
    ],
    bgColor: "",
    textColor: "",
  },
  blogs: {
    subtitle: "Latest post",
    title: "18Homes Real Estate Blogs",
    items: [
      {
        date: "31 January 2025",
        title: "Modern 1 BHK Flat — Interior and Space Management Ideas",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928069/3d-rendering-loft-scandinavian-living-room-with-working-table-bookshelf_105762-2162_jwxzba.avif",
      },
      {
        date: "31 January 2025",
        title: "Perfect 2 BHK for Families — Important Things Before Buying",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/cozy-living-room-with-coral-sofa_23-2152001401_mtbfyd.avif",
      },
      {
        date: "31 January 2025",
        title: "Luxury Living on a Budget — Smart Interior Tips for Small Homes",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/3d-rendering-modern-dining-room-living-room-with-luxury-decor-green-sofa_105762-2140_eu0udp.avif",
      },
      {
        date: "31 January 2025",
        title: "Important Checklist Before Renting a Home",
        img: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764928067/cozy-dining-room-modern-apartment_181624-61506_ykkcqt.avif",
      },
    ],
    bgColor: "",
    textColor: "",
  },
  instruments: {
    subtitle: "18Homes – Premium Property Solutions",
    title: "18Homes – Premium Property Solutions",
    desc1: "We provide industry standard and professional real estate services,",
    desc2: "Our team helps you choose the right property",
    desc3: "Keeping budget, location, and lifestyle in mind.",
    image: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1764948145/hotel-building-ho-chi-minh-vietnam1_wtuqyd.jpg",
    bgColor: "",
    textColor: "",
  },
  testimonials: {
    title: "What Our Clients Say",
    description: "Our simple and fast process ensures that you spend less time searching for a home and find the right property quickly.",
    items: [
      {
        text: "18Homes' service feels truly personal. They understand when and what kind of property I need. Whether I'm looking for a family home or a rental option—18Homes always provides the right suggestions.",
        name: "Jane Cooper",
        role: "Tenant",
        img: "https://res.cloudinary.com/dal5dlztv/image/upload/v1757578556/Ellipse_8_1_fr81tw.png",
      },
      {
        text: "The best experience for me was that 18Homes shows houses in the right locations without any brokerage. Their team is very professional and helpful.",
        name: "Emma Doe",
        role: "Home Buyer",
        img: "https://res.cloudinary.com/dal5dlztv/image/upload/v1757578561/Ellipse_8_fyouzw.png",
      },
      {
        text: "I needed a commercial space and 18Homes got me the perfect option. Time, budget, and location—everything was just right.",
        name: "Alex Carter",
        role: "Business Owner",
        img: "https://res.cloudinary.com/dal5dlztv/image/upload/v1757578556/Ellipse_8_1_fr81tw.png",
      },
      {
        text: "Finding a property has become extremely easy with 18Homes. The website is user-friendly and the team guides you at every step. A wonderful experience!",
        name: "Sofia Lancer",
        role: "Property Seeker",
        img: "https://res.cloudinary.com/dal5dlztv/image/upload/v1757578561/Ellipse_8_fyouzw.png",
      },
    ],
    bgColor: "",
    textColor: "",
  },
  contact: {
    title: "Please tell us your requirements",
    image: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1765125152/WhatsApp_Image_2025-12-07_at_9.01.16_PM_fuflru.jpg",
    bgColor: "",
    textColor: "",
  },
  footer: {
    logo: "https://res.cloudinary.com/dxlykgx6w/image/upload/v1765721624/18homess-removebg-preview_kqdv2j.png",
    address: "Kanak Farm House ,\nGovindPuram , Ghaziabad, (U.P.)\n201013",
    email: "18homes.website@gmail.com",
    phone: "+91 7827602246",
    phone2: "",
    phone3: "",
    copyright: "Copyright © 2025 18Homes All Rights Reserved. Design by RS & PS",
    facebook: "https://www.facebook.com/share/1AqkBeyC4R/",
    instagram: "https://www.instagram.com/18homes?igsh=amNlcWlvOTljY2E0",
    justdial: "",
    youtube: "",
    services: [
      { label: "1 RK / 1 BHK Flat", link: "" },
      { label: "2 BHK Flat", link: "" },
      { label: "3 BHK Flat", link: "" },
      { label: "4+ BHK Flat", link: "" }
    ],
    bgColor: "",
    textColor: "",
  },
};

export async function getHomepageData() {
  const mode = await ensureStoreReady();
  if (mode === "mongo") {
    let data = await Homepage.findOne({}).lean();
    if (!data) {
      data = await Homepage.create(DEFAULT_HOMEPAGE_DATA);
    }
    // Auto-migrate if database fields are missing or empty
    let updated = false;
    const updatePayload = {};
    if (!data.seo) {
      data.seo = { ...DEFAULT_HOMEPAGE_DATA.seo };
      updatePayload.seo = data.seo;
      updated = true;
    } else {
      let seoUpdated = false;
      if (data.seo.sitemapXml === undefined || data.seo.sitemapXml === "") {
        data.seo.sitemapXml = DEFAULT_HOMEPAGE_DATA.seo.sitemapXml;
        seoUpdated = true;
      }
      if (data.seo.sitemapHtml === undefined || data.seo.sitemapHtml === "") {
        data.seo.sitemapHtml = DEFAULT_HOMEPAGE_DATA.seo.sitemapHtml;
        seoUpdated = true;
      }
      if (data.seo.robotsTxt === undefined || data.seo.robotsTxt === "") {
        data.seo.robotsTxt = DEFAULT_HOMEPAGE_DATA.seo.robotsTxt;
        seoUpdated = true;
      }
      if (seoUpdated) {
        updatePayload.seo = data.seo;
        updated = true;
      }
    }
    if (!data.navbar) {
      data.navbar = { ...DEFAULT_HOMEPAGE_DATA.navbar };
      updatePayload.navbar = data.navbar;
      updated = true;
    }
    if (updated) {
      await Homepage.updateOne({}, { $set: updatePayload });
    }
    return JSON.parse(JSON.stringify(data));
  }
  
  if (!global._homepageStore) {
    global._homepageStore = { ...DEFAULT_HOMEPAGE_DATA };
  } else {
    if (!global._homepageStore.seo) {
      global._homepageStore.seo = { ...DEFAULT_HOMEPAGE_DATA.seo };
    } else {
      if (global._homepageStore.seo.sitemapXml === undefined || global._homepageStore.seo.sitemapXml === "") {
        global._homepageStore.seo.sitemapXml = DEFAULT_HOMEPAGE_DATA.seo.sitemapXml;
      }
      if (global._homepageStore.seo.sitemapHtml === undefined || global._homepageStore.seo.sitemapHtml === "") {
        global._homepageStore.seo.sitemapHtml = DEFAULT_HOMEPAGE_DATA.seo.sitemapHtml;
      }
      if (global._homepageStore.seo.robotsTxt === undefined || global._homepageStore.seo.robotsTxt === "") {
        global._homepageStore.seo.robotsTxt = DEFAULT_HOMEPAGE_DATA.seo.robotsTxt;
      }
    }
    if (!global._homepageStore.navbar) {
      global._homepageStore.navbar = { ...DEFAULT_HOMEPAGE_DATA.navbar };
    }
  }
  return global._homepageStore;
}

export async function updateHomepageData(payload) {
  const mode = await ensureStoreReady();
  if (mode === "mongo") {
    let existing = await Homepage.findOne({});
    if (!existing) {
      existing = new Homepage(DEFAULT_HOMEPAGE_DATA);
    }
    if (payload.navbar) existing.navbar = payload.navbar;
    if (payload.seo) existing.seo = payload.seo;
    if (payload.hero) existing.hero = payload.hero;
    if (payload.about) existing.about = payload.about;
    if (payload.services) existing.services = payload.services;
    if (payload.blogs) existing.blogs = payload.blogs;
    if (payload.instruments) existing.instruments = payload.instruments;
    if (payload.testimonials) existing.testimonials = payload.testimonials;
    if (payload.contact) existing.contact = payload.contact;
    if (payload.footer) existing.footer = payload.footer;

    const saved = await existing.save();
    return JSON.parse(JSON.stringify(saved.toJSON()));
  }
  
  global._homepageStore = {
    ...global._homepageStore,
    ...payload,
  };
  return global._homepageStore;
}

function normalizeDocPage(doc) {
  const json = doc.toJSON();
  return normalizeLeanPage(json);
}
