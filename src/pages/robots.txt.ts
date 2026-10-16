import type { APIRoute } from 'astro';

import { isStage } from '../config';

// Only the production build's robots.txt is served (it lives at the site root).
export const GET: APIRoute = () =>
  new Response(
    [
      'User-agent: *',
      'Disallow: /stage/',
      ...(isStage
        ? []
        : ['', 'Sitemap: https://tinaksenia.com/sitemap-index.xml']),
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
