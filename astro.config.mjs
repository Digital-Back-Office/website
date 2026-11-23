import { defineConfig } from 'astro/config';

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: 'https://digitalbackoffice.co.uk',
  // GitHub Pages serves every route as a directory index and 301-redirects the
  // slashless form (/about-us -> /about-us/), so the trailing slash is the real
  // URL of every page. Declaring it here keeps dev route matching, Astro.url
  // and the canonical tags in Layout.astro agreeing with what production serves.
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  integrations: [
    mdx()
  ],
  // Dev/preview only (no effect on the static build). Vite blocks requests
  // whose Host header is not localhost; allow Vercel Sandbox URLs
  // (sb-*.vercel.run, a new subdomain per sandbox) so Sitepins can load the site.
  vite: {
    server: {
      allowedHosts: ['.vercel.run']
    },
    preview: {
      allowedHosts: ['.vercel.run']
    }
  }
});
