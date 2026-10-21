import { indexable } from './launch';

/**
 * DEPLOY_ENV=stage builds the preview copy served under /stage/ (see
 * .github/workflows/deploy.yml); anything else is production. Read at build
 * time by astro.config.mjs and the pages alike, so it is defined only here.
 */
export const isStage = process.env.DEPLOY_ENV === 'stage';

/** Stage is never indexed; production follows launch.ts. */
export const noindex = isStage || !indexable;
