import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// DEPLOY_ENV=stage builds the preview copy served under /stage/ (see
// .github/workflows/deploy.yml). Anything else is the production build.
const isStage = process.env.DEPLOY_ENV === 'stage';

export default defineConfig({
  site: 'https://tinaksenia.com',
  base: isStage ? '/stage/' : '/',
  trailingSlash: 'always',
  // The stage copy is never indexed, so it gets no sitemap.
  integrations: isStage ? [] : [sitemap()],
});
