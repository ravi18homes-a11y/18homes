# 18homes codebase guide

This guide maps the working parts of this repository to the files that implement them. It describes the code currently present; it is not a setup or deployment manual.

## How to trace a feature

Most features follow this path:

1. A route under `app/` selects the screen.
2. A page component (often a sibling `.jsx`) implements the interaction and presentation.
3. Client components call a same-origin `/api/...` route or a configured external service.
4. API route handlers validate/coordinate work and use `lib/` helpers or Mongoose models.
5. Shared layout/components provide navigation, tracking, and repeated UI.

For a visible change, start at its route and follow its imports. For saved data, find the API request in the screen, then the API route, then its model/store.

## Runtime and shared shell

| Area | Files | What they control |
|---|---|---|
| Next.js app shell | `app/layout.js` | Root HTML, font, global styles, analytics/checkout scripts, toaster, PWA and behavior tracking providers, floating actions and bottom taskbar. Most route pages add their own Navbar/Footer. |
| Global styles | `app/globals.css`, `styles/globals.css`, `tailwind.config.js`, `postcss.config.mjs` | Global CSS/Tailwind setup. Check which stylesheet is imported before editing. |
| Navigation and repeated chrome | `app/COMMON/Navbar.jsx`, `Footer.jsx`, `BottomTaskbar.jsx`, `FloatingActions.jsx`, `PageHeader.jsx` | Header/menu, footer, mobile toolbar, floating contact actions, and shared page title header. Navbar menu content is fetched from `/api/navbar`. |
| PWA | `components/PwaProvider.js`, `public/sw.js`, `app/manifest.js` | Install prompt handling/provider, service worker caching, and manifest metadata. |
| Config | `next.config.mjs`, `jsconfig.json`, `eslint.config.mjs`, `package.json` | Next settings, `@/` alias, lint rules, scripts and libraries. Run with `npm run dev`; build with `npm run build`; lint with `npm run lint`. |

## Public website routes

Next.js App Router maps each `app/**/page.*` file to its folder URL. Dynamic folders such as `[id]` capture a segment; `[...slug]` catches multiple path segments.

| URL / feature | Route / main implementation | Responsibility |
|---|---|---|
| `/` | `app/page.js`; `app/components/HeroSection.js`, `FilterPropertiesComp.jsx`, `HomeBuyComp.jsx`, `HomeCtaBanner.jsx`, `HomeService.js`, `HomeAbout.js`, `Blogs.js`, `InstrumentsSection.js`, `Testimonials.js`, `ContactSection.js`, `EmiCalculator.jsx` | Homepage composition and content sections. Homepage copy/settings are fetched from `lib/store.js`; the section components render them. |
| `/buy` | `app/buy/page.js`, `BuyComponent.jsx`, `Buy.jsx` | Property search/listing, filters, cards, and property actions. |
| `/buy/property-details` | `app/buy/property-details/page.js`, `PropertyDetails.jsx` | Property detail view, contact/chat actions, reviews and EMI calculator. |
| `/projects`, `/projects/[id]` | `app/projects/page.jsx`, `app/projects/[id]/page.jsx` | Project discovery and project detail. |
| `/sell` | `app/sell/page.js`, `SellComponent.jsx`, `RealEstateApp.jsx` | Property submission/listing flow. |
| `/category/[category]` | `app/category/[category]/page.js`, `app/components/FilterPropertiesComp.jsx` | Category-filtered property display. |
| `/service`, `/service/house` | `app/service/**`, `app/service/house/**` | Service listing, house service options and property type/listing UI. `app/service/MainService.jsx`, `HouseOption.jsx`, `PropertyTypes.jsx`, `PropertyListing.jsx` implement the pieces. |
| `/city` | `app/city/page.js`, `MainCity.jsx` | City landing/listing. Individual CMS city links may be rendered by the catch-all CMS route. |
| `/blog` | `app/blog/page.js`, `MainBlog.jsx` | Blog listing. The independently managed blog records also have admin/API files below. |
| `/contact` | `app/contact/page.js`, `ContactPage.jsx`, `ContactFirst.jsx`, `contact.css` | Contact page and lead/contact form. `app/components/ContactSection.js` is the homepage contact section. |
| `/login-signup` | `app/login-signup/page.js`, `LoginSignComp.jsx` | Login and registration UI; inspect its configured API base for auth backend calls. |
| `/forgot-password`, `/reset-password/[token]` | matching route folders | Password recovery UI and token reset. |
| `/dashboard` and subroutes | `app/dashboard/**` | Role-specific user, owner, builder, dealer dashboards, chats, analytics, leads and projects. `DashboardLayout.jsx` handles shared dashboard shell and access/profile checks. |
| `/edit-profile`, `/setting` | `app/edit-profile/**`, `app/setting/**` | Profile and account settings UI. |
| `/my-properties`, `/edit-property/[id]`, `/post-project` | corresponding route files | User property management/edit and project submission. |
| `/wishlist`, `/recent-history`, `/membership` | matching route files | Saved properties, viewed history, and membership/subscription UI. |
| `/about`, `/privacy-policy`, `/terms-and-conditions` | matching folders; about has `AboutPage.jsx`, `MissionVisson.jsx`, `Values.jsx` | Static informational/legal pages. |
| CMS-managed page URLs | `app/[...slug]/page.js`, `components/SectionRenderer.js` | Looks up a published page by slug, renders its sections, and handles nested page links. This is the dynamic route for CMS pages. |

Other useful shared UI in `app/components/`: `ChatModal.jsx` (chat), `PropertyReviews.jsx` (reviews), `FeaturedAgentsWidget.jsx` (agent widget), `Book.js` (booking), and `contactpop.css` (contact popup styling).

## Admin and content editing

| Area | Files | What they control |
|---|---|---|
| Admin gate and shell | `app/admin/layout.js`, `app/components/admin/AdminSidebar.jsx`, `AdminHeader.jsx` | Client-side role check against `localStorage.userData`, admin menu and shell. |
| Admin landing | `app/admin/page.js` | Admin dashboard entry page. |
| CMS page tree/editor | `app/admin/pages/page.js`, `app/admin/pages/new/page.js`, `app/admin/pages/edit/[id]/page.js`, `app/admin/pages/edit/[id]/EditPageClient.js`, `components/admin/PagesTreeList.js`, `PageEditor.js`, `SectionBuilder.js`, `RichTextEditor.js`, `SeoPanel.js`, `AdminPagesList.js` | Browse, create, edit, nest, compose sections and set SEO for CMS pages. `SectionRenderer.js` is the public rendering counterpart. |
| Homepage content | `app/admin/pages/homepage/page.js` | Admin form for homepage sections and SEO. Reads/writes `/api/homepage`; public homepage reads the same saved Homepage data. |
| Other content | `app/admin/blogs/page.js`, `cities/page.js`, `services/page.js`, `featured-ads/page.jsx` | Admin editing/ordering for these content domains. |
| Users | `app/admin/users/**`, `components/admin/UserTable.jsx`, `Pagination.jsx` | User listing, detail/edit screens and reusable table/pagination. |
| Contact leads | `app/admin/contacts/**` | Admin view of submitted contact records and details. |
| Site analytics | `app/admin/analytics/**` | Admin analytics and guest views; `/app/api/tracking/admin/**` provides the tracking data. |
| Admin utilities | `app/admin/createpage/page.js`, `app/admin/allpages/**`, `app/admin/settings/page.js`, `components/admin/ConfirmModal.jsx` | Older/secondary page tools, settings, and confirmation modal. |

The admin layout's role check is in browser storage. It controls what UI is presented, but should not be assumed to secure API endpoints; review each API handler for server-side authorization before treating data as protected.

## API routes and data ownership

Files named `route.js`/`route.jsx` under `app/api/` implement HTTP endpoints. A route file usually handles the request method and delegates to a model or helper.

| Endpoint group | Route files | Data / purpose |
|---|---|---|
| Homepage | `app/api/homepage/route.js` | GET and update homepage section/SEO data through `lib/store.js`; can synchronize `robots.txt` to `public/` when writable. |
| CMS pages | `app/api/pages/route.js`, `[id]/route.js`, `check-slug/route.js`, `system-page/route.js` | List/create/update/delete pages, check slug uniqueness, and system-page handling. Most operations use `lib/store.js`. |
| Navigation | `app/api/navbar/route.js` | Builds fixed menu entries plus dynamic services, blogs, cities and CMS pages. |
| Blogs, cities, services | `app/api/blogs/**`, `cities/**`, `services/**` | CRUD and reorder endpoints for their collections. |
| Contact and mail | `app/api/contact/route.js`, `send-view-details-email/route.js` | Contact submission and property view email handling. |
| Upload | `app/api/upload/route.js` | Upload endpoint; inspect its provider/config before changing media behavior. |
| General analytics | `app/api/analytics/track/route.js`, `analytics/builder/route.js` | Analytics event/builder tracking. |
| Visitor tracking | `app/api/tracking/event/route.js`, `heartbeat/route.js`, `identify/route.js`, `admin/{overview,live,sessions,guests,interests,timeline}/route.js` | Persists behavior events, visitor/session state and serves admin analytics. Client producer is `lib/tracker.js`, mounted by `components/TrackingProvider.jsx`. |

Property, user/authentication, subscription, project, and chat screens may call the separate application backend rather than a local `app/api` route. Search those client components for `fetch(` and `NEXT_PUBLIC_APP_DATABASE_URL` / `NEXT_PUBLIC_API_BASE_URL` to find the actual dependency. This repo does not include a standalone Express server in its source tree.

## Persistence and core models

| File | Owns |
|---|---|
| `lib/mongodb.js` | Cached Mongoose connection using `MONGO_URI`. |
| `lib/store.js` | CMS page and homepage access/updates, slug rules, navbar tree, and in-memory fallbacks. If MongoDB cannot connect, it switches to process-memory storage; that fallback is temporary and not durable across restarts. |
| `models/Page.js` | CMS page title/menu/parent/slug/status/sections/SEO. Unique `slug` is central to catch-all page routing. |
| `models/Homepage.js` | Homepage sections, navbar config, footer config, SEO and their defaults. |
| `models/Blog.js`, `City.js`, `Service.js` | Blog, city, and service records, including active/order fields. |
| `models/Analytics.js` | General analytics records. |
| `models/Visitor.js`, `Session.js`, `TrackingEvent.js` | Behavioral tracking identities, sessions, event history and allowed event types. |

For public page content: `/` → `getHomepageData()` → `Homepage`; CMS URL → `getPageBySlug()` → `Page` → `SectionRenderer`. City records and CMS pages are partially synchronized in `lib/store.js` (city pages can be created from City entries and vice versa), so check that helper before changing city URL behavior.

## Styling and static assets

- `app/globals.css` is imported by the root layout and is the main global styling entry.
- `app/contact/contact.css` and `app/components/contactpop.css` are local stylesheets for contact UI.
- `public/` holds static files served from the site root, including `sw.js`, `robots.txt`, icons and uploaded/static assets.
- `app/sitemap.xml/route.js`, `app/sitemap.html/route.js`, and `app/robots.txt/route.js` generate SEO endpoints using homepage/page data. `app/manifest.js` generates the web app manifest.

## Repository-only/support files

- `.env.example` documents environment variable names. Configure real values in a local environment file; never publish database credentials or signing/payment secrets.
- `scratch/` contains one-off database, API, tracking, and image/fav-icon scripts. They are not app routes and are not imported by production UI.
- `.next/` and `node_modules/` are generated/dependency folders, not application source. `package-lock.json` pins dependency resolution.

## Common change recipes

- **Change a homepage section's appearance:** edit the matching `app/components/*` renderer; change its editable default/schema in `lib/store.js` and `models/Homepage.js` only if its stored shape changes; update `app/admin/pages/homepage/page.js` if the admin editor needs new fields.
- **Add a CMS section type:** update the editor controls in `components/admin/SectionBuilder.js`, persisted section shape as needed in `models/Page.js`, and public rendering in `components/SectionRenderer.js`.
- **Change a public URL/page:** inspect the matching `app/**/page.*` route. For CMS URLs, inspect slug generation and route lookup in `lib/store.js` plus `app/[...slug]/page.js`.
- **Change a collection:** trace admin screen → `app/api/<collection>` → `models/<Collection>.js`; check `/api/navbar` if the collection appears in navigation.
- **Change tracking:** add/adjust client event creation in `lib/tracker.js` or its UI call site, validate/store in `app/api/tracking/event/route.js` and `models/TrackingEvent.js`, then update admin query/API and dashboard view if the event should appear in reports.
- **Change user-facing authentication or property behavior:** start at its route/component and follow the external API URL it calls. Do not assume those data operations are implemented in this repository.

## Environment names seen in the repository

`MONGO_URI` is used by `lib/mongodb.js`. Client-side backend requests use `NEXT_PUBLIC_APP_DATABASE_URL` and/or `NEXT_PUBLIC_API_BASE_URL` (defaults in some components point at `http://localhost:5000`). `.env.example` also lists payment configuration. Treat all actual `.env` contents as secrets and do not copy them into documentation or commits.
