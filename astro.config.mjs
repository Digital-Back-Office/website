import { defineConfig } from 'astro/config';

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://www.digitalbackoffice.co.uk',
  buildOptions: {
    baseUrl: '/src/'
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/draft'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ]
});