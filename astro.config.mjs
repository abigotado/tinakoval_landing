import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import { isStage, noindex } from './src/config.ts';

export default defineConfig({
  site: 'https://tinaksenia.com',
  base: isStage ? '/stage/' : '/',
  trailingSlash: 'always',
  // No sitemap for pages that are not indexed (stage, or before launch).
  integrations: noindex ? [] : [sitemap()],
});
