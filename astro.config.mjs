import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import { isStage, noindex } from './src/config.ts';

export default defineConfig({
  site: 'https://tinaksenia.com',
  base: isStage ? '/stage/' : '/',
  trailingSlash: 'always',
  // No sitemap for pages that are not indexed (stage, or before launch).
  integrations: noindex ? [] : [sitemap()],
  build: { inlineStylesheets: 'always' },
  // The CSS minifier (Lightning CSS) would otherwise emit media query range
  // syntax, which Safari before 16.4 ignores (iPhones stuck on iOS 15).
  vite: { build: { cssTarget: ['safari15', 'chrome100', 'firefox100'] } },
});
