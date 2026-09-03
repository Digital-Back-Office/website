import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * The XML sitemap, in the same shape as the one dataflow.zone serves: a single
 * flat <urlset> with changefreq and priority on every entry.
 *
 * robots.txt used to advertise /sitemap-index.xml, which never existed —
 * @astrojs/sitemap is in package.json but was never added to the integrations
 * list, so nothing generated it. This route replaces that dead link.
 *
 * Every path carries a trailing slash, matching `trailingSlash: 'always'` in
 * astro.config.mjs, the canonical tags Layout.astro emits, and what GitHub
 * Pages actually serves — it 301-redirects the slashless form. A sitemap URL
 * that disagrees with the canonical on the page it points at is a wasted crawl,
 * so `withSlash` below enforces the rule rather than trusting each entry.
 */
const STATIC_ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/services/", changefreq: "monthly", priority: "0.8" },
  { path: "/blog/1/", changefreq: "weekly", priority: "0.8" },
  { path: "/industry-insights/", changefreq: "weekly", priority: "0.8" },
  { path: "/events/", changefreq: "weekly", priority: "0.8" },
  { path: "/about-us/", changefreq: "monthly", priority: "0.7" },
  { path: "/contact-us/", changefreq: "monthly", priority: "0.7" },
  { path: "/partners/", changefreq: "monthly", priority: "0.6" },
  { path: "/startups/", changefreq: "monthly", priority: "0.6" },
  { path: "/sitemap/", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy-policy/", changefreq: "yearly", priority: "0.4" },
  { path: "/terms-of-use/", changefreq: "yearly", priority: "0.4" },
  { path: "/legal/", changefreq: "yearly", priority: "0.4" },
  { path: "/legal-slavery/", changefreq: "yearly", priority: "0.4" },
];

/**
 * The .mdx pages under src/pages are routes in their own right, so they are
 * read straight off disk rather than listed by hand — a new post or service
 * page can't be left orphaned. /404 is not globbed and stays out.
 */
const posts = import.meta.glob<{ frontmatter: { date?: string } }>("./posts/*.mdx", {
  eager: true,
});
const services = import.meta.glob("./services/*.mdx", { eager: true });

/** Mirrors the canonical rule in Layout.astro: directory routes end in a slash. */
const withSlash = (path: string) =>
  path.endsWith("/") || /\.[a-z0-9]+$/i.test(path) ? path : `${path}/`;

/** "./posts/my-post.mdx" -> "/posts/my-post/" */
const toRoutePath = (globKey: string) => `${globKey.replace(/^\.\/(.*)\.mdx$/, "/$1")}/`;

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const urlRow = (
  origin: string,
  route: { path: string; changefreq: string; priority: string; lastmod?: string }
) => {
  const loc = escapeXml(`${origin}${withSlash(route.path)}`);
  const lastmod = route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : "";
  return `<url><loc>${loc}</loc>${lastmod}<changefreq>${route.changefreq}</changefreq><priority>${route.priority}</priority></url>`;
};

export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.toString() ?? "https://digitalbackoffice.co.uk").replace(/\/$/, "");

  // Newest first, matching the order the blog index paginates in.
  const postRoutes = Object.entries(posts)
    .map(([key, mod]) => {
      const date = mod.frontmatter?.date ? new Date(mod.frontmatter.date) : null;
      return {
        path: toRoutePath(key),
        changefreq: "monthly",
        priority: "0.7",
        lastmod:
          date && !Number.isNaN(date.getTime()) ? date.toISOString().split("T")[0] : undefined,
      };
    })
    .sort((a, b) => (b.lastmod ?? "").localeCompare(a.lastmod ?? ""));

  const serviceRoutes = Object.keys(services).map((key) => ({
    path: toRoutePath(key),
    changefreq: "monthly",
    priority: "0.8",
  }));

  const industries = await getCollection("industries");
  const industryRoutes = industries.map((industry) => ({
    path: `/industry/${industry.slug}/`,
    changefreq: "monthly",
    priority: "0.7",
  }));

  const xmlRows = [...STATIC_ROUTES, ...serviceRoutes, ...industryRoutes, ...postRoutes]
    .map((route) => urlRow(origin, route))
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlRows}</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
