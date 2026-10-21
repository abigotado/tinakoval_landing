// The .ts extension lets Node load astro.config.mjs natively (no Vite fallback).
import { indexable } from './launch.ts';

/**
 * DEPLOY_ENV=stage builds the preview copy served under /stage/ (see
 * .github/workflows/deploy.yml); anything else is production. Read at build
 * time by astro.config.mjs and the pages alike, so it is defined only here.
 * Build-time only: never import this module from a client <script>, where
 * `process` does not exist.
 */
export const isStage = process.env.DEPLOY_ENV === 'stage';

/** Stage is never indexed; production follows launch.ts. */
export const noindex = isStage || !indexable;
