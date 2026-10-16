# tinakoval_landing

Landing page for Ксения Коваленко, психолог. Static Astro site published at
https://tinaksenia.com. This file is the canonical agent/contributor guide;
`CLAUDE.md` just imports it.

## Stack

- Astro 7 (static output, no SSR), TypeScript strict, npm.
- Node 24 LTS, pinned in `.nvmrc` and `package.json` `engines`.
- Prettier (+ `prettier-plugin-astro`), `astro check`, `@astrojs/sitemap`,
  Lighthouse CI (`lighthouserc.json`).
- Hosting: GitHub Pages via Actions. Fallback: Yandex Object Storage, so keep
  the build host-agnostic (plain `dist/`, no Pages-specific runtime).

## Commands

```bash
nvm use                 # Node 24
npm ci
npm run dev             # local dev server
npm run format:check    # prettier (npm run format to fix)
npm run check           # astro check (types)
npm run build           # static build into dist/
npx lhci autorun        # Lighthouse on dist/ (needs Chrome)
```

Before finishing any change run: `npm run format:check && npm run check && npm run build`.

## Branches and releases

- `feature/*`, `fix/*`, `chore/*` branch from `stage` and are **squash-merged**
  into `stage` through a PR. Never commit directly to `stage` or `main`.
- PR title = Conventional Commits (`feat: …`, `fix: …`, `chore: …`), because the
  squash makes it the commit message on `stage`.
- `stage` deploys to `https://tinaksenia.com/stage/` (noindex).
- Release: Actions → **Release** → choose `patch|minor|major`. It checks the
  last deploy of `stage` is green, fast-forwards `main` to `stage`, tags
  `vX.Y.Z`, publishes a GitHub Release and deploys production. Owner only.
  Use `major` for the public launch (`v1.0.0`).
- Deploy rebuilds both branches on every push to either, using the `deploy.yml`
  of the pushed branch. So a change to `deploy.yml` affects production as soon
  as it lands on `stage`, not at the next release. Review those PRs carefully.

## Content and privacy rules

- Never publish the diploma appendix PDF or any personal data (documents,
  phone, address, client details, photos of clients).
- No analytics or tracking scripts without a consent banner first.
- No Google Fonts CDN or any third-party font/script CDN. Self-host fonts
  (files in `public/fonts`, `@font-face` in our CSS).
- Wording: она **психолог**. Never call her «психотерапевт», and never promise
  treatment, cure or guaranteed results.
- The site stays `noindex` until launch (`src/config.ts` → `indexable`). At
  launch also drop `skipAudits` from `lighthouserc.json`.

## Conventions

- Page markup comes from the approved Claude Design mockups; do not invent
  design. Current `src/pages/index.astro` is a placeholder.
- All pages use `src/layouts/Base.astro` (`lang="ru"`, meta, robots).
- Use `import.meta.env.BASE_URL` for asset URLs, since stage is served under
  `/stage/`.
- Keep it small: no extra tooling (hooks, linters, link checkers) without a
  reason agreed with the owner.
