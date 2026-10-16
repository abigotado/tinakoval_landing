import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import { indexable } from './src/launch.ts';

// DEPLOY_ENV=stage builds the preview copy served under /stage/ (see
// .github/workflows/deploy.yml). Anything else is the production build.
const isStage = process.env.DEPLOY_ENV === 'stage';

export default defineConfig({
  site: 'https://tinaksenia.com',
  base: isStage ? '/stage/' : '/',
  trailingSlash: 'always',
  // No sitemap on stage (never indexed) or before launch (page is noindex).
  integrations: !isStage && indexable ? [sitemap()] : [],
});
