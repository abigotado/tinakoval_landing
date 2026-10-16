import type { APIRoute } from 'astro';

import { indexable, isStage } from '../config';

// Only the production build's robots.txt is served (it lives at the site root).
// /stage/ is deliberately not disallowed: crawlers must be able to fetch stage
// pages to see their noindex meta. Stage is also never in the sitemap.
export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Allow: /',
      ...(isStage || !indexable
        ? []
        : ['', 'Sitemap: https://tinaksenia.com/sitemap-index.xml']),
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
